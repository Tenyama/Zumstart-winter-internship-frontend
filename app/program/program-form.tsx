"use client";

import { useActionState, useState } from "react";

import { saveProgram, type ProgramFormState } from "./actions";
import type { LoyaltyProgram } from "@/lib/api/programs";

const initialState: ProgramFormState = {};

export function ProgramForm({ program }: { program: LoyaltyProgram | null }) {
  const [state, formAction, isPending] = useActionState(
    saveProgram,
    initialState
  );
  const [expiryMode, setExpiryMode] = useState(
    program?.points_expiry_months === null ? "never" : "months"
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="program_id" value={program?.program_id ?? ""} />

      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
        >
          {state.error}
        </p>
      ) : null}

      <section className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-zinc-800"
            >
              Program name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={200}
              defaultValue={program?.name ?? ""}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="eligible_spend_per_point"
              className="block text-sm font-medium text-zinc-800"
            >
              Earn rate
            </label>
            <div className="flex items-center gap-2">
              <span className="whitespace-nowrap text-sm text-zinc-600">
                1 point per
              </span>
              <input
                id="eligible_spend_per_point"
                name="eligible_spend_per_point"
                type="number"
                min={1}
                step={1}
                required
                defaultValue={program?.eligible_spend_per_point ?? 10000}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
              />
              <span className="text-sm text-zinc-600">VND</span>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="rounding_mode"
              className="block text-sm font-medium text-zinc-800"
            >
              Rounding
            </label>
            <select
              id="rounding_mode"
              name="rounding_mode"
              defaultValue={program?.rounding_mode ?? "ROUND_DOWN"}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
            >
              <option value="ROUND_DOWN">Round down</option>
              <option value="ROUND_UP">Round up</option>
              <option value="ROUND_NEAREST">Round to nearest</option>
            </select>
          </div>

          <div className="space-y-2">
            <span className="block text-sm font-medium text-zinc-800">
              Points expiry
            </span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-700">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="expiry_mode"
                  value="months"
                  checked={expiryMode === "months"}
                  onChange={() => setExpiryMode("months")}
                  className="h-4 w-4 accent-zinc-950"
                />
                After
              </label>
              <input
                name="points_expiry_months"
                type="number"
                min={1}
                step={1}
                required={expiryMode === "months"}
                disabled={expiryMode === "never"}
                defaultValue={program?.points_expiry_months ?? 12}
                className="w-24 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition disabled:bg-zinc-100 disabled:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
              />
              <span>months</span>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="expiry_mode"
                  value="never"
                  checked={expiryMode === "never"}
                  onChange={() => setExpiryMode("never")}
                  className="h-4 w-4 accent-zinc-950"
                />
                Never
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="max_points_per_order"
              className="block text-sm font-medium text-zinc-800"
            >
              Max points per order
            </label>
            <input
              id="max_points_per_order"
              name="max_points_per_order"
              type="number"
              min={0}
              step={1}
              placeholder="No limit"
              defaultValue={program?.max_points_per_order ?? ""}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="max_earning_orders_per_day"
              className="block text-sm font-medium text-zinc-800"
            >
              Max earning orders per day
            </label>
            <input
              id="max_earning_orders_per_day"
              name="max_earning_orders_per_day"
              type="number"
              min={1}
              step={1}
              placeholder="No limit"
              defaultValue={program?.max_earning_orders_per_day ?? ""}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="adjustment_approval_threshold_points"
              className="block text-sm font-medium text-zinc-800"
            >
              Adjustments over this need Owner approval
            </label>
            <div className="flex items-center gap-2">
              <input
                id="adjustment_approval_threshold_points"
                name="adjustment_approval_threshold_points"
                type="number"
                min={0}
                step={1}
                required
                defaultValue={
                  program?.adjustment_approval_threshold_points ?? 200
                }
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
              />
              <span className="whitespace-nowrap text-sm text-zinc-600">
                points
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <label
            htmlFor="terms_conditions"
            className="block text-sm font-medium text-zinc-800"
          >
            Program terms shown to guests
          </label>
          <textarea
            id="terms_conditions"
            name="terms_conditions"
            required
            rows={4}
            defaultValue={program?.terms_conditions ?? ""}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
          />
        </div>
      </section>

      <section className="rounded-xl border border-dashed border-zinc-300 bg-white/60 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-zinc-800">
            More program settings
          </h2>
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            Not yet available
          </span>
        </div>
        <p className="mt-1 text-sm leading-6 text-zinc-500">
          Channels, voucher stacking, excluded items, and outlet scope are part
          of the program tab in the wireframe, but they are not exposed by the
          current rewards API.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <span className="block text-sm font-medium text-zinc-800">
              Earn and redeem in
            </span>
            <div className="space-y-1.5 text-sm text-zinc-400">
              <label className="flex items-center gap-2">
                <input type="checkbox" disabled defaultChecked />
                POS dine-in
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" disabled defaultChecked />
                Zalo Mini App (from R2)
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" disabled />
                QR Table Ordering
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" disabled />
                Direct Online Ordering
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <span className="block text-sm font-medium text-zinc-800">
              Combine vouchers with promotions
            </span>
            <div className="space-y-1.5 text-sm text-zinc-400">
              <label className="flex items-center gap-2">
                <input type="radio" disabled />
                Allowed
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" disabled defaultChecked />
                Not allowed
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-800">
              Items that don&apos;t earn points
            </label>
            <input
              type="text"
              disabled
              value="Alcohol, Gift cards"
              readOnly
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-400"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-800">
              Outlets
            </label>
            <select
              disabled
              defaultValue="all"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-400"
            >
              <option value="all">All outlets (3)</option>
            </select>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : program ? "Save changes" : "Create program"}
        </button>
      </div>
    </form>
  );
}
