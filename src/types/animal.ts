import { LucideIcon } from "lucide-react";

export interface AnimalTheme {
  id: string;

  name: string;

  eyeName: string;

  icon: LucideIcon;

  primary: string;
  secondary: string;
  accent: string;

  background: string;

  watermark: string;

  description: string;
}