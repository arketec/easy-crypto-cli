import { Module } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'fs';
import { FilesystemService } from './filesystem.service';

export const FILESYSTEM_SERVICE_TOKEN = 'FILESYSTEM_SERVICE_TOKEN';

@Module({
  providers: [
    FilesystemService,
    {
      provide: 'FILESYSTEM_SERVICE_TOKEN',
      useValue: {
        readFile: readFileSync,
        writeFile: writeFileSync,
      },
    },
  ],
  exports: [FilesystemService],
})
export class FilesystemModule {}
