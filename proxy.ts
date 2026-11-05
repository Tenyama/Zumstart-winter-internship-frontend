import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseConfig } from "@/lib/supabase/config";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  let isAuthenticated = false;

  try {
    const { url, anonKey } = getSupabaseConfig();
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { data } = await supabase.auth.getClaims();
    isAuthenticated = Boolean(data?.claims?.sub);
  } catch (error) {
    // A missing or invalid Supabase config should not make the login page
    // unreachable. Treat the request as signed out and let the form report the
    // configuration problem.
    console.error("Session refresh failed:", error);
  }

  const path = request.nextUrl.pathname;

  if ((path === "/" || path === "/signup") && isAuthenticated) {
    return NextResponse.redirect(new URL("/welcome", request.url));
  }

  if (path.startsWith("/welcome") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/", "/signup", "/welcome/:path*"],
};
