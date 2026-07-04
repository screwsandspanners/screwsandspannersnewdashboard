import { api } from "@/api/client";
import { STATISTICS_ENDPOINT_PATH } from "@/constants";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { DashboardSummaryResponse } from "@/types/dashboard";
import { useQuery } from "@tanstack/react-query";

export function useDashboardStatistics() {
    return useQuery({
        queryKey: QUERY_KEYS.dashboardStatistics,
        queryFn: () =>
            api.get<DashboardSummaryResponse>(
                STATISTICS_ENDPOINT_PATH
            ),
    });
}