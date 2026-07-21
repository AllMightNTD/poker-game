import httpClient from "@/core/api/http-client";

export const clubsApi = {
  // A-BE-04: Create club
  createClub: (data: { name: string; description?: string; max_members?: number; club_rake_rate?: number }) =>
    httpClient.post("/api/v1/clubs", data).then(res => res.data),

  // A-BE-05: Join club
  joinClub: (code: string) =>
    httpClient.post("/api/v1/clubs/join", { code }).then(res => res.data),

  // A-BE-06: My clubs
  getMyClubs: () =>
    httpClient.get("/api/v1/clubs/mine").then(res => res.data),

  // A-BE-07: Get club detail
  getClubDetail: (id: string) =>
    httpClient.get(`/api/v1/clubs/${id}`).then(res => res.data),


  // A-BE-08: Update role
  updateRole: (clubId: string, userId: string, role: 'AGENT' | 'MEMBER') =>
    httpClient.put(`/api/v1/clubs/${clubId}/members/${userId}/role`, { role }).then(res => res.data),

  // A-BE-09: Transfer credit
  transferCredit: (clubId: string, memberUserId: string, amount: string) =>
    httpClient.post(`/api/v1/clubs/${clubId}/credit`, { member_user_id: memberUserId, amount }).then(res => res.data),

  // A-BE-10: Club stats
  getClubStats: (id: string) =>
    httpClient.get(`/api/v1/clubs/${id}/stats`).then(res => res.data),

  // Club Tables
  getClubTables: (id: string) =>
    httpClient.get(`/api/v1/rooms?club_id=${id}&show_private=true`).then(res => res.data),
    
  createClubTable: (data: any) =>
    httpClient.post("/api/v1/rooms", data).then(res => res.data),

  // Update club
  updateClub: (id: string, data: { name?: string; description?: string; avatar_url?: string; }) =>
    httpClient.put(`/api/v1/clubs/${id}`, data).then(res => res.data),

  // Kick/ban member
  removeMember: (clubId: string, userId: string, ban?: boolean) =>
    httpClient.delete(`/api/v1/clubs/${clubId}/members/${userId}${ban ? '?ban=true' : ''}`).then(res => res.data),

  // Leave club
  leaveClub: (id: string) =>
    httpClient.delete(`/api/v1/clubs/${id}/leave`).then(res => res.data),
};
