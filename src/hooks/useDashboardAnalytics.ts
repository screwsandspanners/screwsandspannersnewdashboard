import { api } from "@/api/client";
import { ANALYTICS_ENDPOINT_PATH } from "@/constants";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { AnalyticsResponse } from "@/types/analytics";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export function useDashboardAnalytics(
  page: number,
  limit: number
) {
  return useQuery({
    queryKey: [
      QUERY_KEYS.dashboardAnalytics,
      page,
      limit,
    ],

    queryFn: () =>
      api.get<AnalyticsResponse>(
        `${ANALYTICS_ENDPOINT_PATH}?page=${page}&limit=${limit}`
      ),

    placeholderData: keepPreviousData,
  });
}