"use server";

import { redirect } from "next/navigation";

import { loginIdentifierToEmail, usernameToEmail } from "@/lib/auth/username";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error?: string;
};

export type SignUpState = {
  error?: string;
};

const MIN_PASSWORD_LENGTH = 8;

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

  redirect("/welcome");
}

export async function signUp(
  _previousState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!username || !password || !confirmPassword) {
    return { error: "Fill in all fields." };
  }

  const email = usernameToEmail(username);
  if (!email) {
    return {
      error:
        "Use 3–32 characters: lowercase letters, numbers, dots, underscores, or hyphens.",
    };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Use at least ${MIN_PASSWORD_LENGTH} characters.` };
  }

  if (password !== confirmPassword) {
    return { error: "The passwords do not match." };
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch (error) {
    console.error("Supabase is not configured:", error);
    return { error: "Sign-up is temporarily unavailable." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });

  if (error) {
    console.error("Sign-up failed:", error.message);
    if (error.message.toLowerCase().includes("already")) {
      return { error: "That username is already taken." };
    }
    return { error: "Could not create your account. Please try again." };
  }

  if (data.user?.identities?.length === 0) {
    return { error: "That username is already taken." };
  }

  if (!data.session) {
    return {
      error:
        "Account created, but it needs confirmation before you can sign in. Contact an administrator to enable auto-confirm for username accounts.",
    };
  }

  redirect("/welcome");
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
