// ============================================================
// Shared types for the whole application (client + server)
// ============================================================

export type Role = "ADMIN" | "ORGANIZER" | "STUDENT";

export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "ENDED";

export type RegistrationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "WAITLISTED";

/** User shape that is safe to send to the client (without the password). */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

/** Organizer populated inside an event. */
export interface EventOrganizer {
  id: string;
  name: string;
  image?: string;
}

export interface EventDTO {
  id: string;
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  location: string;
  locationUrl?: string;
  organizer: EventOrganizer;
  capacity: number | null;
  registrationCount: number;
  tags: string[];
  imageUrl?: string;
  status: EventStatus;
  requiresApproval: boolean;
  createdAt: string;
  // Set by the server when a user is signed in: the user's registration status for this event
  myRegistrationStatus?: RegistrationStatus | null;
  isFull?: boolean;
}

export interface RegistrationDTO {
  id: string;
  status: RegistrationStatus;
  notes?: string;
  calendarAdded: boolean;
  registeredAt: string;
  event: EventDTO;
  user?: PublicUser;
}

/** A single attendee row for the organizer's registration-management view. */
export interface EventRegistrationDTO {
  id: string;
  status: RegistrationStatus;
  notes?: string;
  registeredAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: Role;
  } | null;
}

/** Pagination metadata returned alongside list endpoints. */
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface EventFilters {
  search?: string;
  tag?: string;
  status?: EventStatus;
  scope?: "upcoming" | "past" | "all";
  organizer?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  publishedEvents: number;
  totalRegistrations: number;
  registrationsToday: number;
  usersByRole: Record<Role, number>;
}

/** Consistent API error response shape. */
export interface ApiError {
  error: string;
}
