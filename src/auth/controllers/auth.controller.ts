import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('profile_picture'))
  async register(
    @Body() body: CreateAuthDto,
    @UploadedFile() file: Express.Multer.File,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, token } = await this.authService.registerUser(body, file);

    // ---- SET COOKIE ----
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: true, // set true in production
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return {
      success: true,
      message: 'Registration successful',
      user,
    };
  }
}
