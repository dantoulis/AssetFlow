import type {
  AppAsset,
  AppAssetRequest,
  AppTicket,
  AppTicketMessage,
  AppUser,
  AssetCreatePayload,
  AssetUpdatePayload,
  AssetRequestFulfillPayload,
  AssetRequestUpdatePayload,
  AssetRequestCreatePayload,
  AssetRequestReviewPayload,
  TicketCreatePayload,
  TicketMessageCreatePayload,
  TicketUpdatePayload,
  UserRoleUpdatePayload,
  UserUpdatePayload,
  DashboardAiBrief,
  DashboardAiSnapshot,
} from '@/lib/app-types';

export const useAssetFlowApi = () => {
  const apiBase = useApiBase();

  const request = async <T>(path: string, options: Parameters<typeof $fetch<T>>[1] = {}) => {
    const cookieHeaders = import.meta.server ? useRequestHeaders(['cookie']) : undefined;

    return $fetch<T>(path, {
      baseURL: apiBase,
      credentials: 'include',
      headers: {
        ...(cookieHeaders ?? {}),
        ...(options.headers ?? {}),
      },
      ...options,
    });
  };

  return {
    request,
    fetchUsers: () => request<AppUser[]>('/users'),
    fetchUser: (id: number) => request<AppUser>(`/users/${id}`),
    updateUser: (id: number, body: UserUpdatePayload) =>
      request<AppUser>(`/users/${id}`, { method: 'PATCH', body }),
    updateUserRole: (id: number, body: UserRoleUpdatePayload) =>
      request<AppUser>(`/users/${id}/role`, { method: 'PATCH', body }),
    deleteUser: (id: number) => request<AppUser>(`/users/${id}`, { method: 'DELETE' }),
    fetchAssets: () => request<AppAsset[]>('/assets'),
    fetchAsset: (id: number) => request<AppAsset>(`/assets/${id}`),
    createAsset: (body: AssetCreatePayload) =>
      request<AppAsset>('/assets', { method: 'POST', body }),
    updateAsset: (id: number, body: AssetUpdatePayload) =>
      request<AppAsset>(`/assets/${id}`, { method: 'PATCH', body }),
    deleteAsset: (id: number) => request<AppAsset>(`/assets/${id}`, { method: 'DELETE' }),
    fetchTickets: () => request<AppTicket[]>('/tickets'),
    fetchTicket: (id: number) => request<AppTicket>(`/tickets/${id}`),
    createTicket: (body: TicketCreatePayload) =>
      request<AppTicket>('/tickets', { method: 'POST', body }),
    updateTicket: (id: number, body: TicketUpdatePayload) =>
      request<AppTicket>(`/tickets/${id}`, { method: 'PATCH', body }),
    deleteTicket: (id: number) => request<AppTicket>(`/tickets/${id}`, { method: 'DELETE' }),
    fetchTicketMessages: (ticketId: number) =>
      request<AppTicketMessage[]>(`/tickets/${ticketId}/messages`),
    createTicketMessage: (ticketId: number, body: TicketMessageCreatePayload) =>
      request<AppTicketMessage>(`/tickets/${ticketId}/messages`, { method: 'POST', body }),
    fetchAssetRequests: () => request<AppAssetRequest[]>('/asset-requests'),
    fetchAssetRequest: (id: number) => request<AppAssetRequest>(`/asset-requests/${id}`),
    createAssetRequest: (body: AssetRequestCreatePayload) =>
      request<AppAssetRequest>('/asset-requests', { method: 'POST', body }),
    updateAssetRequest: (id: number, body: AssetRequestUpdatePayload) =>
      request<AppAssetRequest>(`/asset-requests/${id}`, { method: 'PATCH', body }),
    reviewAssetRequest: (id: number, body: AssetRequestReviewPayload) =>
      request<AppAssetRequest>(`/asset-requests/${id}/review`, { method: 'PATCH', body }),
    fulfillAssetRequest: (id: number, body: AssetRequestFulfillPayload) =>
      request<AppAssetRequest>(`/asset-requests/${id}/fulfill`, { method: 'PATCH', body }),
    deleteAssetRequest: (id: number) =>
      request<AppAssetRequest>(`/asset-requests/${id}`, { method: 'DELETE' }),
    generateDashboardBrief: (body: DashboardAiSnapshot) =>
      request<DashboardAiBrief>('/ai/dashboard-brief', { method: 'POST', body }),
  };
};
