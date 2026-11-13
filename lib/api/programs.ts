export type ProgramStatus = "ACTIVE" | "PAUSED";
export type RoundingMode = "ROUND_DOWN" | "ROUND_UP" | "ROUND_NEAREST";

export type LoyaltyProgram = {
  program_id: string;
  merchant_id: string;
  name: string;
  status: ProgramStatus;
  eligible_spend_per_point: number;
  rounding_mode: RoundingMode;
  points_expiry_months: number | null;
  max_points_per_order: number | null;
  max_earning_orders_per_day: number | null;
  adjustment_approval_threshold_points: number;
  terms_conditions: string;
  created_at: string;
  updated_at: string;
};

export type ProgramPayload = Pick<
  LoyaltyProgram,
  | "name"
  | "eligible_spend_per_point"
  | "rounding_mode"
  | "points_expiry_months"
  | "max_points_per_order"
  | "max_earning_orders_per_day"
  | "adjustment_approval_threshold_points"
  | "terms_conditions"
>;

function getApiUrl(): string {
  const raw = process.env.API_URL;
  if (!raw) {
    throw new Error("Missing API_URL. Add it to frontend/.env.local.");
  }

  const trimmed = raw.trim().replace(/\/+$/, "");
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    return new URL(withScheme).origin;
  } catch {
    throw new Error(
      "API_URL must be a valid absolute URL, for example https://your-backend.vercel.app"
    );
  }
}

async function readError(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();

  if (contentType.includes("application/json")) {
    try {
      const body = JSON.parse(text);
      const detail = body?.detail;

      if (typeof detail === "string") return detail;

      if (Array.isArray(detail)) {
        return detail
          .map((item) => {
            const field = Array.isArray(item.loc)
              ? item.loc[item.loc.length - 1]
              : "";
            return `${field ? `${field}: ` : ""}${item.msg ?? "Invalid value"}`;
          })
          .join("; ");
      }
    } catch {
      // Fall through to the status message.
    }
  }

  if (text.trimStart().startsWith("<")) {
    return `The rewards API returned HTML instead of JSON (${response.status}). Check API_URL and Vercel Deployment Protection.`;
  }

  return `The rewards API returned ${response.status}.`;
}

async function readJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      "The rewards API returned a non-JSON response. Check API_URL and Vercel Deployment Protection."
    );
  }

  return response.json();
}

export async function getProgram(
  merchantId: string
): Promise<LoyaltyProgram | null> {
  const response = await fetch(
    `${getApiUrl()}/loyalty-programs/merchants/${merchantId}`,
    { cache: "no-store" }
  );

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(await readError(response));
  return readJson<LoyaltyProgram>(response);
}

export async function createProgram(
  merchantId: string,
  payload: ProgramPayload
): Promise<LoyaltyProgram> {
  const response = await fetch(`${getApiUrl()}/loyalty-programs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      merchant_id: merchantId,
      status: "ACTIVE",
    }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(await readError(response));
  return readJson<LoyaltyProgram>(response);
}

export async function updateProgram(
  programId: string,
  payload: ProgramPayload
): Promise<LoyaltyProgram> {
  const response = await fetch(
    `${getApiUrl()}/loyalty-programs/${programId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    }
  );

  if (!response.ok) throw new Error(await readError(response));
  return readJson<LoyaltyProgram>(response);
}

export async function updateProgramStatus(
  programId: string,
  status: ProgramStatus
): Promise<LoyaltyProgram> {
  const response = await fetch(
    `${getApiUrl()}/loyalty-programs/${programId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
      cache: "no-store",
    }
  );

  if (!response.ok) throw new Error(await readError(response));
  return readJson<LoyaltyProgram>(response);
}
