/**
 * Isolated API layer for the blogs feature.
 * All HTTP calls are centralized here — components must NOT call httpClient directly.
 * Per frontend-dev-guidelines: "One API file per feature, no inline axios calls."
 */

import httpClient from "@/core/api/http-client";
import type {
  AiCoachResponse,
  BlogListPage,
  BlogListParams,
  BlogPost,
  HandData,
  HandListParams,
  HandListResponse,
} from "../types";

export const blogsApi = {
  /**
   * Fetch a single blog post by its slug.
   */
  getBySlug: async (slug: string): Promise<BlogPost> => {
    const res = await httpClient.get<BlogPost>(`/api/v1/blogs/${slug}`);
    return res.data;
  },

  /**
   * Fetch a paginated list of blog posts.
   */
  list: async (params: BlogListParams = {}): Promise<BlogListPage> => {
    const urlParams = new URLSearchParams({
      limit: String(params.limit ?? 5),
    });
    if (params.cursor) urlParams.set("cursor", params.cursor);
    if (params.category) urlParams.set("category", params.category);

    const res = await httpClient.get<BlogListPage>(
      `/api/v1/blogs?${urlParams.toString()}`
    );
    return res.data;
  },
};

export const handsApi = {
  /**
   * Fetch a paginated list of poker hands (admin endpoint).
   */
  list: async (params: HandListParams = {}): Promise<HandListResponse> => {
    const res = await httpClient.get<HandListResponse | HandListResponse["data"]>(
      "/api/v1/admin/hands",
      { params: { limit: params.limit, tableId: params.tableId || undefined } }
    );
    const rawData = res.data;
    // Normalize: backend may return an array directly or a structured response
    if (Array.isArray(rawData)) {
      return { data: rawData as HandListResponse["data"], nextCursor: null };
    }
    const structured = rawData as HandListResponse;
    return {
      data: structured.data ?? [],
      nextCursor: structured.nextCursor ?? null,
    };
  },

  /**
   * Fetch the full replay data for a single hand by its ID.
   */
  getById: async (handId: string): Promise<HandData> => {
    const res = await httpClient.get<HandData>(`/api/v1/blogs/hands/${handId}`);
    return res.data;
  },

  /**
   * Trigger the AI Coach analysis for a specific hand.
   */
  requestAiCoach: async (handId: string): Promise<AiCoachResponse> => {
    const res = await httpClient.post<AiCoachResponse>(
      `/api/v1/blogs/hands/${handId}/ai-coach`,
      {}
    );
    return res.data;
  },
};
