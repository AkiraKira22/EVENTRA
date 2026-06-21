import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/mongodb";
import { Event } from "@/models/Event";

// Regenerate hourly so newly published events appear without a redeploy.
export const revalidate = 3600;

const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/events`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/login`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/register`, changeFrequency: "monthly", priority: 0.3 },
  ];

  let eventRoutes: MetadataRoute.Sitemap = [];
  try {
    await connectDB();
    const events = await Event.find({ status: "PUBLISHED" })
      .select("_id updatedAt")
      .sort({ date: 1 })
      .limit(2000)
      .lean<{ _id: { toString(): string }; updatedAt?: Date }[]>();

    eventRoutes = events.map((e) => ({
      url: `${siteUrl}/events/${e._id.toString()}`,
      lastModified: e.updatedAt ?? new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch (error) {
    // DB not configured (e.g. during build) — ship the static routes only.
    console.error("[sitemap]", error);
  }

  return [...staticRoutes, ...eventRoutes];
}
