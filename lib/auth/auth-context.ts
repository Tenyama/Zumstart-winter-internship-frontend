import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";

export type AuthContext = {
  userId: string;
  merchantId: string;
  role: string | null;
  staffUserId: string | null;
};

export const getAuthContext = cache(async (): Promise<AuthContext | null> => {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  const claims = (data?.claims ?? {}) as Record<string, unknown>;
  const metadata = (user.app_metadata ?? {}) as Record<string, unknown>;

  const merchantId = claims.merchant_id ?? metadata.merchant_id;
  if (typeof merchantId !== "string" || !merchantId) {
    return null;
  }

  const role = claims.staff_role ?? metadata.staff_role;
  const staffUserId = claims.staff_user_id ?? metadata.staff_user_id;

  return {
    userId: user.id,
    merchantId,
    role: typeof role === "string" ? role : null,
    staffUserId: typeof staffUserId === "string" ? staffUserId : null,
  };
});
