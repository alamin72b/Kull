import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DebugNoteSeverity,
  DebugNoteStatus,
  Prisma,
} from '../generated/prisma/client';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateDebugNoteDto } from './dto/create-debug-note.dto';
import { QueryDebugNotesDto } from './dto/query-debug-notes.dto';
import { UpdateDebugNoteDto } from './dto/update-debug-note.dto';
import { DEBUG_NOTE_UPLOAD_DIRECTORY } from './debug-note-upload.config';

const debugNoteInclude = {
  tags: {
    include: {
      tag: true,
    },
  },
  screenshots: {
    orderBy: {
      createdAt: 'asc',
    },
  },
} satisfies Prisma.DebugNoteInclude;

type DebugNoteWithRelations = Prisma.DebugNoteGetPayload<{
  include: typeof debugNoteInclude;
}>;

interface ParsedTag {
  name: string;
  normalizedName: string;
}

@Injectable()
export class DebugNotesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryDebugNotesDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;
    const search = query.q?.trim();

    const where: Prisma.DebugNoteWhereInput = {
      status: query.status,
      severity: query.severity,

      tags: query.tag
        ? {
            some: {
              tag: {
                normalizedName: query.tag.trim().toLowerCase(),
              },
            },
          }
        : undefined,

      OR: search
        ? [
            {
              title: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              summary: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              errorMessage: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              context: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              rootCause: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              solution: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              findings: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              learnings: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              thoughts: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              tags: {
                some: {
                  tag: {
                    name: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
              },
            },
          ]
        : undefined,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.debugNote.findMany({
        where,
        include: debugNoteInclude,
        orderBy: [
          {
            isPinned: 'desc',
          },
          {
            updatedAt: 'desc',
          },
        ],
        skip,
        take: limit,
      }),

      this.prisma.debugNote.count({
        where,
      }),
    ]);

    return {
      items: items.map((note) => this.presentNote(note)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findTags() {
    return this.prisma.debugTag.findMany({
      where: {
        notes: {
          some: {},
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const note = await this.findRawNote(id);

    return this.presentNote(note);
  }

  async create(dto: CreateDebugNoteDto, files: Express.Multer.File[] = []) {
    const status = dto.status ?? DebugNoteStatus.UNSOLVED;

    if (status === DebugNoteStatus.SOLVED && !dto.solution?.trim()) {
      await this.deleteUploadedFiles(files);

      throw new BadRequestException(
        'A solved debug note must include its solution.',
      );
    }

    const tags = this.parseTags(dto.tags);
    const captions = this.parseCaptionArray(
      dto.screenshotCaptions,
      files.length,
    );

    try {
      const note = await this.prisma.debugNote.create({
        data: {
          title: dto.title.trim(),
          summary: this.nullableText(dto.summary),
          status,
          severity: dto.severity ?? DebugNoteSeverity.MEDIUM,
          errorMessage: dto.errorMessage.trim(),
          context: this.nullableText(dto.context),
          stepsToReproduce: this.nullableText(dto.stepsToReproduce),
          environment: this.nullableText(dto.environment),
          attemptedSolutions: this.nullableText(dto.attemptedSolutions),
          rootCause: this.nullableText(dto.rootCause),
          solution: this.nullableText(dto.solution),
          codeSnippet: this.nullableText(dto.codeSnippet),
          verification: this.nullableText(dto.verification),
          findings: this.nullableText(dto.findings),
          learnings: this.nullableText(dto.learnings),
          thoughts: this.nullableText(dto.thoughts),
          references: this.nullableText(dto.references),
          occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : null,
          isPinned: dto.isPinned === 'true',

          tags: tags.length
            ? {
                create: this.createTagLinks(tags),
              }
            : undefined,

          screenshots: files.length
            ? {
                create: files.map((file, index) => ({
                  originalName: file.originalname,
                  fileName: file.filename,
                  mimeType: file.mimetype,
                  size: file.size,
                  caption: captions[index] || null,
                })),
              }
            : undefined,
        },
        include: debugNoteInclude,
      });

      return this.presentNote(note);
    } catch (error) {
      await this.deleteUploadedFiles(files);
      throw error;
    }
  }

  async update(
    id: string,
    dto: UpdateDebugNoteDto,
    files: Express.Multer.File[] = [],
  ) {
    const existingNote = await this.findRawNote(id);

    const nextStatus = dto.status ?? existingNote.status;
    const nextSolution =
      dto.solution !== undefined
        ? this.nullableText(dto.solution)
        : existingNote.solution;

    if (nextStatus === DebugNoteStatus.SOLVED && !nextSolution?.trim()) {
      await this.deleteUploadedFiles(files);

      throw new BadRequestException(
        'A solved debug note must include its solution.',
      );
    }

    const removedScreenshotIds = this.parseStringArray(
      dto.removedScreenshotIds,
      'removed screenshot IDs',
      5,
    );

    const existingScreenshotCaptions = this.parseCaptionMap(
      dto.existingScreenshotCaptions,
    );

    const existingScreenshotIds = new Set(
      existingNote.screenshots.map((screenshot) => screenshot.id),
    );

    for (const screenshotId of removedScreenshotIds) {
      if (!existingScreenshotIds.has(screenshotId)) {
        await this.deleteUploadedFiles(files);

        throw new BadRequestException(
          'One of the screenshots does not belong to this debug note.',
        );
      }
    }

    for (const screenshotId of Object.keys(existingScreenshotCaptions)) {
      if (!existingScreenshotIds.has(screenshotId)) {
        await this.deleteUploadedFiles(files);

        throw new BadRequestException(
          'One of the screenshot captions is invalid.',
        );
      }
    }

    const removedScreenshotIdSet = new Set(removedScreenshotIds);

    const remainingScreenshotCount =
      existingNote.screenshots.length -
      removedScreenshotIdSet.size +
      files.length;

    if (remainingScreenshotCount > 5) {
      await this.deleteUploadedFiles(files);

      throw new BadRequestException(
        'A debug note can contain a maximum of 5 screenshots.',
      );
    }

    const newCaptions = this.parseCaptionArray(
      dto.screenshotCaptions,
      files.length,
    );

    const data: Prisma.DebugNoteUpdateInput = {};

    if (dto.title !== undefined) {
      data.title = dto.title.trim();
    }

    if (dto.summary !== undefined) {
      data.summary = this.nullableText(dto.summary);
    }

    if (dto.status !== undefined) {
      data.status = dto.status;
    }

    if (dto.severity !== undefined) {
      data.severity = dto.severity;
    }

    if (dto.errorMessage !== undefined) {
      data.errorMessage = dto.errorMessage.trim();
    }

    if (dto.context !== undefined) {
      data.context = this.nullableText(dto.context);
    }

    if (dto.stepsToReproduce !== undefined) {
      data.stepsToReproduce = this.nullableText(dto.stepsToReproduce);
    }

    if (dto.environment !== undefined) {
      data.environment = this.nullableText(dto.environment);
    }

    if (dto.attemptedSolutions !== undefined) {
      data.attemptedSolutions = this.nullableText(dto.attemptedSolutions);
    }

    if (dto.rootCause !== undefined) {
      data.rootCause = this.nullableText(dto.rootCause);
    }

    if (dto.solution !== undefined) {
      data.solution = this.nullableText(dto.solution);
    }

    if (dto.codeSnippet !== undefined) {
      data.codeSnippet = this.nullableText(dto.codeSnippet);
    }

    if (dto.verification !== undefined) {
      data.verification = this.nullableText(dto.verification);
    }

    if (dto.findings !== undefined) {
      data.findings = this.nullableText(dto.findings);
    }

    if (dto.learnings !== undefined) {
      data.learnings = this.nullableText(dto.learnings);
    }

    if (dto.thoughts !== undefined) {
      data.thoughts = this.nullableText(dto.thoughts);
    }

    if (dto.references !== undefined) {
      data.references = this.nullableText(dto.references);
    }

    if (dto.occurredAt !== undefined) {
      data.occurredAt = dto.occurredAt ? new Date(dto.occurredAt) : null;
    }

    if (dto.isPinned !== undefined) {
      data.isPinned = dto.isPinned === 'true';
    }

    if (dto.tags !== undefined) {
      const tags = this.parseTags(dto.tags);

      data.tags = {
        deleteMany: {},
        create: this.createTagLinks(tags),
      };
    }

    const screenshotUpdates: Prisma.DebugScreenshotUpdateManyWithoutDebugNoteNestedInput =
      {};

    if (removedScreenshotIds.length) {
      screenshotUpdates.deleteMany = {
        id: {
          in: removedScreenshotIds,
        },
      };
    }

    const captionUpdates = Object.entries(existingScreenshotCaptions)
      .filter(([screenshotId]) => !removedScreenshotIdSet.has(screenshotId))
      .map(([screenshotId, caption]) => ({
        where: {
          id: screenshotId,
        },
        data: {
          caption: this.nullableText(caption),
        },
      }));

    if (captionUpdates.length) {
      screenshotUpdates.update = captionUpdates;
    }

    if (files.length) {
      screenshotUpdates.create = files.map((file, index) => ({
        originalName: file.originalname,
        fileName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        caption: newCaptions[index] || null,
      }));
    }

    if (removedScreenshotIds.length || captionUpdates.length || files.length) {
      data.screenshots = screenshotUpdates;
    }

    const removedScreenshots = existingNote.screenshots.filter((screenshot) =>
      removedScreenshotIdSet.has(screenshot.id),
    );

    try {
      const updatedNote = await this.prisma.debugNote.update({
        where: {
          id,
        },
        data,
        include: debugNoteInclude,
      });

      await this.deleteStoredScreenshots(removedScreenshots);

      if (dto.tags !== undefined) {
        await this.removeUnusedTags();
      }

      return this.presentNote(updatedNote);
    } catch (error) {
      await this.deleteUploadedFiles(files);
      throw error;
    }
  }

  async remove(id: string) {
    const note = await this.findRawNote(id);

    await this.prisma.debugNote.delete({
      where: {
        id,
      },
    });

    await this.deleteStoredScreenshots(note.screenshots);
    await this.removeUnusedTags();
  }

  private async findRawNote(id: string) {
    const note = await this.prisma.debugNote.findUnique({
      where: {
        id,
      },
      include: debugNoteInclude,
    });

    if (!note) {
      throw new NotFoundException('Debug note not found.');
    }

    return note;
  }

  private presentNote(note: DebugNoteWithRelations) {
    const { tags, screenshots, ...noteFields } = note;

    return {
      ...noteFields,

      tags: tags
        .map((noteTag) => noteTag.tag)
        .sort((first, second) => first.name.localeCompare(second.name)),

      screenshots: screenshots.map((screenshot) => ({
        ...screenshot,
        url: `/uploads/debug-notes/${screenshot.fileName}`,
      })),
    };
  }

  private parseTags(value?: string): ParsedTag[] {
    const values = this.parseStringArray(value, 'tags', 10);
    const uniqueTags = new Map<string, ParsedTag>();

    for (const rawTag of values) {
      const name = rawTag.trim().replace(/\s+/g, ' ');

      if (!name) {
        continue;
      }

      if (name.length > 50) {
        throw new BadRequestException(
          'Each tag must be 50 characters or fewer.',
        );
      }

      const normalizedName = name.toLowerCase();

      if (!uniqueTags.has(normalizedName)) {
        uniqueTags.set(normalizedName, {
          name,
          normalizedName,
        });
      }
    }

    return [...uniqueTags.values()];
  }

  private parseStringArray(
    value: string | undefined,
    label: string,
    maximumItems: number,
  ): string[] {
    if (!value) {
      return [];
    }

    try {
      const parsed: unknown = JSON.parse(value);

      if (
        !Array.isArray(parsed) ||
        parsed.some((item) => typeof item !== 'string')
      ) {
        throw new Error('Invalid array');
      }

      if (parsed.length > maximumItems) {
        throw new BadRequestException(
          `A maximum of ${maximumItems} ${label} is allowed.`,
        );
      }

      return parsed as string[];
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        `${label} must be a valid JSON string array.`,
      );
    }
  }

  private parseCaptionArray(
    value: string | undefined,
    expectedLength: number,
  ): string[] {
    const captions = this.parseStringArray(value, 'screenshot captions', 5);

    if (captions.length > expectedLength) {
      throw new BadRequestException(
        'There are more captions than uploaded screenshots.',
      );
    }

    return Array.from(
      {
        length: expectedLength,
      },
      (_, index) => captions[index]?.trim().slice(0, 200) ?? '',
    );
  }

  private parseCaptionMap(value?: string): Record<string, string> {
    if (!value) {
      return {};
    }

    try {
      const parsed: unknown = JSON.parse(value);

      if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
        throw new Error('Invalid caption map');
      }

      const captions: Record<string, string> = {};

      for (const [id, caption] of Object.entries(parsed)) {
        if (typeof caption !== 'string') {
          throw new Error('Invalid caption');
        }

        if (caption.length > 200) {
          throw new BadRequestException(
            'Screenshot captions must be 200 characters or fewer.',
          );
        }

        captions[id] = caption;
      }

      return captions;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        'Existing screenshot captions must be a valid JSON object.',
      );
    }
  }

  private createTagLinks(tags: ParsedTag[]) {
    return tags.map((tag) => ({
      tag: {
        connectOrCreate: {
          where: {
            normalizedName: tag.normalizedName,
          },
          create: {
            name: tag.name,
            normalizedName: tag.normalizedName,
          },
        },
      },
    }));
  }

  private nullableText(value?: string | null) {
    if (value === undefined || value === null) {
      return null;
    }

    const cleaned = value.trim();

    return cleaned.length ? cleaned : null;
  }

  private async deleteUploadedFiles(files: Express.Multer.File[]) {
    await this.deletePaths(
      files.map((file) => join(DEBUG_NOTE_UPLOAD_DIRECTORY, file.filename)),
    );
  }

  private async deleteStoredScreenshots(
    screenshots: Array<{ fileName: string }>,
  ) {
    await this.deletePaths(
      screenshots.map((screenshot) =>
        join(DEBUG_NOTE_UPLOAD_DIRECTORY, screenshot.fileName),
      ),
    );
  }

  private async deletePaths(paths: string[]) {
    await Promise.allSettled(paths.map((path) => fs.unlink(path)));
  }

  private async removeUnusedTags() {
    await this.prisma.debugTag.deleteMany({
      where: {
        notes: {
          none: {},
        },
      },
    });
  }
}
