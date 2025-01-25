import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IForgotPasswordService } from '../interfaces/services/forgot_password.service.interface';
import { ISendEmailQueueJob } from 'src/shared/modules/email/interfaces/jobs/send_email_queue.job.interface';
import { LanguageEnum } from 'src/shared/enum/language.enum';
import { TemplateEnum } from 'src/shared/modules/email/enum/template.enum';
import { IFindUserByEmailHelper } from '../interfaces/helpers/find_user_by_email.helper.interface';
import { IGenerateTokenHelper } from 'src/modules/auth/interfaces/helpers/generate_token.helper.interface';
import { TokenEnum } from 'src/shared/enum/token.enum';
import { ForgotPasswordDto } from '../dto/forgot_password.dto';

@Injectable()
export class ForgotPasswordService implements IForgotPasswordService {
  @Inject('ISendEmailQueueJob')
  private readonly _sendEmailQueueJob: ISendEmailQueueJob;

  @Inject('IFindUserByEmailHelper')
  private readonly _findUserByEmailHelper: IFindUserByEmailHelper;

  @Inject('IGenerateTokenHelper')
  private readonly _generateTokenUtil: IGenerateTokenHelper;

  public async execute(input: ForgotPasswordDto): Promise<{ message: string }> {
    return await this.intermediary(input);
  }

  private async intermediary(
    data: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const findUserByEmail = await this._findUserByEmailHelper.execute(
      data.email,
    );

    if (!findUserByEmail) {
      throw new NotFoundException('User not found');
    }

    const { token } = await this._generateTokenUtil.execute({
      email: findUserByEmail.email,
      role: findUserByEmail.role,
      sub: findUserByEmail.public_id,
      type: TokenEnum.RECOVERY_PASSWORD_TOKEN,
    });

    return await this._sendEmailQueueJob.execute({
      emailTo: data.email,
      language: LanguageEnum.PT_BR,
      subject: 'Recuperação de senha',
      template: TemplateEnum.PASSWORD_RECOVERY,
      variables: {
        NAME: data.email,
        LINK: `http://example.com/recovery-password?token=${token}`,
      },
    });
  }
}
