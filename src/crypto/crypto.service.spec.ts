import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoService],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should encrypt a string', () => {
    const result = service.encrypt('test', 'test');
    expect(result).toBeDefined();
  });

  it('should decrypt a string', () => {
    const encrypted = service.encrypt('test', 'test');
    const result = service.decrypt(encrypted, 'test');
    expect(result).toBe('test');
  });

  it('should encrypt/decrypt a string with aes-128-cbc', () => {
    const encrypted = service.encrypt('test', 'test', {
      alg: 'aes-128-cbc',
    });
    const result = service.decrypt(encrypted, 'test', {
      alg: 'aes-128-cbc',
    });
    expect(result).toBe('test');
  });
  it('should encrypt/decrypt a string with aes-192-cbc', () => {
    const encrypted = service.encrypt('test', 'test', {
      alg: 'aes-192-cbc',
    });
    const result = service.decrypt(encrypted, 'test', {
      alg: 'aes-192-cbc',
    });
    expect(result).toBe('test');
  });
  it('should encrypt/decrypt a string with aes-256-cbc', () => {
    const encrypted = service.encrypt('test', 'test', {
      alg: 'aes-256-cbc',
    });
    const result = service.decrypt(encrypted, 'test', {
      alg: 'aes-256-cbc',
    });
    expect(result).toBe('test');
  });
});
