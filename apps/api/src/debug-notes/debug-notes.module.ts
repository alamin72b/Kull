import { Module } from "@nestjs/common";
import { DebugNotesController } from "./debug-notes.controller";
import { DebugNotesService } from "./debug-notes.service";

@Module({
  controllers: [DebugNotesController],
  providers: [DebugNotesService],
})
export class DebugNotesModule {}