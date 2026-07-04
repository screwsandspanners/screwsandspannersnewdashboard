import { AnimalTheme } from "@/types/animal";
import { Bird, Cat, Eye, PawPrint } from "lucide-react";

import WolfWatermark from "@/assets/animals/wolf.svg";

export const Wolf: AnimalTheme = {
  id: "wolf",

  name: "Wolf",

  eyeName: "WolfEye",

  icon: PawPrint,

  primary: "#334155",

  secondary: "#64748B",

  accent: "#CBD5E1",

  background: "#F8FAFC",

  watermark: WolfWatermark,

  description: "Leadership • Teamwork • Strength",
};

export const Owl: AnimalTheme = {
    id:"Owl",

    name:"Owl",

    eyeName:"OwlEye",

    icon:Eye,

    primary:"#7C3AED",

    secondary:"#A78BFA",

    accent:"#DDD6FE",

    background:
        "linear-gradient(135deg,#FAF5FF,#E9D5FF)",

    watermark:
        "/animals/owl-feathers.svg",

    description:
        "Wisdom • Intelligence • Insight"
}

export const Panther: AnimalTheme = {
    id:"Panther",

    name:"Panther",

    eyeName:"PantherEye",

    icon:Cat,

    primary:"#18181B",

    secondary:"#52525B",

    accent:"#A1A1AA",

    background:
        "linear-gradient(135deg,#F8FAFC,#E4E4E7)",

    watermark:
        "/animals/panther-spots.svg",

    description:
        "Stealth • Precision • Confidence"
}

export const Falcon: AnimalTheme = {
    id:"Falcon",

    name:"Falcon",

    eyeName:"FalconEye",

    icon:Bird,

    primary:"#2563EB",

    secondary:"#60A5FA",

    accent:"#BFDBFE",

    background:
        "linear-gradient(135deg,#EFF6FF,#DBEAFE)",

    watermark:
        "/animals/falcon-feather.svg",

    description:
        "Fast • Precise • Visionary"
}

export const Tiger: AnimalTheme = {
    id:"Tiger",

    name: "Tiger",
    eyeName: "TigerEye",

    icon: Cat,

    primary:"#EA580C",
    secondary:"#FB923C",
    accent:"#FDBA74",

    background:
        "linear-gradient(135deg,#FFF7ED,#FED7AA)",

    watermark:
        "/animals/tiger-stripes.svg",

    description:
        "Bold • Powerful • Fearless"
}

export const Animals = [
    Wolf,
    Tiger,
    Falcon,
    Owl,
    Panther
];