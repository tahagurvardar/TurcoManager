import {
  Activity,
  Banknote,
  BarChart3,
  CalendarDays,
  Dumbbell,
  Gauge,
  Handshake,
  LayoutDashboard,
  Shield,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

export const managerNavigation = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "squad", label: "Kadro", icon: Users },
  { id: "match", label: "Maç Merkezi", icon: Activity },
  { id: "tactics", label: "Taktik", icon: Gauge },
  { id: "training", label: "Antrenman", icon: Dumbbell },
  { id: "transfers", label: "Transfer", icon: Shield },
  { id: "finances", label: "Finans", icon: Banknote },
  { id: "academy", label: "Akademi", icon: Sparkles },
  { id: "standings", label: "Puan Durumu", icon: Trophy },
  { id: "management", label: "Yönetim", icon: Handshake },
];

export const adminNavigation = [
  { id: "admin", label: "Admin Paneli", icon: LayoutDashboard },
  { id: "clubs", label: "Kulüpler", icon: Shield },
  { id: "calendar", label: "Fikstür", icon: CalendarDays },
  { id: "analytics", label: "Lig Analitiği", icon: BarChart3 },
];
