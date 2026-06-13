/**
 * Initial seed data for development.
 * Run: npm run seed
 *
 * This script is self-contained (no @/ aliases) so it can be run directly
 * by tsx without extra configuration.
 */
import { config } from "dotenv";
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not set in .env.local");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("✓ Connected to MongoDB");

  const UserSchema = new Schema(
    {
      name: String,
      email: { type: String, unique: true },
      password: String,
      role: String,
      isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
  );

  const EventSchema = new Schema(
    {
      title: String,
      description: String,
      date: Date,
      location: String,
      organizer: { type: Schema.Types.ObjectId, ref: "User" },
      capacity: { type: Number, default: null },
      registrationCount: { type: Number, default: 0 },
      tags: [String],
      imageUrl: String,
      status: { type: String, default: "PUBLISHED" },
      requiresApproval: { type: Boolean, default: false },
    },
    { timestamps: true }
  );

  const User = mongoose.models.User || mongoose.model("User", UserSchema);
  const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);

  // Clear old data (optional — comment out if you don't want a reset).
  await User.deleteMany({});
  await Event.deleteMany({});
  console.log("✓ Collections cleared");

  const pw = await bcrypt.hash("password123", 12);

  const [admin, organizer] = await User.create([
    { name: "Eventra Admin", email: "admin@eventra.dev", password: pw, role: "ADMIN" },
    { name: "Olivia Organizer", email: "organizer@eventra.dev", password: pw, role: "ORGANIZER" },
    { name: "Sam Attendee", email: "student@eventra.dev", password: pw, role: "STUDENT" },
  ]);
  console.log("✓ 3 users created (all passwords: password123)");

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  await Event.create([
    {
      title: "AI Workshop for Beginners",
      description:
        "Learn the fundamentals of artificial intelligence and machine learning in this hands-on session. Perfect for beginners with no technical background.",
      date: new Date(now + 7 * day),
      location: "Main Hall, Building A",
      organizer: organizer._id,
      capacity: 100,
      tags: ["workshop", "AI", "technology"],
      imageUrl:
        "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=1200&q=80",
      status: "PUBLISHED",
    },
    {
      title: "Acoustic Music Night",
      description: "A relaxed evening with acoustic performances by local bands.",
      date: new Date(now + 14 * day),
      location: "Open Stage, Central Plaza",
      organizer: admin._id,
      capacity: 300,
      tags: ["music", "entertainment", "free"],
      imageUrl:
        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80",
      status: "PUBLISHED",
    },
    {
      title: "Career & Networking Seminar",
      description:
        "Meet industry professionals and learn tips for building the career you want.",
      date: new Date(now + 21 * day),
      location: "Seminar Room, 3rd Floor",
      organizer: organizer._id,
      capacity: 50,
      tags: ["career", "networking", "seminar"],
      imageUrl:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
      status: "PUBLISHED",
    },
    {
      title: "24-Hour Hackathon (Draft)",
      description: "An intensive 24-hour coding competition. Still being prepared.",
      date: new Date(now + 40 * day),
      location: "Computer Lab",
      organizer: organizer._id,
      capacity: 80,
      tags: ["coding", "competition"],
      status: "DRAFT",
    },
  ]);
  console.log("✓ 4 events created (3 published, 1 draft)");

  console.log("\n🎉 Seed complete!");
  console.log("   Admin login     : admin@eventra.dev / password123");
  console.log("   Organizer login : organizer@eventra.dev / password123");
  console.log("   Attendee login  : student@eventra.dev / password123");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
