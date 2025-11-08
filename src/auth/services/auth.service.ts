import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { SalesRep } from 'src/sales_rep/entities/sales-rep.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from '../types/auth-user.type';
import { parseJwtExpires } from '../utils/jwt-expiration.util';

export interface AuthResult {
  accessToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  user: AuthenticatedUser;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtExpiresInSeconds: number;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(SalesRep)
    private readonly salesRepRepository: Repository<SalesRep>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const expires = this.configService.get<string>('JWT_EXPIRES_IN');
    this.jwtExpiresInSeconds = parseJwtExpires(expires);
  }

  async login(dto: CreateAuthDto): Promise<AuthResult> {
    if (dto.type === 'admin') {
      return this.loginAdmin(dto);
    }

    return this.loginSalesRep(dto);
  }

  private async loginAdmin(dto: CreateAuthDto): Promise<AuthResult> {
    const identifier = dto.identifier.trim().toLowerCase();

    const adminUser = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.appUsers', 'appUser')
      .leftJoinAndSelect('appUser.role', 'role')
      .where('LOWER(user.email) = :email', { email: identifier })
      .andWhere('role.name = :roleName', { roleName: 'admin' })
      .addSelect('user.password')
      .getOne();

    if (!adminUser || !adminUser.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      adminUser.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: adminUser.id,
      type: 'admin' as const,
      role: 'admin' as const,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.getJwtSecret(),
      expiresIn: this.getJwtExpiresIn(),
    });

    this.logger.log(`Admin ${adminUser.email} logged in successfully`);

    return {
      accessToken,
      expiresIn: this.jwtExpiresInSeconds,
      tokenType: 'Bearer',
      user: {
        id: adminUser.id,
        type: 'admin',
        name: adminUser.name,
        email: adminUser.email,
        phone: adminUser.phone ?? null,
        role: 'admin',
      },
    };
  }

  private async loginSalesRep(dto: CreateAuthDto): Promise<AuthResult> {
    const identifier = dto.identifier.trim().toLowerCase();

    const salesRep = await this.salesRepRepository
      .createQueryBuilder('salesRep')
      .where('LOWER(salesRep.username) = :username', { username: identifier })
      .getOne();

    if (!salesRep) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await salesRep.comparePassword(dto.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    salesRep.lastLoginAt = new Date();
    await this.salesRepRepository.save(salesRep);

    const payload = {
      sub: salesRep.id,
      type: 'sales_rep' as const,
      role: 'sales_rep' as const,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.getJwtSecret(),
      expiresIn: this.getJwtExpiresIn(),
    });

    this.logger.log(`Sales rep ${salesRep.username} logged in successfully`);

    return {
      accessToken,
      expiresIn: this.jwtExpiresInSeconds,
      tokenType: 'Bearer',
      user: {
        id: salesRep.id,
        type: 'sales_rep',
        name: salesRep.name,
        phone: salesRep.phone ?? null,
        username: salesRep.username,
      },
    };
  }

  private getJwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET') ?? 'change-me';
  }

  private getJwtExpiresIn(): number {
    const expires = this.configService.get<string>('JWT_EXPIRES_IN');
    return parseJwtExpires(expires);
  }
}
