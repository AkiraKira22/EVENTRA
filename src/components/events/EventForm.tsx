"use client";

import { cloneElement, isValidElement, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { eventSchema, type EventInput } from "@/lib/validations";
import { useCreateEvent, useUpdateEvent } from "@/hooks/useEvents";
import type { EventDTO } from "@/types";

function toLocalInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  // Format for <input type="datetime-local">
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventForm({ event }: { event?: EventDTO }) {
  const router = useRouter();
  const isEdit = Boolean(event);
  const create = useCreateEvent();
  const update = useUpdateEvent(event?.id ?? "");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title ?? "",
      description: event?.description ?? "",
      date: toLocalInput(event?.date),
      endDate: toLocalInput(event?.endDate),
      location: event?.location ?? "",
      locationUrl: event?.locationUrl ?? "",
      capacity: event?.capacity ?? "",
      tags: event?.tags?.join(", ") ?? "",
      imageUrl: event?.imageUrl ?? "",
      status: event?.status ?? "PUBLISHED",
      requiresApproval: event?.requiresApproval ?? false,
    },
  });

  const status = watch("status");
  const imageUrl = watch("imageUrl");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      // Note: don't set Content-Type — the browser adds the multipart boundary.
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Upload failed");
      setValue("imageUrl", data.url, { shouldValidate: true });
      toast.success("Image uploaded");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function onSubmit(values: EventInput) {
    const mutation = isEdit ? update : create;
    mutation.mutate(values, {
      onSuccess: (res) => {
        toast.success(isEdit ? "Event updated" : "Event created");
        router.push(`/events/${res.event.id}`);
        router.refresh();
      },
      onError: (e) => toast.error((e as Error).message),
    });
  }

  const isPending = create.isPending || update.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="grid gap-5 p-6">
          <Field label="Event Title" error={errors.title?.message}>
            <Input placeholder="e.g. AI Workshop for Beginners" {...register("title")} />
          </Field>

          <Field label="Description" error={errors.description?.message}>
            <Textarea
              rows={5}
              placeholder="Describe what this event is about…"
              {...register("description")}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Starts" error={errors.date?.message}>
              <Input type="datetime-local" {...register("date")} />
            </Field>
            <Field label="Ends (optional)" error={errors.endDate?.message}>
              <Input type="datetime-local" {...register("endDate")} />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Location" error={errors.location?.message}>
              <Input placeholder="e.g. Main Hall" {...register("location")} />
            </Field>
            <Field label="Location / Maps Link (optional)" error={errors.locationUrl?.message}>
              <Input placeholder="https://maps.google.com/…" {...register("locationUrl")} />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Capacity (leave empty = unlimited)" error={errors.capacity?.message}>
              <Input type="number" min={1} placeholder="100" {...register("capacity")} />
            </Field>
            <Field label="Tags (comma-separated)" error={errors.tags?.message}>
              <Input placeholder="workshop, free, technology" {...register("tags")} />
            </Field>
          </div>

          <Field label="Cover Image (optional)" error={errors.imageUrl?.message}>
            <div className="space-y-3">
              {imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="Cover preview"
                  className="aspect-[16/9] w-full rounded-lg border border-border object-cover"
                />
              )}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploading ? "Uploading…" : "Upload image"}
                </Button>
                {imageUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setValue("imageUrl", "")}
                  >
                    Remove
                  </Button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFile}
                />
              </div>
              <Input placeholder="…or paste an image URL" {...register("imageUrl")} />
            </div>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Status">
              <Select
                value={status}
                onValueChange={(v) => setValue("status", v as EventInput["status"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLISHED">Published (open for registration)</SelectItem>
                  <SelectItem value="DRAFT">Draft (hidden)</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="ENDED">Ended</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Manual approval">
              <label className="flex h-10 items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[hsl(var(--primary))]"
                  {...register("requiresApproval")}
                />
                Each registrant must be approved first
              </label>
            </Field>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "Save Changes" : "Create Event"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  const reactId = useId();
  const errorId = `${reactId}-error`;

  // Associate the error message with the control for screen readers.
  const control =
    isValidElement(children) && error
      ? cloneElement(children as React.ReactElement, {
          "aria-invalid": true,
          "aria-describedby": errorId,
        })
      : children;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {control}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
