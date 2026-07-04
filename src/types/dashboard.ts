import { LucideIcon } from "lucide-react";
import { WidgetThemes } from "./theme";

export interface DashboardSummaryResponse {
    totalRegistrations: number;
    serviceProviders: UserSummary;
    customers: UserSummary;
    suppliers: UserSummary;
    totalActiveUsers: number;
    totalInactiveUsers: number;
  }
  
  export interface UserSummary {
    total: number;
    active: number;
    inactive: number;
  }

  export type WidgetTheme = keyof typeof WidgetThemes;

  export interface DashboardWidget {
    title: string;
    value: string | number;
    subValue: string;
    theme: WidgetTheme;
    icon: LucideIcon;
  }