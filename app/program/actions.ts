"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createProgram,
  getProgram,
  updateProgram,
  updateProgramStatus,
  type ProgramPayload,
  type ProgramStatus,
  type RoundingMode,
} from "@/lib/api/programs";
import { getAccessToken, getAuthContext } from "@/lib/auth/auth-context";

export type ProgramFormState = {
  error?: string;
};

const ROUNDING_MODES: RoundingMode[] = [
  "ROUND_DOWN",
  "ROUND_UP",
  "ROUND_NEAREST",
];

type ParseResult = { payload: ProgramPayload } | { error: string };

function requiredInteger(
  raw: FormDataEntryValue | null,
  label: string,
  minimum: number
): { value: number } | { error: string } {
  const value = String(raw ?? "").trim();
  const parsed = Number(value);

  if (!value || !Number.isInteger(parsed) || parsed < minimum) {
    return { error: `${label} must be an integer of at least ${minimum}.` };
  }

  return { value: parsed };
}

function optionalInteger(
  raw: FormDataEntryValue | null,
  label: string,
  minimum: number
): { value: number | null } | { error: string } {
  const value = String(raw ?? "").trim();
  if (!value) return { value: null };

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum) {
    return { error: `${label} must be an integer of at least ${minimum}.` };
  }

  return { value: parsed };
}

function parseProgramForm(formData: FormData): ParseResult {
  const name = String(formData.get("name") ?? "").trim();
  const terms = String(formData.get("terms_conditions") ?? "").trim();
  const rounding = String(formData.get("rounding_mode") ?? "");

  if (!name) return { error: "Program name is required." };
  if (!terms) return { error: "Program terms are required." };
  if (!ROUNDING_MODES.includes(rounding as RoundingMode)) {
    return { error: "Choose a valid rounding policy." };
  }

  const earnRate = requiredInteger(
    formData.get("eligible_spend_per_point"),
    "Earn rate",
    1
  );
  if ("error" in earnRate) return earnRate;

  const threshold = requiredInteger(
    formData.get("adjustment_approval_threshold_points"),
    "Adjustment approval threshold",
    0
  );
  if ("error" in threshold) return threshold;

  const maxPoints = optionalInteger(
    formData.get("max_points_per_order"),
    "Max points per order",
    0
  );
  if ("error" in maxPoints) return maxPoints;

  const maxOrders = optionalInteger(
    formData.get("max_earning_orders_per_day"),
    "Max earning orders per day",
    1
  );
  if ("error" in maxOrders) return maxOrders;

  const expiryMode = String(formData.get("expiry_mode") ?? "months");
  let pointsExpiryMonths: number | null = null;

  if (expiryMode !== "never") {
    const expiry = requiredInteger(
      formData.get("points_expiry_months"),
      "Points expiry",
      1
    );
    if ("error" in expiry) return expiry;
    pointsExpiryMonths = expiry.value;
  }

  return {
    payload: {
      name,
      eligible_spend_per_point: earnRate.value,
      rounding_mode: rounding as RoundingMode,
      points_expiry_months: pointsExpiryMonths,
      max_points_per_order: maxPoints.value,
      max_earning_orders_per_day: maxOrders.value,
      adjustment_approval_threshold_points: threshold.value,
      terms_conditions: terms,
    },
  };
}

export async function saveProgram(
  _previousState: ProgramFormState,
  formData: FormData
): Promise<ProgramFormState> {
  const auth = await getAuthContext();
  if (!auth) {
    return { error: "No merchant access." };
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return { error: "Your session has expired. Sign in again." };
  }

  const parsed = parseProgramForm(formData);
  if ("error" in parsed) return parsed;

  const programId = String(formData.get("program_id") ?? "").trim();

  try {
    if (programId) {
      const current = await getProgram(auth.merchantId);
      if (!current || current.program_id !== programId) {
        return { error: "Program not found." };
      }
      await updateProgram(programId, parsed.payload, accessToken);
    } else {
      await createProgram(auth.merchantId, parsed.payload, accessToken);
    }
  } catch (error) {
    console.error("Could not save the loyalty program:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not save the program settings.",
    };
  }

  revalidatePath("/program");
  redirect("/program?saved=1");
}

export async function toggleProgramStatus(formData: FormData) {
  const auth = await getAuthContext();
  if (!auth) {
    redirect(
      `/program?error=${encodeURIComponent("No merchant access.")}`
    );
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect(
      `/program?error=${encodeURIComponent("Your session has expired. Sign in again.")}`
    );
  }

  const programId = String(formData.get("program_id") ?? "").trim();
  const status = String(formData.get("status") ?? "") as ProgramStatus;

  if (!programId || !["ACTIVE", "PAUSED"].includes(status)) {
    redirect(
      `/program?error=${encodeURIComponent("Could not update the program status.")}`
    );
  }

  let current;
  try {
    current = await getProgram(auth.merchantId);
  } catch (error) {
    console.error("Could not load the loyalty program:", error);
    redirect(
      `/program?error=${encodeURIComponent("Could not load the program.")}`
    );
  }

  if (!current || current.program_id !== programId) {
    redirect(`/program?error=${encodeURIComponent("Program not found.")}`);
  }

  try {
    await updateProgramStatus(programId, status, accessToken);
  } catch (error) {
    console.error("Could not update the loyalty program status:", error);
    const message =
      error instanceof Error ? error.message : "Could not update status.";
    redirect(`/program?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/program");
  redirect("/program?status=1");
}
