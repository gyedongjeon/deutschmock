/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Req,
  UseGuards,
  Res,
  Patch,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This initiates the Google OAuth2 flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: any) {
    // Handling the callback from Google
    const user = req.user;

    // Generate JWT token
    const { access_token } = await this.authService.login(user);

    const params = new URLSearchParams({
      token: access_token,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      picture: user.picture,
      language: user.language || 'en', // Add language info
      level: user.level || 'A2',
    });

    // Redirect to Frontend (deliver token)
    res.redirect(`http://localhost:3000/auth/callback?${params.toString()}`);
  }

  @Patch('language')
  @UseGuards(AuthGuard('jwt'))
  async updateLanguage(@Req() req: any, @Body('language') language: string) {
    const userId = req.user.userId;
    return this.authService.updateLanguage(userId, language);
  }

  @Patch('level')
  @UseGuards(AuthGuard('jwt'))
  async updateLevel(@Req() req: any, @Body('level') level: string) {
    const userId = req.user.userId;
    return this.authService.updateLevel(userId, level);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: any) {
    const userId = req.user.userId;
    return this.authService.findUser(userId);
  }
}
