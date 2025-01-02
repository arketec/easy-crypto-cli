import { Inject, Injectable } from '@nestjs/common';
import { IFilesystem } from './filesystem.interface';

@Injectable()
export class FilesystemService {
  constructor(
    @Inject('FILESYSTEM_SERVICE_TOKEN') private readonly fs: IFilesystem,
  ) {}
  readFile(filePath: string): string {
    return this.fs.readFile(filePath);
  }

  writeFile(filePath: string, data: string): void {
    this.fs.writeFile(filePath, data);
  }
}
