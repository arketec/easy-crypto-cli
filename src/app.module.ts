import { Module } from '@nestjs/common';
import { CommandsModule } from './commands/commands.module';
import { CryptoModule } from './crypto/crypto.module';
import { FilesystemModule } from './filesystem/filesystem.module';

@Module({
  imports: [CryptoModule, FilesystemModule, CommandsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
