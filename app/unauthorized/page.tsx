import Link from "next/link";

export default function Unauthorized() {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6 py-12">
        <div className="w-full rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur sm:p-10">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
              />
            </svg>
          </div>

          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-red-600">
            Error 403
          </p>
          <h1 className="mb-3 text-3xl font-bold sm:text-4xl">Access denied</h1>
          <p className="mb-8 text-slate-600">
            You do not have permission to view this page.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Go to Home
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
