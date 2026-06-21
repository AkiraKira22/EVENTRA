import "server-only";
import type { HydratedDocument } from "mongoose";
import { type IEvent } from "@/models/Event";
import { Registration } from "@/models/Registration";
import { User } from "@/models/User";
import { sendWaitlistPromotionEmail } from "@/lib/email";

/**
 * After a slot frees up on an event, promote the oldest waitlisted
 * registration into it (when the event now has spare capacity) and notify
 * the attendee by email. No-op for unlimited-capacity events or when the
 * event is still full.
 *
 * Expects `event` to already reflect the freed slot (count decremented).
 */
export async function promoteFromWaitlist(
  event: HydratedDocument<IEvent>
): Promise<void> {
  if (event.capacity == null) return; // unlimited → no waitlist
  if (event.registrationCount >= event.capacity) return; // still full

  const next = await Registration.findOne({
    event: event._id,
    status: "WAITLISTED",
  }).sort({ registeredAt: 1 });
  if (!next) return;

  next.status = "CONFIRMED";
  await next.save();

  event.registrationCount += 1;
  await event.save();

  const user = await User.findById(next.user).lean();
  if (user?.email) {
    await sendWaitlistPromotionEmail({
      to: user.email,
      name: user.name,
      event: { id: event._id.toString(), title: event.title, date: event.date },
    });
  }
}
