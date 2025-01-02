import { ConsoleLogger } from '@nestjs/common';
import {
  Command,
  CommandRunner,
  InquirerService,
  Option,
} from 'nest-commander';
import { CryptoService } from '../crypto/crypto.service';
import { FilesystemService } from '../filesystem/filesystem.service';

@Command({
  name: 'encrypt',
  aliases: ['enc'],
  description: 'Encrypt strings from the CLI or files',
})
export class EncryptCommand extends CommandRunner {
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
    if (!data) {
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
      return this.encryptFile(data, passphrase);
    } else if (options?.envFile) {
      return this.encryptEnvFile(data, passphrase);
    } else {
      return this.encryptString(data, passphrase);
    }
  }

  private printHelp(): void {
    this.logger.log('Usage: encrypt <data> [options]');
    this.logger.log('Options:');
    this.logger.log('  --help  Show this help message');
    this.logger.log('  --file  Encrypt a file');
    this.logger.log('  --envFile  Encrypt the values of a .env file');
    this.logger.log('  --passphrase  Specify the passphrase');
  }

  private async encryptString(data: string, passphrase: string): Promise<void> {
    const encrypted = this.service.encrypt(data, passphrase);
    this.logger.log(`Encrypted data: ${encrypted}`);
  }

  private async encryptFile(
    filePath: string,
    passphrase: string,
  ): Promise<void> {
    const fileContent = this.filesystem.readFile(filePath);
    const encrypted = this.service.encrypt(fileContent, passphrase);
    this.filesystem.writeFile(filePath, encrypted);
    this.logger.log(`File ${filePath} encrypted`);
  }

  private async encryptEnvFile(
    filePath: string,
    passphrase: string,
  ): Promise<void> {
    if (!filePath.endsWith('.env')) {
      this.logger.error('Only .env files are supported');
      return;
    }
    const fileContent = this.filesystem.readFile(filePath);
    const lines = fileContent.split('\n');
    const encryptedLines = lines.map((line) => {
      const [key, value] = line.split('=');
      if (!key || !value) {
        return line;
      }
      return `${key}=${this.service.encrypt(value, passphrase)}`;
    });
    const encryptedContent = encryptedLines.join('\n');
    this.filesystem.writeFile(filePath, encryptedContent);
  }
}
