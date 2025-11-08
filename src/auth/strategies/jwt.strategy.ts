import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { SalesRep } from 'src/sales_rep/entities/sales-rep.entity';
import {
  AuthenticatedUser,
  AuthJwtPayload,
} from '../types/auth-user.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(SalesRep)
    private readonly salesRepRepository: Repository<SalesRep>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'change-me',
    });
  }

  async validate(payload: AuthJwtPayload): Promise<AuthenticatedUser> {
    if (payload.type === 'admin') {
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException();
      }

      return {
        id: user.id,
        type: 'admin',
        name: user.name,
        email: user.email,
        phone: user.phone ?? null,
        role: payload.role ?? 'admin',
      };
    }

    const salesRep = await this.salesRepRepository.findOne({
      where: { id: payload.sub },
    });

    if (!salesRep) {
      throw new UnauthorizedException();
    }

    return {
      id: salesRep.id,
      type: 'sales_rep',
      name: salesRep.name,
      phone: salesRep.phone ?? null,
      username: salesRep.username,
      role: payload.role ?? 'sales_rep',
    };
  }
}

