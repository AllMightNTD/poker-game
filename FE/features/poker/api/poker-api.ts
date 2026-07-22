import httpClient from "@/core/api/http-client";

export interface CreateTablePayload {
  name: string;
  small_blind: number;
  max_seats?: number;
  password?: string;
  is_private?: boolean;
}

export interface AddBotPayload {
  count?: number;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  displayName?: string;
  avatar?: string;
  country?: string;
  chips?: number;
}

export const pokerApi = {
  // Lấy danh sách bàn chơi
  getTables: async (params?: { page?: number; limit?: number; search?: string; type?: string }) => {
    const response = await httpClient.get("/api/v1/poker/tables", { params });
    return response.data?.metadata || response.data;
  },

  // Lấy chi tiết bàn chơi
  getTableDetail: async (id: string) => {
    const response = await httpClient.get(`/api/v1/poker/tables/${id}`);
    return response.data?.metadata || response.data;
  },

  // Tạo bàn chơi mới
  createTable: async (payload: CreateTablePayload) => {
    const response = await httpClient.post("/api/v1/poker/tables", payload);
    return response.data?.metadata || response.data;
  },

  // Thêm Bot AI vào bàn
  addBots: async (roomId: string, payload: AddBotPayload) => {
    const response = await httpClient.post(`/api/v1/poker/rooms/${roomId}/bots`, payload);
    return response.data?.metadata || response.data;
  },

  // Đuổi Bot khỏi bàn
  removeBot: async (roomId: string, botUserId: string) => {
    const response = await httpClient.delete(`/api/v1/poker/rooms/${roomId}/bots/${botUserId}`);
    return response.data?.metadata || response.data;
  },
};
