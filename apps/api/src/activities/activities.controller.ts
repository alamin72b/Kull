import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import type { Activity } from "@kull/contracts";
import { ActivityAuthGuard } from "../auth/activity-auth.guard";
import { CurrentUserId } from "../auth/current-user-id.decorator";
import { ActivitiesService } from "./activities.service";
import { CreateActivityDto } from "./dto/create-activity.dto";
import { FindActivitiesQueryDto } from "./dto/find-activities-query.dto";
import { UpdateActivityDto } from "./dto/update-activity.dto";

@Controller("activities")
@UseGuards(ActivityAuthGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  create(
    @CurrentUserId() userId: string,
    @Body() dto: CreateActivityDto,
  ): Promise<Activity> {
    return this.activitiesService.create(userId, dto);
  }

  @Get()
  findByDate(
    @CurrentUserId() userId: string,
    @Query() query: FindActivitiesQueryDto,
  ): Promise<Activity[]> {
    return this.activitiesService.findByDate(userId, query.date);
  }

  @Get(":id")
  findOne(
    @CurrentUserId() userId: string,
    @Param("id", new ParseUUIDPipe()) id: string,
  ): Promise<Activity> {
    return this.activitiesService.findOne(userId, id);
  }

  @Patch(":id")
  update(
    @CurrentUserId() userId: string,
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateActivityDto,
  ): Promise<Activity> {
    return this.activitiesService.update(userId, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUserId() userId: string,
    @Param("id", new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    return this.activitiesService.remove(userId, id);
  }
}
