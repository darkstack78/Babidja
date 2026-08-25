import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import type { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterEmailDto } from './dto/register-email.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ExchangeOAuthCodeDto } from './dto/exchange-oauth-code.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from './types/authenticated-user';
import { sanitizeUser } from '../users/sanitize-user';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  // Le rate limiting fin (3/heure/numéro) reste dans AuthService.sendOtp (compteur
  // Redis par numéro). Le @Throttle ci-dessous est un plafond par IP complémentaire :
  // sans lui, le throttler global (60/min/IP) laisse un attaquant derrière une seule IP
  // faire tourner des OTP sur des dizaines de numéros différents (chacun sous la limite
  // par numéro), ce qui a un coût SMS direct. 10/10min/IP borde cet abus tout en restant
  // large pour plusieurs numéros légitimes derrière un même NAT partagé.
  @Throttle({ default: { limit: 10, ttl: 10 * 60 * 1000 } })
  @Post('send-otp')
  sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto.phone);
  }

  @Throttle({ default: { limit: 10, ttl: 10 * 60 * 1000 } })
  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const { tokens, user } = await this.authService.verifyOtp(dto.phone, dto.code);
    return { ...tokens, user };
  }

  // SEC : sans throttle, cette route permet une création de comptes en masse et,
  // puisqu'elle déclenche un envoi d'e-mail de vérification à chaque appel, un
  // bombardement d'une boîte e-mail tierce (voir audit sécurité du 2026-07-10).
  @Throttle({ default: { limit: 5, ttl: 60 * 60 * 1000 } })
  @Post('register-email')
  async registerEmail(@Body() dto: RegisterEmailDto) {
    const { tokens, user } = await this.authService.registerEmail(dto);
    return { ...tokens, user };
  }

  @Throttle({ default: { limit: 10, ttl: 60 * 60 * 1000 } })
  @UseGuards(LocalAuthGuard)
  @Post('login-email')
  async loginEmail(@Req() req: Request) {
    const tokens = await this.authService.issueTokens(req.user as User);
    return { ...tokens, user: sanitizeUser(req.user as User) };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // Passport redirige automatiquement vers Google ; ce corps n'est jamais exécuté.
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    // CRIT-01 : On n'expose PLUS les tokens JWT dans l'URL (risque historique navigateur,
    // logs serveur, header Referer). On émet un code éphémère stocké en Redis (TTL 60s)
    // que le frontend échange via POST /auth/google/exchange contre les vrais tokens.
    const code = await this.authService.issueOAuthCode(req.user as User);
    const frontendUrl = this.config.get<string>('frontendUrl')!;
    const redirectUrl = new URL('/auth/google/callback', frontendUrl);
    redirectUrl.searchParams.set('code', code);
    res.redirect(redirectUrl.toString());
  }

  @Post('google/exchange')
  @HttpCode(HttpStatus.OK)
  exchangeOAuthCode(@Body() dto: ExchangeOAuthCodeDto) {
    return this.authService.exchangeOAuthCode(dto.code);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.logout(user.userId);
  }
}
