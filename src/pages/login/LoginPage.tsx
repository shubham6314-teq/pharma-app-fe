import { LoginForm } from '../../features/auth/components/LoginForm'
import { PharmacyMark } from '../../components/ui/PharmacyMark'

export function LoginPage() {
  return (
    <div className="grid min-h-svh bg-[#f4f7f6] lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-[#0b3d3a] px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-emerald-300/15 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <PharmacyMark />
          <div>
            <p className="text-lg font-semibold tracking-tight">PharmaDesk</p>
            <p className="text-sm text-teal-100/75">Pharmacy operations</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-200/80">
            Secure access
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
            Sign in to manage inventory, prescriptions, and orders.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-teal-50/75">
            One workspace for pharmacists and staff. Keep stock accurate and
            patient records easy to find.
          </p>
        </div>

        <p className="relative text-sm text-teal-100/60">
          Authorized personnel only
        </p>
      </aside>

      <main className="flex items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <PharmacyMark tone="onLight" />
            <div>
              <p className="text-base font-semibold text-slate-900">PharmaDesk</p>
              <p className="text-sm text-slate-500">Pharmacy operations</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_24px_50px_-28px_rgba(15,42,46,0.35)] sm:p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Enter your email and password to continue.
              </p>
            </div>

            <LoginForm />
          </div>
        </div>
      </main>
    </div>
  )
}
