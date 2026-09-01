import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Readable } from 'node:stream';
import type { Express } from 'express';

import type {
  ImportantDocument,
  ImportantDocumentsPage,
  ImportantDocumentRoot,
  ImportantDocumentSortBy,
  SortDirection,
} from '@kull/contracts';

import { DriveService } from '../drive/drive.service';

const FEATURE_KEY = 'kullFeature';
const FEATURE_VALUE = 'important-documents';
const ROOT_KEY = 'kullRootId';
const FOLDER_PATH_KEY = 'kullFolderPath';
const MAX_SEARCH_RESULTS = 1000;

@Injectable()
export class ImportantDocumentsService {
  constructor(private readonly driveService: DriveService) {}

  private escapeQueryValue(value: string) {
    return value.replace(/\\\\/g, '\\\\\\\\').replace(/'/g, "\\\\'");
  }

  private cleanFileName(fileName: string) {
    const value = fileName.trim();

    if (
      !value ||
      value.length > 255 ||
      value === '.' ||
      value === '..' ||
      value.includes('/') ||
      value.includes('\\\\') ||
      value.includes('\\0')
    ) {
      throw new BadRequestException(
        'Enter a valid file name without folder separators.',
      );
    }

    return value;
  }

  private destinationPath(rootFolderPath: string, folderPath?: string) {
    const root = this.driveService.cleanFolderPath(rootFolderPath);

    if (!folderPath?.trim()) {
      return root;
    }

    return root + '/' + this.driveService.cleanFolderPath(folderPath);
  }

  private async getExistingRoot(userId: string, rootFolderPath: string) {
    const root = await this.driveService.resolveFolderPath(
      userId,
      rootFolderPath,
      false,
    );

    if (!root.folderId) {
      throw new NotFoundException(
        'The selected root folder does not exist. Prepare it first.',
      );
    }

    return root;
  }

  async prepareRoot(
    userId: string,
    rootFolderPath: string,
  ): Promise<ImportantDocumentRoot> {
    const root = await this.driveService.resolveFolderPath(
      userId,
      rootFolderPath,
      true,
    );

    return {
      rootFolderId: root.folderId!,
      rootFolderPath: root.folderPath,
      createdFolders: root.createdFolders,
    };
  }

  private async findDuplicate(
    userId: string,
    parentId: string,
    fileName: string,
    exceptId?: string,
  ) {
    const drive = await this.driveService.getDriveClient(userId);
    const response = await drive.files.list({
      q: [
        "'" + parentId + "' in parents",
        "name = '" + this.escapeQueryValue(fileName) + "'",
        "mimeType != 'application/vnd.google-apps.folder'",
        'trashed = false',
      ].join(' and '),
      fields: 'files(id)',
      pageSize: 10,
    });

    return (response.data.files ?? []).some(
      (file) => file.id && file.id !== exceptId,
    );
  }

  private toDocument(file: {
    id?: string | null;
    name?: string | null;
    mimeType?: string | null;
    size?: string | null;
    createdTime?: string | null;
    modifiedTime?: string | null;
    webViewLink?: string | null;
    appProperties?: Record<string, string> | null;
  }): ImportantDocument {
    return {
      id: file.id!,
      name: file.name ?? 'Untitled document',
      mimeType: file.mimeType ?? 'application/octet-stream',
      size: file.size ?? undefined,
      createdTime: file.createdTime ?? undefined,
      modifiedTime: file.modifiedTime ?? undefined,
      webViewLink: file.webViewLink ?? undefined,
      folderPath: file.appProperties?.[FOLDER_PATH_KEY] ?? '',
    };
  }

  private async getManagedDocument(
    userId: string,
    rootFolderPath: string,
    documentId: string,
  ) {
    const root = await this.getExistingRoot(userId, rootFolderPath);
    const drive = await this.driveService.getDriveClient(userId);
    let file;

    try {
      const response = await drive.files.get({
        fileId: documentId,
        fields: [
          'id',
          'name',
          'mimeType',
          'parents',
          'trashed',
          'appProperties',
          'webViewLink',
          'size',
          'createdTime',
          'modifiedTime',
        ].join(','),
      });
      file = response.data;
    } catch {
      throw new NotFoundException('Document was not found.');
    }

    if (
      file.trashed ||
      file.mimeType === 'application/vnd.google-apps.folder' ||
      file.appProperties?.[FEATURE_KEY] !== FEATURE_VALUE ||
      file.appProperties?.[ROOT_KEY] !== root.folderId
    ) {
      throw new NotFoundException(
        'Document was not found in the selected root folder.',
      );
    }

    return {
      drive,
      root,
      file,
    };
  }

  async upload(
    userId: string,
    file: Express.Multer.File,
    input: {
      rootFolderPath: string;
      folderPath?: string;
      fileName: string;
      confirmed: string;
    },
  ) {
    if (input.confirmed !== 'true') {
      throw new BadRequestException(
        'Confirm the destination before uploading.',
      );
    }

    if (!file || file.size === 0) {
      throw new BadRequestException('Choose a non-empty document.');
    }

    const fileName = this.cleanFileName(input.fileName);
    const targetPath = this.destinationPath(
      input.rootFolderPath,
      input.folderPath,
    );
    const root = await this.prepareRoot(userId, input.rootFolderPath);
    const destination = await this.driveService.resolveFolderPath(
      userId,
      targetPath,
      true,
    );

    if (await this.findDuplicate(userId, destination.folderId!, fileName)) {
      throw new BadRequestException(
        'A document with this name already exists in that folder.',
      );
    }

    const drive = await this.driveService.getDriveClient(userId);
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [destination.folderId!],
        appProperties: {
          [FEATURE_KEY]: FEATURE_VALUE,
          [ROOT_KEY]: root.rootFolderId,
          [FOLDER_PATH_KEY]: targetPath,
        },
      },
      media: {
        mimeType: file.mimetype || 'application/octet-stream',
        body: Readable.from(file.buffer),
      },
      fields: [
        'id',
        'name',
        'mimeType',
        'size',
        'createdTime',
        'modifiedTime',
        'webViewLink',
        'appProperties',
      ].join(','),
    });

    return this.toDocument(response.data);
  }

  async list(
    userId: string,
    input: {
      rootFolderPath: string;
      query?: string;
      sortBy?: ImportantDocumentSortBy;
      sortDirection?: SortDirection;
      page?: number;
      pageSize?: number;
    },
  ): Promise<ImportantDocumentsPage> {
    const root = await this.getExistingRoot(userId, input.rootFolderPath);
    const drive = await this.driveService.getDriveClient(userId);
    const query = input.query?.trim();
    const clauses = [
      "appProperties has { key='" +
        FEATURE_KEY +
        "' and value='" +
        FEATURE_VALUE +
        "' }",
      "appProperties has { key='" +
        ROOT_KEY +
        "' and value='" +
        root.folderId +
        "' }",
      "mimeType != 'application/vnd.google-apps.folder'",
      'trashed = false',
    ];

    if (query) {
      clauses.push("name contains '" + this.escapeQueryValue(query) + "'");
    }

    const response = await drive.files.list({
      q: clauses.join(' and '),
      fields: [
        'nextPageToken',
        'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,appProperties)',
      ].join(','),
      pageSize: MAX_SEARCH_RESULTS,
      spaces: 'drive',
    });

    const sortBy = input.sortBy ?? 'date';
    const direction = input.sortDirection ?? 'desc';
    const documents = (response.data.files ?? [])
      .filter((file) => file.id)
      .map((file) => this.toDocument(file));

    documents.sort((left, right) => {
      let comparison = 0;

      if (sortBy === 'name') {
        comparison = left.name.localeCompare(right.name);
      } else if (sortBy === 'type') {
        comparison = left.mimeType.localeCompare(right.mimeType);
      } else {
        comparison = (left.modifiedTime ?? '').localeCompare(
          right.modifiedTime ?? '',
        );
      }

      return direction === 'asc' ? comparison : -comparison;
    });

    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 20;
    const start = (page - 1) * pageSize;

    return {
      documents: documents.slice(start, start + pageSize),
      page,
      pageSize,
      total: documents.length,
      totalPages: Math.max(1, Math.ceil(documents.length / pageSize)),
      hasNextPage: start + pageSize < documents.length,
      truncated: Boolean(response.data.nextPageToken),
    };
  }

  async update(
    userId: string,
    documentId: string,
    input: {
      rootFolderPath: string;
      fileName?: string;
      folderPath?: string;
    },
  ) {
    const managed = await this.getManagedDocument(
      userId,
      input.rootFolderPath,
      documentId,
    );
    const currentParentId = managed.file.parents?.[0];
    const currentParentIds = managed.file.parents ?? [];

    if (!currentParentId) {
      throw new BadRequestException(
        'The document does not have a Drive folder.',
      );
    }

    const update: {
      name?: string;
      appProperties?: Record<string, string>;
    } = {};
    let addParents: string | undefined;
    let removeParents: string | undefined;

    if (input.fileName) {
      const fileName = this.cleanFileName(input.fileName);

      if (
        await this.findDuplicate(userId, currentParentId, fileName, documentId)
      ) {
        throw new BadRequestException(
          'A document with this name already exists in that folder.',
        );
      }

      update.name = fileName;
    }

    if (input.folderPath !== undefined) {
      const targetPath = this.destinationPath(
        input.rootFolderPath,
        input.folderPath,
      );
      const target = await this.driveService.resolveFolderPath(
        userId,
        targetPath,
        true,
      );

      if (
        await this.findDuplicate(
          userId,
          target.folderId!,
          update.name ?? managed.file.name ?? '',
          documentId,
        )
      ) {
        throw new BadRequestException(
          'A document with this name already exists in that folder.',
        );
      }

      addParents = target.folderId!;
      removeParents = currentParentIds.join(',');
      update.appProperties = {
        ...(managed.file.appProperties ?? {}),
        [FOLDER_PATH_KEY]: targetPath,
      };
    }

    if (!update.name && !update.appProperties) {
      throw new BadRequestException(
        'Provide a new file name or destination folder.',
      );
    }

    const response = await managed.drive.files.update({
      fileId: documentId,
      addParents,
      removeParents,
      requestBody: update,
      fields: [
        'id',
        'name',
        'mimeType',
        'size',
        'createdTime',
        'modifiedTime',
        'webViewLink',
        'appProperties',
      ].join(','),
    });

    return this.toDocument(response.data);
  }

  async remove(userId: string, documentId: string, rootFolderPath: string) {
    const managed = await this.getManagedDocument(
      userId,
      rootFolderPath,
      documentId,
    );

    await managed.drive.files.update({
      fileId: documentId,
      requestBody: {
        trashed: true,
      },
    });
  }
}
