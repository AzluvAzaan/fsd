"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { findUserByEmail, getUserById, upsertUser, type User } from "@/lib/api";
import { Button } from "@/components/ui/button";

const userSchema = z.object({
  id: z.string().min(1, "ID is required"),
  email: z.email("Enter a valid email"),
  displayName: z.string().optional(),
});

const searchSchema = z.object({
  email: z.email("Enter a valid email"),
});

type UserFormValues = z.infer<typeof userSchema>;
type SearchFormValues = z.infer<typeof searchSchema>;

function UserCard({ user }: { user: User | null }) {
  if (!user) {
    return <p className="text-sm text-muted-foreground">No user loaded yet.</p>;
  }

  return (
    <div className="rounded-xl border bg-background p-4 text-sm shadow-sm">
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">ID</p>
          <p className="font-medium">{user.id}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Display name</p>
          <p className="font-medium">{user.displayName || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Created at</p>
          <p className="font-medium">{user.createdAt || "—"}</p>
        </div>
      </div>
    </div>
  );
}

export function BackendTestForm() {
  const userForm = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      id: "demo-user-1",
      email: "demo@example.com",
      displayName: "Demo User",
    },
  });

  const searchForm = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      email: "demo@example.com",
    },
  });

  const createUser = useMutation({
    mutationFn: upsertUser,
  });

  const fetchedUser = useQuery({
    queryKey: ["backend-test-user"],
    queryFn: () => findUserByEmail(searchForm.getValues("email")),
    enabled: false,
  });

  const healthCheck = useQuery({
    queryKey: ["backend-user-health"],
    queryFn: () => getUserById("definitely-not-found"),
    retry: false,
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border bg-background p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">1) Create / update a test user</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This hits <code>PUT /users</code> on your Go backend.
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={userForm.handleSubmit(async (values) => {
            await createUser.mutateAsync(values);
            searchForm.setValue("email", values.email);
          })}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">ID</label>
            <input
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              {...userForm.register("id")}
            />
            {userForm.formState.errors.id && (
              <p className="text-sm text-red-500">{userForm.formState.errors.id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              {...userForm.register("email")}
            />
            {userForm.formState.errors.email && (
              <p className="text-sm text-red-500">{userForm.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Display name</label>
            <input
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              {...userForm.register("displayName")}
            />
          </div>

          <Button type="submit" disabled={createUser.isPending}>
            {createUser.isPending ? <Loader2 className="animate-spin" /> : null}
            Save test user
          </Button>

          {createUser.isSuccess && (
            <p className="text-sm text-emerald-600">User saved successfully.</p>
          )}
          {createUser.error && (
            <p className="text-sm text-red-500">{createUser.error.message}</p>
          )}
        </form>
      </section>

      <section className="rounded-2xl border bg-background p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">2) Fetch a user by email</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This hits <code>GET /users?email=...</code> so you can verify frontend ↔ backend wiring fast.
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={searchForm.handleSubmit(async () => {
            await fetchedUser.refetch();
          })}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              {...searchForm.register("email")}
            />
            {searchForm.formState.errors.email && (
              <p className="text-sm text-red-500">{searchForm.formState.errors.email.message}</p>
            )}
          </div>

          <Button type="submit" variant="outline" disabled={fetchedUser.isFetching}>
            {fetchedUser.isFetching ? <Loader2 className="animate-spin" /> : null}
            Fetch user
          </Button>
        </form>

        <div className="mt-4 space-y-3">
          {fetchedUser.error && (
            <p className="text-sm text-red-500">{fetchedUser.error.message}</p>
          )}
          <UserCard user={fetchedUser.data ?? null} />
        </div>
      </section>

      <section className="rounded-2xl border bg-background p-6 shadow-sm lg:col-span-2">
        <h2 className="text-lg font-semibold">Quick backend signal</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This intentionally requests a fake user ID. If your backend is reachable, you should get a normal app error like
          <span className="font-medium"> user not found</span> instead of a network failure.
        </p>

        <div className="mt-4 rounded-xl border bg-muted/40 p-4 text-sm">
          {healthCheck.isLoading && <p>Checking backend...</p>}
          {healthCheck.error ? (
            <p>
              <span className="font-medium">Backend response:</span> {healthCheck.error.message}
            </p>
          ) : (
            <p className="text-muted-foreground">Waiting for backend response...</p>
          )}
        </div>
      </section>
    </div>
  );
}
