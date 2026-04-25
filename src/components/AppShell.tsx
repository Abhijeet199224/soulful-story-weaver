import { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { BookOpen, Compass, Feather, Layers, Sparkles, Users } from "lucide-react";

interface AppShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const navItems = [
  { to: "/", label: "Draft Studio", icon: Sparkles },
  { to: "/characters", label: "Characters", icon: Users },
  { to: "/plot", label: "Plot", icon: Layers },
  { to: "/chapters", label: "Chapters", icon: BookOpen },
  { to: "/moments", label: "Real-Life Moments", icon: Feather },
  { to: "/soul-report", label: "Soul Report", icon: Compass },
];

const AppShell = ({ title, subtitle, children }: AppShellProps) => {
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(56,189,248,0.16),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(250,204,21,0.16),transparent_35%),linear-gradient(170deg,#111827_0%,#1f2937_48%,#0f172a_100%)]" />

      <div className="relative mx-auto flex max-w-[1380px] flex-col px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <header className="mb-5 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link to="/" className="inline-flex items-center gap-2 text-white">
              <span className="rounded-lg bg-white/20 p-2">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="font-display text-3xl">Soulful Story Weaver</span>
            </Link>
            <p className="rounded-full border border-white/20 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-200">
              AI + Human Craft
            </p>
          </div>
          <h1 className="mt-4 font-display text-3xl text-white md:text-4xl">{title}</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-200/90 md:text-base">{subtitle}</p>
        </header>

        <nav className="mb-5 grid gap-2 rounded-xl border border-white/20 bg-white/10 p-2 backdrop-blur sm:grid-cols-3 lg:grid-cols-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                    isActive ? "bg-white text-slate-900" : "bg-black/15 text-slate-100 hover:bg-white/20"
                  }`
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <section>{children}</section>
      </div>
    </div>
  );
};

export default AppShell;
