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

type ProgramConfig = {
  apiUrl: string;
  apiKey?: string;
};

function getProgramConfig(): ProgramConfig {
  const apiUrl = process.env.API_URL;
  const apiKey = process.env.INTERNAL_API_KEY;

  if (!apiUrl) {
    throw new Error("Missing API_URL. Add it to frontend/.env.local.");
  }

  return {
    apiUrl: apiUrl.replace(/\/$/, ""),
    apiKey: apiKey || undefined,
  };
}

function apiHeaders(
  config: ProgramConfig,
  accessToken?: string,
  json = false
): Record<string, string> {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  if (config.apiKey) headers["X-API-Key"] = config.apiKey;
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return headers;
}

async function readError(response: Response): Promise<string> {
  try {
    const body = await response.json();
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

  return `The rewards API returned ${response.status}.`;
}

export async function getProgram(
  merchantId: string
): Promise<LoyaltyProgram | null> {
  const config = getProgramConfig();
  const response = await fetch(
    `${config.apiUrl}/loyalty-programs/merchants/${merchantId}`,
    { cache: "no-store", headers: apiHeaders(config) }
  );

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}

export async function createProgram(
  merchantId: string,
  payload: ProgramPayload,
  accessToken: string
): Promise<LoyaltyProgram> {
  const config = getProgramConfig();
  const response = await fetch(`${config.apiUrl}/loyalty-programs`, {
    method: "POST",
    headers: apiHeaders(config, accessToken, true),
    body: JSON.stringify({
      ...payload,
      merchant_id: merchantId,
      status: "ACTIVE",
    }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}

export async function updateProgram(
  programId: string,
  payload: ProgramPayload,
  accessToken: string
): Promise<LoyaltyProgram> {
  const config = getProgramConfig();
  const response = await fetch(
    `${config.apiUrl}/loyalty-programs/${programId}`,
    {
      method: "PATCH",
      headers: apiHeaders(config, accessToken, true),
      body: JSON.stringify(payload),
      cache: "no-store",
    }
  );

  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}

export async function updateProgramStatus(
  programId: string,
  status: ProgramStatus,
  accessToken: string
): Promise<LoyaltyProgram> {
  const config = getProgramConfig();
  const response = await fetch(
    `${config.apiUrl}/loyalty-programs/${programId}`,
    {
      method: "PATCH",
      headers: apiHeaders(config, accessToken, true),
      body: JSON.stringify({ status }),
      cache: "no-store",
    }
  );

  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}
