import { Activity, AlertTriangle, DoorOpen, Gauge, MapPinned, ShieldCheck, Sparkles, Utensils } from "lucide-react";

export type StadiumKey = "narendra_modi" | "eden_gardens" | "wankhede" | "chinnaswamy" | "chepauk";

export type StadiumProfile = {
  key: StadiumKey;
  name: string;
  city: string;
  capacity: number;
  liveMatch: string;
  accent: string;
  floodlight: string;
  congestionBias: number;
};

export type ZoneState = {
  id: string;
  label: string;
  type: "gate" | "stand" | "food" | "exit" | "vip";
  density: number;
  wait: number;
  flow: number;
  risk: "Stable" | "Elevated" | "Critical";
  x: number;
  y: number;
};

export const stadiumProfiles: StadiumProfile[] = [
  {
    key: "narendra_modi",
    name: "Narendra Modi Stadium",
    city: "Ahmedabad",
    capacity: 132000,
    liveMatch: "Qualifier Night",
    accent: "#35ff9b",
    floodlight: "#d8fff2",
    congestionBias: 9
  },
  {
    key: "eden_gardens",
    name: "Eden Gardens",
    city: "Kolkata",
    capacity: 68000,
    liveMatch: "Derby Evening",
    accent: "#20c7ff",
    floodlight: "#e7f7ff",
    congestionBias: 13
  },
  {
    key: "wankhede",
    name: "Wankhede Stadium",
    city: "Mumbai",
    capacity: 33108,
    liveMatch: "Coastal Classic",
    accent: "#7dd3fc",
    floodlight: "#eef8ff",
    congestionBias: 7
  },
  {
    key: "chinnaswamy",
    name: "M. Chinnaswamy Stadium",
    city: "Bengaluru",
    capacity: 40000,
    liveMatch: "Powerplay Surge",
    accent: "#60a5fa",
    floodlight: "#ecf5ff",
    congestionBias: 11
  },
  {
    key: "chepauk",
    name: "M. A. Chidambaram Stadium",
    city: "Chennai",
    capacity: 50000,
    liveMatch: "Spin Fortress",
    accent: "#facc15",
    floodlight: "#fff7d6",
    congestionBias: 10
  }
];

export const baseZones: Omit<ZoneState, "density" | "wait" | "flow" | "risk">[] = [
  { id: "g1", label: "North Gate", type: "gate", x: 50, y: 8 },
  { id: "g4", label: "East Plaza", type: "gate", x: 87, y: 24 },
  { id: "g6", label: "Metro Gate", type: "gate", x: 94, y: 51 },
  { id: "g9", label: "South Gate", type: "exit", x: 78, y: 84 },
  { id: "g11", label: "Pavilion Exit", type: "exit", x: 50, y: 92 },
  { id: "g16", label: "West Gate", type: "gate", x: 6, y: 51 },
  { id: "s1", label: "North Premium Stand", type: "stand", x: 50, y: 23 },
  { id: "s2", label: "East Family Stand", type: "stand", x: 72, y: 38 },
  { id: "s3", label: "South Lower Bowl", type: "stand", x: 50, y: 76 },
  { id: "s4", label: "West Upper Stand", type: "stand", x: 27, y: 39 },
  { id: "vip", label: "VIP Lounge", type: "vip", x: 37, y: 22 },
  { id: "food1", label: "North Food Court", type: "food", x: 41, y: 14 },
  { id: "food2", label: "South Food Street", type: "food", x: 59, y: 86 },
  { id: "food3", label: "East Pavilion Cafe", type: "food", x: 86, y: 61 }
];

export const navItems = [
  { label: "Command", icon: Gauge },
  { label: "Crowd Intel", icon: Activity },
  { label: "3D Twin", icon: MapPinned },
  { label: "AI Insights", icon: Sparkles },
  { label: "Safety", icon: ShieldCheck }
];

export const metricCards = [
  { label: "Stadium Load", value: "72%", delta: "+8.4%", icon: Activity, tone: "green" },
  { label: "Avg Queue ETA", value: "07m", delta: "-2.1m", icon: Utensils, tone: "blue" },
  { label: "Gate Pressure", value: "14.8k", delta: "+1.2k", icon: DoorOpen, tone: "amber" },
  { label: "Critical Alerts", value: "03", delta: "live", icon: AlertTriangle, tone: "red" }
];

export const insightFeed = [
  "Gate 6 pressure rising. Divert 18% of inbound flow toward North Gate.",
  "South Food Street queue predicted to peak in 11 minutes after strategic timeout.",
  "West Upper Stand is safe for family movement. Keep route lighting elevated.",
  "Emergency corridor near Pavilion Exit clear. Response team ETA under 90 seconds."
];
