import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SignUpDto } from '../../application/dto/sign_up.dto';
import { Auth } from '../../domain/entities/auth.entity';
import { IsPublicRoute } from 'src/common/decorators/is_public_route.decorator';
import { SignInDto } from '../../application/dto/sign_in.dto';
import { LocalAuthGuard } from '../guards/local_auth.guard';
import { ITokensReturnsHelper } from '../../domain/interfaces/helpers/tokens_returns.helper.interface';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesEnum } from 'src/shared/enum/roles.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RefreshTokenDto } from '../../application/dto/refresh_token.dto';
import { VerificationCodeDto } from '../../application/dto/verification_code.dto';
import { ISignInDefaultUseCase } from '../../domain/interfaces/use_cases/sign_in.use_case.interface';
import { ISignUpUseCase } from '../../domain/interfaces/use_cases/sign_up.use_case.interface';
import { IVerifyAccountUseCase } from '../../domain/interfaces/use_cases/verify_account.use_case.interface';
import { IRefreshTokenService } from '../../domain/interfaces/services/refresh_token.service.interface';
import { IForgotPasswordService } from '../../domain/interfaces/services/forgot_password.service.interface';
import { RecoveryPasswordDto } from '../../application/dto/recovery_password.dto';
import { EmailDto } from '../../application/dto/email.dto';
import { IRecoveryPasswordUseCase } from '../../domain/interfaces/use_cases/recovery_password.use_case.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Inject('ISignUpUseCase')
  private readonly _signUpUseCase: ISignUpUseCase;

  @Inject('ISignInDefaultUseCase')
  private readonly _signInDefaultUseCase: ISignInDefaultUseCase;

  @Inject('IRefreshTokenService')
  private readonly _refreshTokenService: IRefreshTokenService;

  @Inject('IVerifyAccountUseCase')
  private readonly _verifyAccountUseCase: IVerifyAccountUseCase;

  @Inject('IForgotPasswordService')
  private readonly _forgotPasswordService: IForgotPasswordService;

  @Inject('IRecoveryPasswordUseCase')
  private readonly _recoveryPasswordUseCase: IRecoveryPasswordUseCase;

  @IsPublicRoute()
  @Post('sign-up')
  public async signUp(@Body() input: SignUpDto): Promise<Auth> {
    return await this._signUpUseCase.execute(input);
  }

  @IsPublicRoute()
  @Post('verify-account')
  public async verifyAccount(
    @Body() input: VerificationCodeDto,
  ): Promise<{ message: string }> {
    return await this._verifyAccountUseCase.execute(input);
  }

  @IsPublicRoute()
  @UseGuards(LocalAuthGuard)
  @Post('sign-in-default')
  public async signIn(@Body() input: SignInDto): Promise<ITokensReturnsHelper> {
    return await this._signInDefaultUseCase.execute(input);
  }

  @IsPublicRoute()
  @Post('sign-in-with-magic-link')
  public async signInWithMagicLink(
    @Body() input: SignInDto,
  ): Promise<{ message: string }> {
    return { message: 'Magic lin sent to your email' };
  }

  @IsPublicRoute()
  @Post('refresh-token')
  public async refreshToken(
    @Body() input: RefreshTokenDto,
  ): Promise<ITokensReturnsHelper> {
    return await this._refreshTokenService.execute(input);
  }

  @IsPublicRoute()
  @Post('forgot-password')
  public async forgotPassword(
    @Body() input: EmailDto,
  ): Promise<{ message: string }> {
    return await this._forgotPasswordService.execute(input);
  }

  @IsPublicRoute()
  @Post('recovery-password')
  public async recoveryPassword(
    @Query() input: RecoveryPasswordDto,
  ): Promise<{ message: string }> {
    return await this._recoveryPasswordUseCase.execute(input);
  }

  @ApiBearerAuth()
  @Get('all')
  public all(): string {
    return 'All route';
  }

  @ApiBearerAuth()
  @Get('admin')
  @Roles(RolesEnum.ADMIN)
  @UseGuards(RolesGuard)
  public admin(): string {
    return 'Admin route';
  }

  @ApiBearerAuth()
  @Get('user')
  @Roles(RolesEnum.USER, RolesEnum.ADMIN)
  @UseGuards(RolesGuard)
  public user(): string {
    return 'User route';
  }
}
