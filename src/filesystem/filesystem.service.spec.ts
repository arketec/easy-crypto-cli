import { Test, TestingModule } from '@nestjs/testing';
import { IFilesystem } from './filesystem.interface';
import { FilesystemService } from './filesystem.service';

describe('FilesystemService', () => {
  let service: FilesystemService;
  let mockFs: IFilesystem;

  beforeEach(async () => {
    mockFs = {
      readFile: jest.fn(),
      writeFile: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'FILESYSTEM_SERVICE_TOKEN',
          useValue: mockFs,
        },
        FilesystemService,
      ],
    }).compile();

    service = module.get<FilesystemService>(FilesystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call the fs.readFile method', () => {
    const spy = jest.spyOn(mockFs, 'readFile').mockReturnValue('test');
    const result = service.readFile('test.txt');
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith('test.txt');
    expect(result).toBe('test');
  });

  it('should call the fs.writeFile method', () => {
    const spy = jest.spyOn(mockFs, 'writeFile').mockImplementation();
    service.writeFile('test.txt', 'test');
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith('test.txt', 'test');
  });
});
