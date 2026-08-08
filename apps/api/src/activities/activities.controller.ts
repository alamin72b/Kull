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
} from "@nestjs/common";
import type { Activity } from "@kull/contracts";
import { ActivitiesService } from "./activities.service";
import { CreateActivityDto } from "./dto/create-activity.dto";
import { FindActivitiesQueryDto } from "./dto/find-activities-query.dto";
import { UpdateActivityDto } from "./dto/update-activity.dto";

@Controller("activities")
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  create(@Body() dto: CreateActivityDto): Promise<Activity> {
    return this.activitiesService.create(dto);
  }

  @Get()
  findByDate(
    @Query() query: FindActivitiesQueryDto,
  ): Promise<Activity[]> {
    return this.activitiesService.findByDate(query.date);
  }

  @Get(":id")
  findOne(
    @Param("id", new ParseUUIDPipe()) id: string,
  ): Promise<Activity> {
    return this.activitiesService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateActivityDto,
  ): Promise<Activity> {
    return this.activitiesService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param("id", new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    return this.activitiesService.remove(id);
  }
}