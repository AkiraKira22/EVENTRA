"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  LogOut,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { MobileNav } from "@/components/layout/MobileNav";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getInitials, cn } from "@/lib/utils";
import { primaryNav, dashboardLink, visibleNav, activeHref } from "@/lib/nav";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, role } = useCurrentUser();

  const links = visibleNav(primaryNav, role);
  if (isAuthenticated) links.push(dashboardLink);
  const active = activeHref(pathname, links.map((l) => l.href));

  // On the home page, go from glass to solid once the full-screen top section
  // (the hero) has scrolled out of view. Other pages keep the glass header.
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setScrolled(false);
      return;
    }
    let raf = 0;
    const update = () => {
      setScrolled(window.scrollY > window.innerHeight - 80);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [isHome]);

  const solid = isHome && scrolled;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/60 backdrop-blur-xl transition-colors duration-300",
        solid ? "bg-background shadow-sm" : "bg-background/70"
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          <MobileNav />
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight">
              Event<span className="text-gradient">ra</span>
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label, icon: Icon }) => (
            <Button
              key={href}
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                active === href &&
                  "bg-primary/15 text-primary hover:bg-primary/15 hover:text-primary"
              )}
            >
              <Link href={href}>
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border border-border">
                    {user.image && <AvatarImage src={user.image} alt={user.name} />}
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs font-normal text-muted-foreground">
                      {user.email}
                    </span>
                    <div className="pt-1">
                      <RoleBadge role={user.role} />
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/registrations">
                    <UserIcon className="h-4 w-4" />
                    My Registrations
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
