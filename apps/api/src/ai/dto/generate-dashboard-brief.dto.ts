import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

const roleValues = ['ADMIN', 'USER'] as const;
const pageValues = ['admin-dashboard', 'user-dashboard'] as const;
const severityValues = ['LOW', 'MEDIUM', 'HIGH'] as const;

export class DashboardBriefMetricDto {
  @IsString()
  @MaxLength(80)
  readonly label!: string;

  @IsString()
  @MaxLength(80)
  readonly value!: string;

  @IsString()
  @MaxLength(120)
  readonly delta!: string;

  @IsString()
  @MaxLength(180)
  readonly hint!: string;
}

export class DashboardBriefAssetDto {
  @IsString()
  @MaxLength(140)
  readonly title!: string;

  @IsString()
  @MaxLength(40)
  readonly type!: string;

  @IsString()
  @MaxLength(40)
  readonly status!: string;

  @IsString()
  @MaxLength(100)
  readonly vendor!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  readonly billingCycle?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  readonly purchasedAt?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  readonly assignedAt?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  readonly renewalAt?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  readonly expiresAt?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  readonly seatCount?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  readonly ownerTeam?: string | null;

  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  readonly tags!: string[];
}

export class DashboardBriefTicketDto {
  @IsString()
  @MaxLength(160)
  readonly subject!: string;

  @IsString()
  @MaxLength(40)
  readonly category!: string;

  @IsString()
  @MaxLength(40)
  readonly priority!: string;

  @IsString()
  @MaxLength(40)
  readonly status!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  readonly requesterTeam?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  readonly relatedAsset?: string | null;

  @IsString()
  @MaxLength(40)
  readonly createdAt!: string;

  @IsString()
  @MaxLength(40)
  readonly updatedAt!: string;
}

export class DashboardBriefRequestDto {
  @IsString()
  @MaxLength(160)
  readonly title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  readonly assetType?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly vendor?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(900)
  readonly justification?: string | null;

  @IsString()
  @MaxLength(40)
  readonly status!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  readonly requesterTeam?: string | null;

  @IsString()
  @MaxLength(40)
  readonly createdAt!: string;

  @IsString()
  @MaxLength(40)
  readonly updatedAt!: string;
}

export class GenerateDashboardBriefDto {
  @IsIn(roleValues)
  readonly role!: (typeof roleValues)[number];

  @IsIn(pageValues)
  readonly visiblePage!: (typeof pageValues)[number];

  @IsString()
  @MaxLength(40)
  readonly generatedAt!: string;

  @IsArray()
  @ArrayMaxSize(8)
  @ValidateNested({ each: true })
  @Type(() => DashboardBriefMetricDto)
  readonly visibleMetrics!: DashboardBriefMetricDto[];

  @IsArray()
  @ArrayMaxSize(80)
  @ValidateNested({ each: true })
  @Type(() => DashboardBriefAssetDto)
  readonly assets!: DashboardBriefAssetDto[];

  @IsArray()
  @ArrayMaxSize(80)
  @ValidateNested({ each: true })
  @Type(() => DashboardBriefTicketDto)
  readonly tickets!: DashboardBriefTicketDto[];

  @IsArray()
  @ArrayMaxSize(60)
  @ValidateNested({ each: true })
  @Type(() => DashboardBriefRequestDto)
  readonly requests!: DashboardBriefRequestDto[];
}

const actionUrgencyValues = ['NOW', 'NEXT', 'WATCH'] as const;

export class DashboardBriefReasoningDto {
  @IsString()
  @MaxLength(80)
  readonly label!: string;

  @IsString()
  @MaxLength(360)
  readonly reasoning!: string;

  @IsArray()
  @ArrayMaxSize(3)
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  readonly evidence!: string[];
}

export class DashboardBriefActionDto {
  @IsString()
  @MaxLength(180)
  readonly action!: string;

  @IsString()
  @MaxLength(260)
  readonly reason!: string;

  @IsIn(actionUrgencyValues)
  readonly urgency!: (typeof actionUrgencyValues)[number];
}

export class DashboardBriefResponseDto {
  @IsString()
  @MaxLength(80)
  readonly title!: string;

  @IsIn(severityValues)
  readonly severity!: (typeof severityValues)[number];

  @IsString()
  @MaxLength(320)
  readonly summary!: string;

  @ValidateNested()
  @Type(() => DashboardBriefReasoningDto)
  readonly primaryRisk!: DashboardBriefReasoningDto;

  @ValidateNested()
  @Type(() => DashboardBriefReasoningDto)
  readonly patternDetected!: DashboardBriefReasoningDto;

  @IsArray()
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => DashboardBriefActionDto)
  readonly recommendedActions!: DashboardBriefActionDto[];

  @IsString()
  @MaxLength(40)
  readonly generatedAt!: string;

  @IsString()
  @MaxLength(40)
  readonly provider!: string;
}
