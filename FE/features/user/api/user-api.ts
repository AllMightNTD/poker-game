import httpClient from "@/core/api/http-client";

export interface UpdateProfilePayload {
  user_name?: string;
  bio?: string;
}

export const userApi = {
  // Lấy thông tin tài khoản hiện tại
  getMe: async () => {
    const response = await httpClient.get("/api/v1/user/me");
    return response.data?.metadata || response.data;
  },

  // Cập nhật thông tin cá nhân
  updateProfile: async (payload: UpdateProfilePayload) => {
    const response = await httpClient.put("/api/v1/user/profile", payload);
    return response.data?.metadata || response.data;
  },

  // Upload Avatar mới
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await httpClient.post("/api/v1/user/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data?.metadata || response.data;
  },

  // Lấy lịch sử ván đấu của người chơi
  getMatchHistory: async (params?: { page?: number; limit?: number }) => {
    const response = await httpClient.get("/api/v1/user/history", { params });
    return response.data?.metadata || response.data;
  },
};
