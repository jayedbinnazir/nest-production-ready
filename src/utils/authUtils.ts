import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './types/authTypes';

@Injectable()
export class authUtilService {
  private saltRounds = 10;
  constructor(private jwtService: JwtService) {}

  async hashPassword(password: string): Promise<string> {
    try {
      const hash = await bcrypt.hash(password, this.saltRounds);
      return hash;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async passwordMatch(password: string, hash: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password, hash);
      return isMatch;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async generateToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
