import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = { title: "Sign Up" };

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Create a new account</h1>
        <p className="text-sm text-muted-foreground">
          It&apos;s free and takes just a few seconds.
        </p>
      </div>

      <Suspense fallback={<div className="h-10" />}>
        <GoogleSignInButton />
      </Suspense>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or with email</span>
        <Separator className="flex-1" />
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in here
        </Link>
      </p>
    </div>
  );
}
