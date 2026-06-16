import 'dotenv/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AssetsModule } from './assets/assets.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TicketsModule } from './tickets/tickets.module';
import { AssetRequestsModule } from './asset-requests/asset-requests.module';
import { AiModule } from './ai/ai.module';

@Module({
  exports: [UsersModule, TicketsModule],
  imports: [
    PrismaModule,
    AssetsModule,
    UsersModule,
    AuthModule,
    TicketsModule,
    AssetRequestsModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
