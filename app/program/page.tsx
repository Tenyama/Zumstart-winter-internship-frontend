import { getProgram, type LoyaltyProgram } from "@/lib/api/programs";
import { getAuthContext } from "@/lib/auth/auth-context";

import { toggleProgramStatus } from "./actions";
import { ProgramForm } from "./program-form";

export const dynamic = "force-dynamic";

type ProgramPageProps = {
  searchParams: Promise<{
    saved?: string;
    status?: string;
    error?: string;
  }>;
};

export default async function ProgramPage({ searchParams }: ProgramPageProps) {
  const params = await searchParams;
  const auth = await getAuthContext();

  if (!auth) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-lg font-semibold text-amber-900">
            No merchant access
          </h1>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            This account is not linked to an active staff record. Ask an
            administrator to link your account to a merchant.
          </p>
        </div>
      </div>
    );
  }

  let program: LoyaltyProgram | null = null;
  let loadError: string | null = null;

  try {
    program = await getProgram(auth.merchantId);
  } catch (error) {
    console.error("Could not load the loyalty program:", error);
    loadError =
      error instanceof Error
        ? error.message
        : "Could not load the program settings.";
  }

  const bannerError = typeof params.error === "string" ? params.error : null;
  const showSaved = params.saved === "1";
  const showStatusUpdated = params.status === "1";

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-zinc-500">
            Marketing › Rewards
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">
            Rewards program
          </h1>
        </div>
        <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600">
          Brand: Zumwhere
        </span>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-zinc-200 text-sm">
        <span className="border-b-2 border-zinc-950 px-3 py-2 font-semibold text-zinc-950">
          Program
        </span>
        {["Ranks", "Rewards", "Members"].map((tab) => (
          <span
            key={tab}
            aria-disabled="true"
            className="cursor-not-allowed border-b-2 border-transparent px-3 py-2 text-zinc-400"
          >
            {tab}
          </span>
        ))}
      </div>

      {showSaved || showStatusUpdated ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
          {showSaved
            ? "Program settings saved."
            : "Program status updated."}
        </p>
      ) : null}

      {bannerError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
        >
          {bannerError}
        </p>
      ) : null}

      {loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <p className="font-semibold">Could not load the program</p>
          <p className="mt-1">{loadError}</p>
          <p className="mt-2 text-red-600">
            Check that the rewards API is running and{" "}
            <code className="rounded bg-red-100 px-1">API_URL</code> points to
            it.
          </p>
        </div>
      ) : (
        <>
          <section className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5">
            {program ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-zinc-500">Status</span>
                  <span
                    className={
                      program.status === "ACTIVE"
                        ? "rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700"
                        : "rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700"
                    }
                  >
                    {program.status}
                  </span>
                  <span className="text-sm text-zinc-500">
                    {program.status === "ACTIVE"
                      ? "Members can earn and redeem points."
                      : "Earning and redemption are paused."}
                  </span>
                </div>

                <form action={toggleProgramStatus}>
                  <input
                    type="hidden"
                    name="program_id"
                    value={program.program_id}
                  />
                  <input
                    type="hidden"
                    name="status"
                    value={program.status === "ACTIVE" ? "PAUSED" : "ACTIVE"}
                  />
                  <button
                    type="submit"
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"
                  >
                    {program.status === "ACTIVE"
                      ? "Pause program"
                      : "Resume program"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-zinc-500">Status</span>
                <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Not configured
                </span>
                <span className="text-sm text-zinc-500">
                  Save the form below to create the program.
                </span>
              </div>
            )}
          </section>

          <ProgramForm program={program} />
        </>
      )}
    </div>
  );
}
