import { BadRequestException } from "@nestjs/common";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { diskStorage } from "multer";

export const DEBUG_NOTE_UPLOAD_DIRECTORY = join(
  process.cwd(),
  "uploads",
  "debug-notes",
);

mkdirSync(DEBUG_NOTE_UPLOAD_DIRECTORY, {
  recursive: true,
});

const extensionByMimeType: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

export const debugNoteUploadOptions = {
  storage: diskStorage({
    destination: DEBUG_NOTE_UPLOAD_DIRECTORY,

    filename: (
      _request: Express.Request,
      file: Express.Multer.File,
      callback: (error: Error | null, filename: string) => void,
    ) => {
      const extension = extensionByMimeType[file.mimetype];

      callback(null, `${randomUUID()}${extension}`);
    },
  }),

  limits: {
    files: 5,
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (
    _request: Express.Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const isAllowed = Boolean(extensionByMimeType[file.mimetype]);

    if (!isAllowed) {
      callback(
        new BadRequestException(
          "Screenshots must be PNG, JPEG, or WebP images.",
        ),
        false,
      );

      return;
    }

    callback(null, true);
  },
};