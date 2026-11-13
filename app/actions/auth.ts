"use server";

import { redirect } from "next/navigation";

import { loginIdentifierToEmail } from "@/lib/auth/username";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error?: string;
};

export async function signIn(
  _previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const identifier = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!identifier || !password) {
    return { error: "Enter your username or email and password." };
  }

  const email = loginIdentifierToEmail(identifier);
  if (!email) {
    return { error: "Enter a valid username or email." };
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch (error) {
    console.error("Supabase is not configured:", error);
    return { error: "Sign-in is temporarily unavailable." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Sign-in failed:", error.message);
    return { error: "Invalid username or password." };
  }

  redirect("/program");
}

export async function signOut() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Sign-out failed:", error);
  }

  redirect("/");
}
