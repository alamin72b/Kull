import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Activity } from "@kull/contracts";
import { PrismaService } from "../common/prisma/prisma.service";
import type { Activity as ActivityEntity } from "../generated/prisma/client";
import { CreateActivityDto } from "./dto/create-activity.dto";
import { UpdateActivityDto } from "./dto/update-activity.dto";

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateActivityDto): Promise<Activity> {
    const startAt = this.toDateTime(dto.startAt);
    const endAt = this.toDateTime(dto.endAt);
    this.validateInterval(startAt, endAt);

    const activity = await this.prisma.activity.create({
      data: {
        name: this.cleanName(dto.name),
        activityDate: this.toDateOnly(dto.activityDate),
        startAt,
        endAt,
        note: this.cleanNote(dto.note),
      },
    });

    return this.toContract(activity);
  }

  async findByDate(date: string): Promise<Activity[]> {
    const activities = await this.prisma.activity.findMany({
      where: {
        activityDate: this.toDateOnly(date),
      },
      orderBy: [{ startAt: "asc" }, { createdAt: "asc" }],
    });

    return activities.map((activity) => this.toContract(activity));
  }

  async findOne(id: string): Promise<Activity> {
    const activity = await this.findEntity(id);
    return this.toContract(activity);
  }

  async update(id: string, dto: UpdateActivityDto): Promise<Activity> {
    const current = await this.findEntity(id);

    const startAt = dto.startAt
      ? this.toDateTime(dto.startAt)
      : current.startAt;

    const endAt = dto.endAt ? this.toDateTime(dto.endAt) : current.endAt;

    this.validateInterval(startAt, endAt);

    const activity = await this.prisma.activity.update({
      where: { id },
      data: {
        name: dto.name === undefined ? undefined : this.cleanName(dto.name),
        activityDate:
          dto.activityDate === undefined
            ? undefined
            : this.toDateOnly(dto.activityDate),
        startAt: dto.startAt === undefined ? undefined : startAt,
        endAt: dto.endAt === undefined ? undefined : endAt,
        note: dto.note === undefined ? undefined : this.cleanNote(dto.note),
      },
    });

    return this.toContract(activity);
  }

  async remove(id: string): Promise<void> {
    await this.findEntity(id);
    await this.prisma.activity.delete({ where: { id } });
  }

  private async findEntity(id: string): Promise<ActivityEntity> {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      throw new NotFoundException("Activity not found");
    }

    return activity;
  }

  private cleanName(name: string): string {
    const value = name.trim();

    if (!value) {
      throw new BadRequestException("Activity name is required");
    }

    return value;
  }

  private cleanNote(note?: string | null): string | null {
    if (!note) {
      return null;
    }

    const value = note.trim();
    return value || null;
  }

  private toDateTime(value: string): Date {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException("Start and end time must be valid dates");
    }

    return date;
  }

  private toDateOnly(value: string): Date {
    const date = new Date(`${value}T00:00:00.000Z`);

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    ) {
      throw new BadRequestException(
        "Date must be a real date in YYYY-MM-DD format",
      );
    }

    return date;
  }

  private validateInterval(startAt: Date, endAt: Date): void {
    if (endAt.getTime() <= startAt.getTime()) {
      throw new BadRequestException("End time must be after start time");
    }

    const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

    if (endAt.getTime() - startAt.getTime() > oneDayInMilliseconds) {
      throw new BadRequestException(
        "An activity cannot be longer than 24 hours",
      );
    }
  }

  private toContract(activity: ActivityEntity): Activity {
    return {
      id: activity.id,
      name: activity.name,
      activityDate: activity.activityDate.toISOString().slice(0, 10),
      startAt: activity.startAt.toISOString(),
      endAt: activity.endAt.toISOString(),
      note: activity.note,
      createdAt: activity.createdAt.toISOString(),
      updateAt: activity.updatedAt.toISOString(),
    };
  }
}
