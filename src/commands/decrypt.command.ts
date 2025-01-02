import { ConsoleLogger } from '@nestjs/common';
import {
  Command,
  CommandRunner,
  InquirerService,
  Option,
} from 'nest-commander';
import { resolve } from 'path';
import { CryptoService } from '../crypto/crypto.service';
import { FilesystemService } from '../filesystem/filesystem.service';

@Command({
  name: 'decrypt',
  aliases: ['dec'],
  description: 'Decrypt strings from the CLI or files',
})
export class DecryptCommand extends CommandRunner {
  constructor(
    private readonly service: CryptoService,
    private readonly inquirer: InquirerService,
    private readonly filesystem: FilesystemService,
    private readonly logger: ConsoleLogger,
  ) {
    super();
  }
  @Option({
    flags: '--file',
    description: 'Decrypt a file',
  })
  parseFile(): boolean {
    return true;
  }
  @Option({
    flags: '--envFile',
    description: 'Decrypt a .env file',
  })
  parseEnvFile(): boolean {
    return true;
  }
  @Option({
    flags: '--passphrase <passphrase>',
    description: 'Specify the passphrase',
  })
  parsePassphrase(s: string): string {
    return s;
  }
  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    const [data] = passedParams;
    if (!data && !options?.envFile) {
      this.logger.error('No data provided');
      return;
    }
    if (options?.help || data === 'help') {
      this.printHelp();
      return;
    }
    let passphrase: string;
    if (options?.passphrase) {
      passphrase = options.passphrase;
    } else {
      passphrase = await this.inquirer
        .ask<{
          passphrase: string;
        }>('passphrase-set', undefined)
        .then((answer) => answer.passphrase);
    }
    if (options?.file) {
      return this.decryptFile(data, passphrase);
    } else if (options?.envFile) {
      return this.decryptEnvFile(data || '.env', passphrase);
    } else {
      return this.decryptString(data, passphrase);
    }
  }

  private printHelp(): void {
    this.logger.log('Usage: decrypt <data> [options]');
    this.logger.log('Options:');
    this.logger.log('  --help  Show this help message');
    this.logger.log('  --file  Decrypt a file');
    this.logger.log('  --envFile  Decrypt the values of a .env file');
  }

  private async decryptString(data: string, passphrase: string): Promise<void> {
    const decrypted = this.service.decrypt(data, passphrase);
    this.logger.log(`Decrypted data: ${decrypted}`);
  }

  private async decryptFile(
    filePath: string,
    passphrase: string,
  ): Promise<void> {
    const path = resolve(process.cwd(), filePath);
    const fileContent = this.filesystem.readFile(path);
    const decrypted = this.service.decrypt(fileContent, passphrase);
    this.filesystem.writeFile(filePath, decrypted);
    this.logger.log(`File ${filePath} decrypted`);
  }

  private async decryptEnvFile(
    filePath: string,
    passphrase: string,
  ): Promise<void> {
    if (!filePath.endsWith('.env')) {
      this.logger.error('File must be a .env file');
      return;
    }
    const path = resolve(process.cwd(), filePath);
    const fileContent = this.filesystem.readFile(path);
    const lines = fileContent.split('\n');
    const decryptedLines = lines.map((line) => {
      const [key, value] = line.split('=');
      if (!value) {
        return line;
      }
      return `${key}=${this.service.decrypt(value, passphrase)}`;
    });
    this.filesystem.writeFile(filePath, decryptedLines.join('\n'));
    this.logger.log(`File ${filePath} decrypted`);
  }
}
