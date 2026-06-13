import { Badge } from "@/components/ui/badge";
import type { EventStatus, RegistrationStatus } from "@/types";

const EVENT_CONFIG: Record<
  EventStatus,
  { label: string; variant: "default" | "secondary" | "warning" | "destructive" | "success" }
> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  PUBLISHED: { label: "Published", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  ENDED: { label: "Ended", variant: "secondary" },
};

const REG_CONFIG: Record<
  RegistrationStatus,
  { label: string; variant: "default" | "secondary" | "warning" | "success" }
> = {
  CONFIRMED: { label: "Registered", variant: "success" },
  PENDING: { label: "Pending approval", variant: "warning" },
  WAITLISTED: { label: "Waitlisted", variant: "warning" },
  CANCELLED: { label: "Cancelled", variant: "secondary" },
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  const { label, variant } = EVENT_CONFIG[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function RegistrationStatusBadge({
  status,
}: {
  status: RegistrationStatus;
}) {
  const { label, variant } = REG_CONFIG[status];
  return <Badge variant={variant}>{label}</Badge>;
}
