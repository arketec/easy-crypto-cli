import { ConsoleLogger, Module } from '@nestjs/common';
import { Question, QuestionSet } from 'nest-commander';
import { CryptoModule } from '../crypto/crypto.module';
import { FilesystemModule } from '../filesystem/filesystem.module';
import { DecryptCommand } from './decrypt.command';
import { EncryptCommand } from './encrypt.command';

@QuestionSet({ name: 'passphrase-set' })
export class PassphraseQuestions {
  @Question({
    message: 'Enter passphrase',
    name: 'passphrase',
    mask: '*',
  })
  parsePassphrase(value: string): string {
    return value;
  }
}

@Module({
  imports: [FilesystemModule, CryptoModule],
  providers: [
    PassphraseQuestions,
    EncryptCommand,
    DecryptCommand,
    {
      provide: ConsoleLogger,
      useValue: new ConsoleLogger(),
    },
  ],
  exports: [EncryptCommand, DecryptCommand],
})
export class CommandsModule {}
