export type AppRole = 'ADMIN' | 'USER';
export type AssetType = 'LAPTOP' | 'SUBSCRIPTION' | 'LICENSE' | 'PERIPHERAL';
export type AssetStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'IN_REPAIR';
export type BillingCycle = 'MONTHLY' | 'YEARLY' | 'ONCE';
export type TicketStatus = 'OPEN' | 'PENDING_ADMIN' | 'PENDING_USER' | 'RESOLVED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TicketCategory = 'SUBSCRIPTION' | 'HARDWARE' | 'ACCESS' | 'BILLING' | 'OTHER';
export type AssetRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED';

export interface AppUser {
  id: number;
  email: string;
  username: string;
  name: string | null;
  role: AppRole;
  phone: string | null;
  team: string | null;
  location: string | null;
  joinedAt: string;
  suspendedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppAsset {
  id: number;
  title: string;
  type: AssetType;
  status: AssetStatus;
  vendor: string;
  reference: string;
  billingCycle: BillingCycle | null;
  purchasedAt: string | null;
  assignedAt: string | null;
  renewalAt: string | null;
  expiresAt: string | null;
  seatCount: number | null;
  notes: string | null;
  tags: string[];
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppTicket {
  id: number;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  requesterId: number;
  assetId: number | null;
  assignedAdminId: number | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppTicketMessage {
  id: number;
  ticketId: number;
  authorId: number;
  body: string;
  internal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppAssetRequest {
  id: number;
  requesterId: number;
  reviewedById: number | null;
  fulfilledAssetId: number | null;
  title: string;
  assetType: AssetType | null;
  vendor: string | null;
  justification: string | null;
  rejectionReason: string | null;
  status: AssetRequestStatus;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface DistributionSegment {
  label: string;
  value: number;
  color: string;
}

export type ChartPeriodPreset = 'TODAY' | '7D' | '30D' | 'CUSTOM';

export interface DashboardMetric {
  label: string;
  value: string;
  delta: string;
  hint: string;
}

export interface TicketCreatePayload {
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  assetId?: number;
}

export interface TicketUpdatePayload {
  subject?: string;
  category?: TicketCategory;
  status?: TicketStatus;
  priority?: TicketPriority;
  assetId?: number | null;
  assignedAdminId?: number | null;
}

export interface TicketMessageCreatePayload {
  body: string;
  internal?: boolean;
}

export interface AssetCreatePayload {
  title: string;
  type: AssetType;
  status: AssetStatus;
  vendor: string;
  reference: string;
  userId: number;
  billingCycle?: BillingCycle | null;
  purchasedAt?: string | null;
  assignedAt?: string | null;
  renewalAt?: string | null;
  expiresAt?: string | null;
  seatCount?: number | null;
  notes?: string | null;
  tags?: string[];
}

export interface AssetUpdatePayload {
  title?: string;
  type?: AssetType;
  status?: AssetStatus;
  vendor?: string;
  reference?: string;
  billingCycle?: BillingCycle | null;
  purchasedAt?: string | null;
  assignedAt?: string | null;
  renewalAt?: string | null;
  expiresAt?: string | null;
  seatCount?: number | null;
  notes?: string | null;
  tags?: string[];
  userId?: number;
}

export interface AssetRequestCreatePayload {
  title: string;
  assetType?: AssetType;
  vendor?: string;
  justification?: string;
}

export interface AssetRequestUpdatePayload {
  title?: string;
  assetType?: AssetType | null;
  vendor?: string | null;
  justification?: string | null;
}

export interface AssetRequestReviewPayload {
  status: Extract<AssetRequestStatus, 'APPROVED' | 'REJECTED'>;
  rejectionReason?: string;
}

export interface AssetRequestFulfillPayload {
  fulfilledAssetId: number;
}

export interface UserUpdatePayload {
  email?: string;
  username?: string;
  name?: string | null;
  phone?: string | null;
  team?: string | null;
  location?: string | null;
}

export interface UserRoleUpdatePayload {
  role: AppRole;
}

export interface DashboardAiMetric {
  label: string;
  value: string;
  delta: string;
  hint: string;
}

export interface DashboardAiAsset {
  title: string;
  type: AssetType;
  status: AssetStatus;
  vendor: string;
  billingCycle: BillingCycle | null;
  purchasedAt: string | null;
  assignedAt: string | null;
  renewalAt: string | null;
  expiresAt: string | null;
  seatCount: number | null;
  ownerTeam?: string | null;
  tags: string[];
}

export interface DashboardAiTicket {
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  requesterTeam?: string | null;
  relatedAsset?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardAiRequest {
  title: string;
  assetType: AssetType | null;
  vendor: string | null;
  justification: string | null;
  status: AssetRequestStatus;
  requesterTeam?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardAiSnapshot {
  role: AppRole;
  visiblePage: 'admin-dashboard' | 'user-dashboard';
  generatedAt: string;
  visibleMetrics: DashboardAiMetric[];
  assets: DashboardAiAsset[];
  tickets: DashboardAiTicket[];
  requests: DashboardAiRequest[];
}

export interface DashboardAiReasoning {
  label: string;
  reasoning: string;
  evidence: string[];
}

export interface DashboardAiRecommendedAction {
  action: string;
  reason: string;
  urgency: 'NOW' | 'NEXT' | 'WATCH';
}

export interface DashboardAiBrief {
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  summary: string;
  primaryRisk: DashboardAiReasoning;
  patternDetected: DashboardAiReasoning;
  recommendedActions: DashboardAiRecommendedAction[];
  generatedAt: string;
  provider: 'gemini' | string;
}

export interface DashboardAiSnapshotStats {
  assets: number;
  tickets: number;
  requests: number;
}
