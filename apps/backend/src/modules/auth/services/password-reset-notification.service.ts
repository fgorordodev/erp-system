import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface SendPasswordResetInput {
  email: string;
  firstName: string;
  token: string;
}

@Injectable()
export class PasswordResetNotificationService {
  private readonly logger = new Logger(PasswordResetNotificationService.name);

  constructor(private readonly configService: ConfigService) {}

  async send(input: SendPasswordResetInput): Promise<void> {
    const resetUrl = this.buildResetUrl(input.token);
    const environment = this.configService.getOrThrow<string>('NODE_ENV');

    if (environment === 'development') {
      this.logger.log(
        `Password reset requested for ${input.email}: ${resetUrl}`,
      );
    }

    /*
     * The production email provider will be integrated here later.
     *
     * Do not log the raw reset token outside development.
     */
    await Promise.resolve();
  }

  private buildResetUrl(token: string): string {
    const configuredUrl = this.configService.getOrThrow<string>(
      'AUTH_PASSWORD_RESET_URL',
    );

    const resetUrl = new URL(configuredUrl);

    resetUrl.searchParams.set('token', token);

    return resetUrl.toString();
  }
}
