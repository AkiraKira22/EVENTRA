import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CalendarCheck,
  CalendarCog,
  CalendarPlus,
  Compass,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getSession();
  const user = session?.user;
  if (!user) return null;

  const quickLinks = [
    {
      href: "/events",
      title: "Browse Events",
      desc: "Discover new activities to join.",
      icon: Compass,
      show: true,
    },
    {
      href: "/dashboard/registrations",
      title: "My Registrations",
      desc: "See the events you've signed up for.",
      icon: CalendarCheck,
      show: true,
    },
    {
      href: "/events/new",
      title: "Create Event",
      desc: "Create and publish a new event.",
      icon: CalendarPlus,
      show: user.role === "ORGANIZER" || user.role === "ADMIN",
    },
    {
      href: "/dashboard/my-events",
      title: "My Events",
      desc: "Manage the events you organize.",
      icon: CalendarCog,
      show: user.role === "ORGANIZER" || user.role === "ADMIN",
    },
    {
      href: "/dashboard/admin",
      title: "Admin Panel",
      desc: "System statistics & moderation.",
      icon: ShieldCheck,
      show: user.role === "ADMIN",
    },
  ].filter((l) => l.show);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hi, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back to your dashboard.
          </p>
        </div>
        <RoleBadge role={user.role} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map(({ href, title, desc, icon: Icon }) => (
          <Link key={href} href={href} className="group">
            <Card className="h-full transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
              <CardContent className="p-6">
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="flex items-center gap-1 font-semibold group-hover:text-primary">
                  {title}
                  <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
