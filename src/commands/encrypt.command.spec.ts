import { ConsoleLogger } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { CommandTestFactory } from 'nest-commander-testing';
import { CommandsModule } from './commands.module';

describe('Encrypt Command', () => {
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

  it('should encrypt a string', async () => {
    const mockLoggerSpy = jest.spyOn(mockLogger, 'log');
    await CommandTestFactory.run(commandInstance, [
      'encrypt',
      'test',
      '--passphrase',
      'test',
    ]);

    expect(mockLoggerSpy).toHaveBeenCalled();
  });

  it('should encrypt a string with a password prompt', async () => {
    CommandTestFactory.setAnswers(['test']);
    const mockLoggerSpy = jest.spyOn(mockLogger, 'log');
    await CommandTestFactory.run(commandInstance, ['encrypt', 'test']);

    expect(mockLoggerSpy).toHaveBeenCalled();
  });

  it('should encrypt a file', async () => {
    const readSpy = jest
      .spyOn(mockFileSystem, 'readFile')
      .mockReturnValue('test');
    const writeSpy = jest
      .spyOn(mockFileSystem, 'writeFile')
      .mockImplementation((path, data) => console.log(path, data));
    await CommandTestFactory.run(commandInstance, [
      'encrypt',
      'test.txt',
      '--file',
      '--passphrase',
      'test',
    ]);

    expect(readSpy).toHaveBeenCalled();
    expect(writeSpy).toHaveBeenCalled();
  });

  it('should encrypt a .env file', async () => {
    const readSpy = jest
      .spyOn(mockFileSystem, 'readFile')
      .mockReturnValue('test=hiddentest\nanother=hiddenanother');
    const writeSpy = jest
      .spyOn(mockFileSystem, 'writeFile')
      .mockImplementation((path, data) => console.log(path, data));
    await CommandTestFactory.run(commandInstance, [
      'encrypt',
      '--envFile',
      '--passphrase',
      'test',
    ]);

    expect(readSpy).toHaveBeenCalled();
    expect(writeSpy).toHaveBeenCalled();
  });
});
