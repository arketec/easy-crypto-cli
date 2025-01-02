export interface IFilesystem {
  readFile(filePath: string): string;
  writeFile(filePath: string, data: string): void;
}
