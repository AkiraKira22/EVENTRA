import { Badge } from "@/components/ui/badge";
import { Shield, Star, GraduationCap } from "lucide-react";
import type { Role } from "@/types";

const CONFIG: Record<
  Role,
  { label: string; variant: "default" | "warning" | "secondary"; Icon: typeof Shield }
> = {
  ADMIN: { label: "Admin", variant: "warning", Icon: Shield },
  ORGANIZER: { label: "Organizer", variant: "default", Icon: Star },
  STUDENT: { label: "Attendee", variant: "secondary", Icon: GraduationCap },
};

export function RoleBadge({ role }: { role: Role }) {
  const { label, variant, Icon } = CONFIG[role];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
