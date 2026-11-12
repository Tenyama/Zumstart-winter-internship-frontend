import { LoginForm } from "./login-form";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-sm font-bold text-white">
            Z
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-zinc-950">
              Zumwhere Rewards
            </p>
            <p className="text-xs text-zinc-500">Back office</p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
              Sign in
            </h1>
            <p className="text-sm leading-6 text-zinc-500">
              Use your rewards username or email and password to continue.
            </p>
          </div>
          <LoginForm />
          <p className="mt-5 text-center text-sm text-zinc-500">
            Need access? Contact your programme administrator.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Member · Silver · Gold
        </p>
      </div>
    </main>
  );
}
