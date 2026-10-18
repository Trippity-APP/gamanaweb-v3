"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Upload } from "@/components/icons";
import { toast } from "@/hooks/use-toast";
import { apiFetch, ApiError } from "@/lib/api/client";
import { userProfileSchema, type UserProfile } from "@/lib/api/schemas/profile";
import { MAX_PHOTO_BYTES, PHOTO_TYPES, resizeImage } from "@/lib/account/image-resize";
import { initialsFor } from "@/lib/account/nav";
import { useAuth } from "@/lib/auth/auth-context";

const schema = z.object({
  first_name: z.string().trim().min(1, "Please enter your first name.").max(50),
  last_name: z.string().trim().max(50),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email address.")]),
  dob: z.string(),
  gender: z.string(),
});

type Values = z.infer<typeof schema>;

const GENDERS = [
  { value: "", label: "Prefer not to say" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non_binary", label: "Non-binary" },
  { value: "other", label: "Other" },
];

const FIELD = "h-12 rounded-xl border-sand-200 text-base";

function toValues(p: UserProfile): Values {
  return {
    first_name: p.first_name ?? "",
    last_name: p.last_name ?? "",
    email: p.email ?? "",
    dob: (p.dob ?? "").slice(0, 10),
    gender: p.gender ?? "",
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshProfile, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues({} as UserProfile) });

  useEffect(() => {
    apiFetch("/users/profile", { auth: "required", schema: userProfileSchema })
      .then((p) => {
        setProfile(p);
        form.reset(toValues(p));
      })
      .catch(() => toast({ title: "Couldn't load your profile", variant: "destructive" }));
  }, [form]);

  async function onSubmit(values: Values) {
    try {
      const updated = await apiFetch("/users/profile", {
        method: "PATCH",
        auth: "required",
        schema: userProfileSchema,
        body: {
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email || null,
          dob: values.dob || null,
          gender: values.gender || null,
        },
      });
      setProfile(updated);
      form.reset(toValues(updated));
      await refreshProfile();
      toast({ title: "Profile updated" });
    } catch (error) {
      toast({ title: error instanceof ApiError ? error.message : "Couldn't save your profile", variant: "destructive" });
    }
  }

  async function onPhoto(file: File | undefined) {
    if (!file || !user) return;
    setPhotoError("");
    if (!PHOTO_TYPES.includes(file.type)) return setPhotoError("Choose a JPG or PNG image.");
    if (file.size > MAX_PHOTO_BYTES) return setPhotoError("That photo is larger than 5 MB.");
    setPhotoBusy(true);
    try {
      const blob = await resizeImage(file, 512);
      const body = new FormData();
      body.append("file", blob, "profile.jpg");
      await apiFetch(`/users/profile-pic/${encodeURIComponent(user.id)}`, { method: "PUT", auth: "required", body });
      await refreshProfile();
      toast({ title: "Photo updated" });
    } catch {
      setPhotoError("Couldn't upload that photo. Try another one.");
    } finally {
      setPhotoBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function deleteAccount() {
    setDeleting(true);
    try {
      await apiFetch("/compliance/gdpr/data-deletion", { method: "POST", auth: "required", body: { reason: "user_request_web" } });
      await logout();
      setDeleteOpen(false);
      toast({ title: "Your account deletion request has been received" });
      router.replace("/");
    } catch {
      toast({ title: "Couldn't delete your account. Please try again.", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }

  if (!user) return null;

  return (
    <div className="space-y-8">
      <h1 className="font-display text-h2 font-bold text-ink">Profile</h1>

      <section className="rounded-3xl bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-center gap-5">
          <Avatar className="h-24 w-24">
            {user.profilePic && <AvatarImage src={user.profilePic} alt="Your profile photo" />}
            <AvatarFallback className="bg-gradient-to-r from-brand-600 to-brand-800 text-2xl font-bold text-white">
              {initialsFor(user.firstName, user.lastName, user.email || user.phone)}
            </AvatarFallback>
          </Avatar>
          <div>
            <input
              ref={fileRef}
              id="profile-photo"
              type="file"
              accept="image/jpeg,image/png"
              className="sr-only"
              onChange={(e) => void onPhoto(e.target.files?.[0])}
            />
            <Button
              type="button"
              variant="outline"
              disabled={photoBusy}
              onClick={() => fileRef.current?.click()}
              className="focus-ring h-11 gap-2 rounded-full border-sand-200"
            >
              {photoBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />}
              Change photo
            </Button>
            <p className="mt-2 text-xs text-ink-soft">JPG or PNG, up to 5 MB.</p>
            <p role="status" aria-live="polite" className="text-sm font-medium text-red-700">
              {photoError}
            </p>
          </div>
        </div>

        {!profile ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name *</FormLabel>
                      <FormControl>
                        <Input autoComplete="given-name" className={FIELD} {...field} />
                      </FormControl>
                      <FormMessage role="alert" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input autoComplete="family-name" className={FIELD} {...field} />
                      </FormControl>
                      <FormMessage role="alert" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" autoComplete="email" className={FIELD} {...field} />
                      </FormControl>
                      <FormMessage role="alert" />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <Label htmlFor="profile-phone">Phone</Label>
                  <Input
                    id="profile-phone"
                    readOnly
                    value={user.phone ? `${user.countryCode} ${user.phone}`.trim() : "Not added"}
                    aria-describedby="profile-phone-hint"
                    className={`${FIELD} bg-sand-50 text-ink-soft`}
                  />
                  <p id="profile-phone-hint" className="text-sm text-ink-soft">
                    Linked to your login
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of birth</FormLabel>
                      <FormControl>
                        <Input type="date" max={new Date().toISOString().slice(0, 10)} className={FIELD} {...field} />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <select {...field} className={`focus-ring flex w-full border bg-white px-3 ${FIELD}`}>
                          {GENDERS.map((g) => (
                            <option key={g.value} value={g.value}>
                              {g.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="submit"
                disabled={!form.formState.isDirty || form.formState.isSubmitting}
                className="focus-ring h-12 rounded-full bg-gradient-to-r from-brand-600 to-brand-800 px-8 text-base font-semibold text-white"
              >
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                Save changes
              </Button>
            </form>
          </Form>
        )}
      </section>

      <section className="rounded-3xl border border-destructive/30 bg-white p-6 sm:p-8">
        <h2 className="font-display text-h3 font-bold text-ink">Delete account</h2>
        <p className="mt-2 max-w-xl text-sm text-ink-soft">
          This deletes your Gamana account on the app and website, your coins and collection.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setConfirmText("");
            setDeleteOpen(true);
          }}
          className="focus-ring mt-5 h-11 rounded-full border-destructive/40 text-destructive hover:bg-destructive/5"
        >
          Delete account
        </Button>
      </section>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Delete your Gamana account?</DialogTitle>
            <DialogDescription>
              This deletes your Gamana account on the app and website, your coins and collection. Bookings already made with
              operators stay valid. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="delete-confirm">Type DELETE to confirm</Label>
            <Input
              id="delete-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoComplete="off"
              className={FIELD}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)} className="focus-ring h-11 rounded-full">
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={confirmText !== "DELETE" || deleting}
              onClick={() => void deleteAccount()}
              className="focus-ring h-11 rounded-full"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
              Delete account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
