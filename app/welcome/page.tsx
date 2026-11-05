import { redirect } from "next/navigation";

import { signOut } from "@/app/actions/auth";
import { displayUsername } from "@/lib/auth/username";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  let user = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    console.error("Could not load the current user:", error);
  }

  if (!user) {
    redirect("/");
  }

  const username = displayUsername(user);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-sm font-bold text-white">
            Z
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-zinc-950">
              Zumwhere Rewards
            </p>
            <p className="text-xs text-zinc-500">Back office</p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Signed in
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
            Welcome, {username}
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            This is the placeholder welcome screen for the Zumwhere Rewards
            back office. The rewards dashboard will be added next.
          </p>

          <form action={signOut} className="mt-6">
            <button
              type="submit"
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
