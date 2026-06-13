import type { IEvent } from "@/models/Event";
import type { IUser } from "@/models/User";
import type { IRegistration } from "@/models/Registration";
import type {
  EventDTO,
  PublicUser,
  RegistrationDTO,
  RegistrationStatus,
} from "@/types";

// Helpers to turn Mongoose documents into plain objects (DTOs) that are
// safe to send to the client — ObjectId becomes a string, Date becomes an
// ISO string, and the password is never included.

type PopulatedOrganizer = {
  _id: { toString(): string };
  name: string;
  image?: string;
};

export function serializeUser(u: IUser): PublicUser {
  return {
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    phone: u.phone,
    image: u.image,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
  };
}

export function serializeEvent(
  e: IEvent & { organizer: PopulatedOrganizer | unknown },
  extra?: { myRegistrationStatus?: RegistrationStatus | null }
): EventDTO {
  const org = e.organizer as unknown as PopulatedOrganizer;
  const isPopulated = org && typeof org === "object" && "name" in org;

  return {
    id: e._id.toString(),
    title: e.title,
    description: e.description,
    date: e.date.toISOString(),
    endDate: e.endDate ? e.endDate.toISOString() : undefined,
    location: e.location,
    locationUrl: e.locationUrl,
    organizer: isPopulated
      ? {
          id: org._id.toString(),
          name: org.name,
          image: org.image,
        }
      : { id: String(e.organizer), name: "Unknown" },
    capacity: e.capacity,
    registrationCount: e.registrationCount,
    tags: e.tags ?? [],
    imageUrl: e.imageUrl,
    status: e.status,
    requiresApproval: e.requiresApproval,
    createdAt: e.createdAt.toISOString(),
    myRegistrationStatus: extra?.myRegistrationStatus ?? null,
    isFull:
      e.capacity != null && e.registrationCount >= e.capacity ? true : false,
  };
}

export function serializeRegistration(
  r: IRegistration & { event: unknown; user?: unknown }
): RegistrationDTO {
  return {
    id: r._id.toString(),
    status: r.status,
    notes: r.notes,
    calendarAdded: r.calendarAdded,
    registeredAt: r.registeredAt.toISOString(),
    event: serializeEvent(r.event as unknown as IEvent & { organizer: unknown }),
    user: r.user ? serializeUser(r.user as unknown as IUser) : undefined,
  };
}
