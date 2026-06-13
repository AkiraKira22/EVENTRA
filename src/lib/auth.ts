import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import type { Role } from "@/types";

const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar.events",
].join(" ");

/**
 * Refresh the Google access token using the refresh token when the old one
 * expires. Without this, the Calendar integration stops working after ~1 hour.
 */
async function refreshGoogleAccessToken(token: JWT): Promise<JWT> {
  try {
    if (!token.refreshToken) throw new Error("No refresh token");

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshed = await res.json();
    if (!res.ok) throw refreshed;

    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
      // Google does not always return a new refresh token — keep the old one.
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" as const };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: GOOGLE_SCOPES,
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectDB();

        const user = await User.findOne({
          email: credentials.email.toLowerCase(),
        }).select("+password");

        if (!user || !user.password) return null;
        if (!user.isActive) throw new Error("Account is deactivated");

        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    /** On Google sign-in: upsert the user in MongoDB & set a default role. */
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        await connectDB();
        const email = user.email?.toLowerCase();
        if (!email) return false;

        let dbUser = await User.findOne({ email });
        if (!dbUser) {
          dbUser = await User.create({
            name: user.name ?? "Google User",
            email,
            googleId: (profile as { sub?: string })?.sub,
            image: user.image,
            role: "STUDENT",
          });
        } else if (!dbUser.googleId) {
          // Link the Google account to an existing email/password account.
          dbUser.googleId = (profile as { sub?: string })?.sub;
          if (!dbUser.image && user.image) dbUser.image = user.image;
          await dbUser.save();
        }
        if (!dbUser.isActive) return false;
      }
      return true;
    },

    async jwt({ token, user, account }) {
      // First sign-in (credentials): `user` is populated from authorize().
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role: Role }).role;
      }

      // Google sign-in: store the access token for the Calendar API + pull role/id from DB.
      if (account?.provider === "google") {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
        }
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token ?? token.refreshToken;
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600 * 1000;
        return token;
      }

      // Refresh the Google access token if it has expired.
      if (
        token.accessTokenExpires &&
        Date.now() >= token.accessTokenExpires &&
        token.refreshToken
      ) {
        return refreshGoogleAccessToken(token);
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

// ============================================================
// RBAC helpers for use in API Route Handlers & Server Components
// ============================================================

export class AuthError extends Error {
  constructor(public status: 401 | 403, message: string) {
    super(message);
  }
}

/** Get the current server session (or null). */
export function getSession() {
  return getServerSession(authOptions);
}

/** Ensure the user is signed in; throws AuthError(401) otherwise. */
export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new AuthError(401, "Not signed in");
  return session.user;
}

/** Ensure the user is signed in AND has one of the roles; throws 401/403 otherwise. */
export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new AuthError(403, "You don't have permission for this action");
  }
  return user;
}
