import type { Role } from "@/types";
import "next-auth";
import "next-auth/jwt";

// Extend NextAuth's built-in types to carry role, id, and the Google access token.

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      role: Role;
    };
    accessToken?: string;
    error?: "RefreshAccessTokenError";
  }

  interface User {
    id: string;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: "RefreshAccessTokenError";
  }
}
