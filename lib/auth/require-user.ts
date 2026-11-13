import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) return data.user;
  } catch (error) {
    console.error("Could not load the current user:", error);
  }

  redirect("/");
}
