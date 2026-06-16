import { Body, Controller, Post, Req } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/types';
import { AiService } from './ai.service';
import {
  DashboardBriefResponseDto,
  GenerateDashboardBriefDto,
} from './dto/generate-dashboard-brief.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('dashboard-brief')
  async generateDashboardBrief(
    @Body() dashboardBriefDto: GenerateDashboardBriefDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<DashboardBriefResponseDto> {
    return this.aiService.generateDashboardBrief(dashboardBriefDto, request);
  }
}
