import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { SalesRep } from 'src/sales_rep/entities/sales-rep.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

type MockedRepository<T> = Partial<
  Record<keyof Repository<T>, jest.Mock>
> & {
  createQueryBuilder?: jest.Mock;
};

const createQueryBuilderMock = <T>() => {
  const qb: any = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };
  return qb;
};

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: MockedRepository<User>;
  let salesRepRepository: MockedRepository<SalesRep>;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    userRepository = {
      createQueryBuilder: jest.fn(),
    };

    salesRepRepository = {
      createQueryBuilder: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: getRepositoryToken(SalesRep),
          useValue: salesRepRepository,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('3600'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should authenticate admin user with valid credentials', async () => {
    const qb = createQueryBuilderMock<User>();
    userRepository.createQueryBuilder!.mockReturnValue(qb);

    const adminUser: Partial<User> = {
      id: 'admin-id',
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'hashed-password',
      appUsers: [
        {
          role: { name: 'admin' },
        },
      ] as any,
    };

    qb.getOne.mockResolvedValue(adminUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const result = await service.login({
      type: 'admin',
      identifier: 'admin@example.com',
      password: 'Admin123!',
    });

    expect(result.accessToken).toEqual('mock-jwt-token');
    expect(result.user.id).toEqual('admin-id');
    expect(result.user.type).toEqual('admin');
    expect(jwtService.signAsync).toHaveBeenCalled();
    expect(configService.get).toHaveBeenCalledWith('JWT_EXPIRES_IN');
  });

  it('should throw when admin credentials are invalid', async () => {
    const qb = createQueryBuilderMock<User>();
    userRepository.createQueryBuilder!.mockReturnValue(qb);
    qb.getOne.mockResolvedValue(null);

    await expect(
      service.login({
        type: 'admin',
        identifier: 'missing@example.com',
        password: 'wrong',
      }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('should throw when admin password mismatch', async () => {
    const qb = createQueryBuilderMock<User>();
    userRepository.createQueryBuilder!.mockReturnValue(qb);

    const adminUser: Partial<User> = {
      id: 'admin-id',
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'hashed-password',
      appUsers: [
        {
          role: { name: 'admin' },
        },
      ] as any,
    };

    qb.getOne.mockResolvedValue(adminUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    await expect(
      service.login({
        type: 'admin',
        identifier: 'admin@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('should authenticate sales rep with valid credentials', async () => {
    const qb = createQueryBuilderMock<SalesRep>();
    salesRepRepository.createQueryBuilder!.mockReturnValue(qb);

    const salesRep: Partial<SalesRep> = {
      id: 'rep-id',
      username: 'sr001',
      name: 'Sales Rep',
      phone: '01700000000',
      password_hash: 'hashed',
      comparePassword: jest.fn().mockResolvedValue(true),
    };

    qb.getOne.mockResolvedValue(salesRep);
    salesRepRepository.save!.mockResolvedValue(salesRep);

    const result = await service.login({
      type: 'sales_rep',
      identifier: 'sr001',
      password: 'SrUser123!',
    });

    expect(result.user.id).toEqual('rep-id');
    expect(result.user.type).toEqual('sales_rep');
    expect(result.accessToken).toEqual('mock-jwt-token');
    expect(salesRepRepository.save).toHaveBeenCalled();
  });

  it('should throw when sales rep password invalid', async () => {
    const qb = createQueryBuilderMock<SalesRep>();
    salesRepRepository.createQueryBuilder!.mockReturnValue(qb);

    const salesRep: Partial<SalesRep> = {
      id: 'rep-id',
      username: 'sr001',
      name: 'Sales Rep',
      comparePassword: jest.fn().mockResolvedValue(false),
    };

    qb.getOne.mockResolvedValue(salesRep);

    await expect(
      service.login({
        type: 'sales_rep',
        identifier: 'sr001',
        password: 'bad-pass',
      }),
    ).rejects.toThrow('Invalid credentials');
  });
});
