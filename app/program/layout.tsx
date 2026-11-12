import type { ReactNode } from "react";

import { signOut } from "@/app/actions/auth";
import { requireUser } from "@/lib/auth/require-user";
import { displayUsername } from "@/lib/auth/username";

export const dynamic = "force-dynamic";

const navItems = [
  "Dashboard",
  "Orders",
  "Reservations",
  "Menu",
  "Reports",
];

export default async function ProgramLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  const username = displayUsername(user);

  return (
    <div className="flex min-h-screen bg-zinc-100">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-200 bg-white lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-zinc-200 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-sm font-bold text-white">
            Z
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-zinc-950">
              Zumwhere Rewards
            </p>
            <p className="text-xs text-zinc-500">Back office</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4 text-sm">
          {navItems.map((item) => (
            <span
              key={item}
              className="block rounded-md px-3 py-2 text-zinc-500"
            >
              {item}
            </span>
          ))}

          <p className="mt-6 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
            Marketing
          </p>
          <span className="block rounded-md bg-zinc-100 px-3 py-2 font-semibold text-zinc-950">
            Rewards
          </span>
          <span className="block rounded-md px-3 py-2 text-zinc-500">
            Configurations
          </span>
        </nav>

        <div className="border-t border-zinc-200 px-5 py-4">
          <p className="text-xs text-zinc-500">Signed in as</p>
          <p className="mt-1 truncate text-sm font-medium text-zinc-800">
            {username}
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-xs font-bold text-white">
              Z
            </div>
            <span className="text-sm font-semibold text-zinc-950">
              Zumwhere Rewards
            </span>
          </div>
          <p className="hidden text-sm text-zinc-500 lg:block">
            Back office
          </p>

          <div className="flex items-center gap-4">
            <span className="hidden max-w-48 truncate text-sm text-zinc-600 sm:block">
              {username}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
