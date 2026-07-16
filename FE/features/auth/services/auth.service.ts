import httpClient from "@/core/api/http-client";

export const AuthService = {
  async login(data: any) {
    const response = await httpClient.post("/api/v1/auth/login", data);
    return response.data;
  },

  async logout() {
    const response = await httpClient.post("/api/v1/auth/logout");
    return response.data;
  },

  async forgotPassword(data: { email: string }) {
    const response = await httpClient.post("/api/v1/auth/forgot-password", data);
    return response.data;
  },

  async verifyOtp(data: { token?: string; email?: string; otp: string }) {
    const response = await httpClient.post("/api/v1/auth/verify-otp", data);
    return response.data;
  },

  async resendOtp(data: { email: string }) {
    const response = await httpClient.post("/api/v1/auth/resend-otp", data);
    return response.data;
  },

  async resetPassword(data: { token: string; password: string }) {
    const response = await httpClient.post("/api/v1/auth/reset-password", data);
    return response.data;
  },

  async getSessions() {
    const response = await httpClient.get("/api/v1/user/sessions");
    return response.data;
  },

  async revokeSession(id: string) {
    const response = await httpClient.delete(`/api/v1/user/sessions/${id}`);
    return response.data;
  },
};

