import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { Event } from "@/models/Event";
import { Registration } from "@/models/Registration";
import { User } from "@/models/User";
import { requireUser, AuthError } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { assertSameOrigin } from "@/lib/http";
import { promoteFromWaitlist } from "@/lib/registrations";
import { sendApprovalDecisionEmail } from "@/lib/email";

const schema = z.object({ action: z.enum(["approve", "reject"]) });

type Params = { params: { registrationId: string } };

// PATCH /api/registrations/[registrationId] — approve or reject a registration.
// Restricted to the event's organizer or an admin.
export async function PATCH(request: Request, { params }: Params) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    await connectDB();

    const reg = await Registration.findById(params.registrationId);
    if (!reg) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    const event = await Event.findById(reg.event);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const isOwner = event.organizer.toString() === user.id;
    if (!isOwner && user.role !== "ADMIN") {
      throw new AuthError(
        403,
        "Only the event organizer or an admin can manage registrations"
      );
    }

    const { action } = schema.parse(await request.json());

    if (reg.status === "CANCELLED") {
      return NextResponse.json(
        { error: "This registration was already cancelled" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      if (reg.status === "CONFIRMED") {
        return NextResponse.json({ message: "Already confirmed", status: reg.status });
      }
      // A waitlisted registrant doesn't yet hold a slot; promoting them takes one.
      const heldSlot = reg.status === "PENDING";
      reg.status = "CONFIRMED";
      await reg.save();
      if (!heldSlot) {
        event.registrationCount += 1;
        await event.save();
      }
    } else {
      const tookSlot = reg.status === "PENDING" || reg.status === "CONFIRMED";
      reg.status = "CANCELLED";
      await reg.save();
      if (tookSlot) {
        event.registrationCount = Math.max(0, event.registrationCount - 1);
        await event.save();
        // Freed a slot — promote the next person off the waitlist.
        await promoteFromWaitlist(event);
      }
    }

    const registrant = await User.findById(reg.user).lean();
    if (registrant?.email) {
      await sendApprovalDecisionEmail({
        to: registrant.email,
        name: registrant.name,
        event: { id: event._id.toString(), title: event.title, date: event.date },
        approved: action === "approve",
      });
    }

    return NextResponse.json({
      message: action === "approve" ? "Registration approved" : "Registration rejected",
      status: reg.status,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
