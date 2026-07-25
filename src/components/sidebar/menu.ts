import {
    Home,
    Users,
    Truck,
    ShoppingBag,
    Gift,
    LifeBuoy,
    BarChart2,
    LucideIcon,
  } from "lucide-react";
  
  export interface MenuItem {
    name: string;
    path: string;
    icon: LucideIcon;
  }
  
  export const menuItems: MenuItem[] = [
    {
      name: "Overview",
      path: "/overview",
      icon: Home,
    },
    {
      name: "Admins",
      path: "/admins",
      icon: Users,
    },
    {
      name: "Service Delivery",
      path: "/service-delivery",
      icon: Truck,
    },
    {
      name: "Suppliers",
      path: "/suppliers",
      icon: ShoppingBag,
    },
    {
      name: "Promotions",
      path: "/promotionsAndSubscriptions",
      icon: Gift,
    },
    {
      name: "Support",
      path: "/support",
      icon: LifeBuoy,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: BarChart2,
    },
  ];