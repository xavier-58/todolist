import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

function FloatingOrb({ className }: { className: string }) {
  return <div className={`pointer-events-none absolute rounded-full blur-3xl opacity-20 ${className}`} />;
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="dark relative min-h-screen overflow-hidden bg-[hsl(222,47%,6%)] text-white">
      <FloatingOrb className="-left-40 -top-40 h-[420px] w-[420px] bg-blue-600" />
      <FloatingOrb className="-bottom-28 -right-20 h-[360px] w-[360px] bg-cyan-600" />
      <FloatingOrb className="left-1/2 top-1/3 h-[280px] w-[280px] -translate-x-1/2 bg-indigo-600" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="border-b border-white/10 bg-slate-950/30 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/10"
            >
              <Home className="h-4 w-4 text-cyan-300" />
              文子TODO
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/40 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-10 md:px-6 md:py-16">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
