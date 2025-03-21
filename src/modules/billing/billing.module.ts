import { Module } from '@nestjs/common';
import { BillingController } from './interface/controllers/billing.controller';
import { StripeGateway } from './infrastructure/gateway/stripe.gateway';
import { WebhookService } from './infrastructure/services/webhook.service';
import { OneTimePaymentUseCase } from './application/use_cases/one_time_payment.use_case';
import { SubscriptionPaymentUseCase } from './application/use_cases/subscription_payment.use_case';
import { PaymentGatewayAdapter } from './infrastructure/gateway/adapters/payment.gateway.adapter';

@Module({
  controllers: [BillingController],
  providers: [
    PaymentGatewayAdapter,
    {
      provide: 'IPaymentGatewayAdapter',
      useExisting: PaymentGatewayAdapter,
    },
    SubscriptionPaymentUseCase,
    {
      provide: 'ISubscriptionPaymentUseCase',
      useExisting: SubscriptionPaymentUseCase,
    },
    OneTimePaymentUseCase,
    {
      provide: 'IOneTimePaymentUseCase',
      useExisting: OneTimePaymentUseCase,
    },
    WebhookService,
    {
      provide: 'IWebhookService',
      useExisting: WebhookService,
    },
    StripeGateway,
  ],
})
export class BillingModule {}
