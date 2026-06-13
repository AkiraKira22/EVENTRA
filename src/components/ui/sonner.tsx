"use client";

import { Toaster as SonnerToaster } from "sonner";

// Toaster global — dipasang sekali di root layout.
// Pakai: import { toast } from "sonner"; toast.success("...")
export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
        },
      }}
    />
  );
}
