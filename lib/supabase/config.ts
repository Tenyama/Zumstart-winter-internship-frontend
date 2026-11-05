const PLACEHOLDER_KEY = "REPLACE_WITH_SUPABASE_PUBLISHABLE_KEY";

export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

export function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey || anonKey === PLACEHOLDER_KEY) {
    throw new Error(
      "Missing Supabase configuration. Add SUPABASE_URL and SUPABASE_ANON_KEY to frontend/.env.local."
    );
  }

  return { url, anonKey };
}
