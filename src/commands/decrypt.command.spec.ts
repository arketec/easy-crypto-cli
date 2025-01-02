import { ConsoleLogger } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { CommandTestFactory } from 'nest-commander-testing';
import { CommandsModule } from './commands.module';

describe('Decrypt Command', () => {
  let commandInstance: TestingModule;
  let mockLogger: any;
  let mockFileSystem: any;

  beforeAll(async () => {
    mockLogger = {
      log: jest.fn().mockImplementation(console.log),
    };
    mockFileSystem = {
      readFile: jest.fn(),
      writeFile: jest.fn(),
    };
    commandInstance = await CommandTestFactory.createTestingCommand({
      imports: [CommandsModule],
    })
      .overrideProvider(ConsoleLogger)
      .useValue(mockLogger)
      .overrideProvider('FILESYSTEM_SERVICE_TOKEN')
      .useValue(mockFileSystem)
      .compile();
  });

  it('should decrypt a string', async () => {
    const mockLoggerSpy = jest.spyOn(mockLogger, 'log');
    await CommandTestFactory.run(commandInstance, [
      'decrypt',
      '9d663e9368373a5324eee193e2d0dab3:498666a68a1a0fef5626d8fb920b4050ce8c93a8b8651dc9f1359c832bea91fc',
      '--passphrase',
      'test',
    ]);

    expect(mockLoggerSpy).toHaveBeenCalled();
  });
  it('should decrypt a file', async () => {
    const readSpy = jest
      .spyOn(mockFileSystem, 'readFile')
      .mockReturnValue(
        '41e9ffe39af90358136db6f13b198cd8:d61b7da717cc02e73faa61ea4589c1cb6070b04953c3f074e0bde49f8778b0ba',
      );
    const writeSpy = jest
      .spyOn(mockFileSystem, 'writeFile')
      .mockImplementation((path, data) => console.log(path, data));
    await CommandTestFactory.run(commandInstance, [
      'decrypt',
      'test.txt',
      '--file',
      '--passphrase',
      'test',
    ]);

    expect(readSpy).toHaveBeenCalled();
    expect(writeSpy).toHaveBeenCalled();
  });

  it('should decrypt a .env file', async () => {
    const readSpy = jest
      .spyOn(mockFileSystem, 'readFile')
      .mockReturnValue(
        'test=5ed3244b279c556a997a09fe540cdc20:5207ed974a98d69684b6655e752e1e4f6b6260c76acb6b3e743b998261eeca87\nanother=be9266248c899954ad8d171421e61076:b67854d657e0cd9015edce48e7be581f5b3437ec81a72a9a0c303c0e81a32e18',
      );
    const writeSpy = jest
      .spyOn(mockFileSystem, 'writeFile')
      .mockImplementation((path, data) => console.log(path, data));
    await CommandTestFactory.run(commandInstance, [
      'decrypt',
      '.env',
      '--envFile',
      '--passphrase',
      'test',
    ]);

    expect(readSpy).toHaveBeenCalled();
    expect(writeSpy).toHaveBeenCalled();
  });
});
