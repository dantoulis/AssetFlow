import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '../generated/prisma/client';
import type { AuthenticatedRequest } from '../auth/types';
import { getGeminiApiKey, getGeminiModel } from '../common/utils';
import {
  DashboardBriefResponseDto,
  GenerateDashboardBriefDto,
} from './dto/generate-dashboard-brief.dto';

interface GeminiPart {
  text?: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
}

const briefSchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description: 'A short dashboard card title.',
    },
    severity: {
      type: 'string',
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      description: 'Overall operational urgency for the brief.',
    },
    summary: {
      type: 'string',
      description: 'A concise synthesis under 55 words that explains the real operational meaning.',
    },
    primaryRisk: {
      type: 'object',
      properties: {
        label: {
          type: 'string',
          description: 'Short name for the most important operational risk.',
        },
        reasoning: {
          type: 'string',
          description:
            'Explain why this is the primary risk, connecting multiple records when possible.',
        },
        evidence: {
          type: 'array',
          maxItems: 3,
          items: {
            type: 'string',
          },
        },
      },
      required: ['label', 'reasoning', 'evidence'],
    },
    patternDetected: {
      type: 'object',
      properties: {
        label: {
          type: 'string',
          description: 'Short name for a non-obvious pattern across the workflow.',
        },
        reasoning: {
          type: 'string',
          description:
            'Explain the hidden pattern or relationship between assets, tickets, requests, teams, vendors, or dates.',
        },
        evidence: {
          type: 'array',
          maxItems: 3,
          items: {
            type: 'string',
          },
        },
      },
      required: ['label', 'reasoning', 'evidence'],
    },
    recommendedActions: {
      type: 'array',
      maxItems: 3,
      items: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            description: 'A concrete next action, written as an instruction.',
          },
          reason: {
            type: 'string',
            description: 'Why this action should happen in this order.',
          },
          urgency: {
            type: 'string',
            enum: ['NOW', 'NEXT', 'WATCH'],
            description: 'The action priority.',
          },
        },
        required: ['action', 'reason', 'urgency'],
      },
    },
  },
  required: [
    'title',
    'severity',
    'summary',
    'primaryRisk',
    'patternDetected',
    'recommendedActions',
  ],
};

@Injectable()
export class AiService {
  async generateDashboardBrief(
    snapshot: GenerateDashboardBriefDto,
    request: AuthenticatedRequest,
  ): Promise<DashboardBriefResponseDto> {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    if (snapshot.role !== user.role) {
      throw new BadRequestException('Dashboard snapshot role does not match the current session');
    }

    if (user.role === Role.ADMIN && snapshot.visiblePage !== 'admin-dashboard') {
      throw new BadRequestException('Admin briefs require an admin dashboard snapshot');
    }

    if (user.role === Role.USER && snapshot.visiblePage !== 'user-dashboard') {
      throw new BadRequestException('User briefs require a user dashboard snapshot');
    }

    const apiKey = getGeminiApiKey();

    if (!apiKey) {
      throw new ServiceUnavailableException('Gemini AI is not configured');
    }

    try {
      return await this.generateGeminiBrief(snapshot, apiKey);
    } catch {
      throw new ServiceUnavailableException('Gemini AI brief is temporarily unavailable');
    }
  }

  private async generateGeminiBrief(
    snapshot: GenerateDashboardBriefDto,
    apiKey: string,
  ): Promise<DashboardBriefResponseDto> {
    const model = getGeminiModel();
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: this.buildPrompt(snapshot),
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.35,
          responseMimeType: 'application/json',
          responseSchema: briefSchema,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini request failed with status ${response.status}`);
    }

    const data = (await response.json()) as GeminiResponse;
    const text =
      data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? '')
        .join('')
        .trim() ?? '';

    if (!text) {
      throw new Error('Gemini did not return text');
    }

    return this.normalizeBrief(JSON.parse(text) as Partial<DashboardBriefResponseDto>);
  }

  private buildPrompt(snapshot: GenerateDashboardBriefDto): string {
    return [
      'You are AssetFlow AI, an operations assistant for an internal asset management dashboard.',
      '',
      'Analyze the dashboard snapshot and produce an opinionated workflow brief.',
      '',
      'Your job:',
      '- Do not produce an inventory report.',
      '- Do not simply group records by status or list obvious counts.',
      '- Do not lead with raw counts unless they explain a decision.',
      '- Infer what the operator should care about first.',
      '- Find relationships between assets, tickets, requests, teams, vendors, and dates.',
      '- Explain why the issue matters operationally.',
      '- Prioritize the next 2-3 actions in order.',
      '- Do not invent facts that are not present in the snapshot.',
      '- If the data looks healthy, say so clearly.',
      '',
      'Look for relationships like:',
      '- Does an expired or expiring tool affect a team that also has open tickets?',
      '- Are support tools expiring while support workload is backing up?',
      '- Are admin-pending tickets old enough to indicate a bottleneck?',
      '- Are high-priority tickets concentrated in one team, asset type, or vendor?',
      '- Are requests likely blocked by current asset or ticket pressure?',
      '',
      'Audience:',
      '- If role is ADMIN, write for an operations/admin user managing the workspace.',
      '- If role is USER, write for an employee viewing their own assets, tickets, and requests.',
      '',
      'Style:',
      '- Concise.',
      '- Confident.',
      '- Useful.',
      '- Analytical, not descriptive.',
      '- No hype.',
      '- No markdown.',
      '- Prefer phrases like "The risk is..." and "This matters because..."',
      '',
      'Return JSON only using the provided schema.',
      '',
      `Dashboard snapshot:\n${JSON.stringify(snapshot)}`,
    ].join('\n');
  }

  private normalizeBrief(brief: Partial<DashboardBriefResponseDto>): DashboardBriefResponseDto {
    if (
      !brief.title ||
      !brief.summary ||
      !brief.primaryRisk ||
      !brief.patternDetected ||
      !Array.isArray(brief.recommendedActions)
    ) {
      throw new Error('Gemini returned an incomplete dashboard brief');
    }

    const severity =
      brief.severity === 'HIGH' || brief.severity === 'MEDIUM' || brief.severity === 'LOW'
        ? brief.severity
        : null;

    if (!severity) {
      throw new Error('Gemini returned an invalid brief severity');
    }

    return {
      title: this.trim(brief.title, 80),
      severity,
      summary: this.trim(brief.summary, 320),
      primaryRisk: {
        label: this.trim(brief.primaryRisk.label, 80),
        reasoning: this.trim(brief.primaryRisk.reasoning, 360),
        evidence: (brief.primaryRisk.evidence ?? [])
          .slice(0, 3)
          .map((item) => this.trim(item, 120)),
      },
      patternDetected: {
        label: this.trim(brief.patternDetected.label, 80),
        reasoning: this.trim(brief.patternDetected.reasoning, 360),
        evidence: (brief.patternDetected.evidence ?? [])
          .slice(0, 3)
          .map((item) => this.trim(item, 120)),
      },
      recommendedActions: brief.recommendedActions.slice(0, 3).map((action) => ({
        action: this.trim(action.action, 180),
        reason: this.trim(action.reason, 260),
        urgency:
          action.urgency === 'NOW' || action.urgency === 'NEXT' || action.urgency === 'WATCH'
            ? action.urgency
            : 'WATCH',
      })),
      generatedAt: new Date().toISOString(),
      provider: 'gemini',
    };
  }

  private trim(value: string, maxLength: number): string {
    return value.trim().slice(0, maxLength);
  }
}
