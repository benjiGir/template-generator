import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Home, LayoutTemplate, Puzzle, FileText, type LucideIcon } from "lucide-react";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";

interface NavItem {
  icon: LucideIcon;
  to: string;
  label: string;
  /** Ce qu'on vient faire dans l'espace */
  intent: string;
}

/** Le Studio d'abord : c'est l'espace des contributeurs, les deux autres servent à préparer les templates */
const PRIMARY: NavItem = { icon: FileText, to: "/documents", label: "Studio", intent: "Produire un document" };

const DESIGN: NavItem[] = [
  { icon: LayoutTemplate, to: "/templates",  label: "Atelier",      intent: "Concevoir les templates" },
  { icon: Puzzle,         to: "/components", label: "Bibliothèque", intent: "Préparer des composants" },
];

function NavEntry({ item, end = false, collapsed }: { item: NavItem; end?: boolean; collapsed: boolean }) {
  const Icon = item.icon;
  if (collapsed) {
    return (
      <NavLink
        to={item.to}
        end={end}
        title={`${item.label} — ${item.intent}`}
        aria-label={item.label}
        className={({ isActive }) =>
          `flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
            isActive ? "bg-white/10 text-blue-400" : "text-slate-400 hover:bg-white/5 hover:text-white"
          }`
        }
      >
        <Icon size={18} />
      </NavLink>
    );
  }
  return (
    <NavLink
      to={item.to}
      end={end}
      className={({ isActive }) =>
        `group flex items-start gap-3 rounded-lg px-3 py-2 transition-colors ${
          isActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={18} className={`mt-0.5 shrink-0 ${isActive ? "text-blue-400" : ""}`} />
          <span className="min-w-0">
            <span className="block text-sm font-medium leading-5">{item.label}</span>
            <span className={`block text-[11px] leading-4 ${isActive ? "text-slate-300" : "text-slate-500 group-hover:text-slate-400"}`}>
              {item.intent}
            </span>
          </span>
        </>
      )}
    </NavLink>
  );
}

/** Dans un workflow, la navigation se replie pour laisser la place à l'espace de travail */
const WORKFLOW_PATH = /^\/(templates|documents|components)\/[^/]+/;

export function RootLayout() {
  const collapsed = WORKFLOW_PATH.test(useLocation().pathname);

  return (
    <ConfirmProvider>
      <div className="flex h-screen">
        <nav
          className={`flex shrink-0 flex-col gap-1 bg-[#0F172A] py-4 ${collapsed ? "w-16 items-center px-2" : "w-56 px-3"}`}
          aria-label="Navigation principale"
        >
          <div className={`mb-4 text-sm font-bold tracking-tight text-white ${collapsed ? "" : "px-3"}`}>
            {collapsed ? "DF" : "DocForge"}
          </div>

          <NavEntry item={{ icon: Home, to: "/", label: "Accueil", intent: "Reprendre mon travail" }} end collapsed={collapsed} />
          <NavEntry item={PRIMARY} collapsed={collapsed} />

          {collapsed ? (
            <div className="my-3 h-px w-8 bg-slate-700" />
          ) : (
            <div className="mt-6 px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Conception</div>
          )}
          {DESIGN.map((item) => (
            <NavEntry key={item.to} item={item} collapsed={collapsed} />
          ))}
        </nav>

        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </ConfirmProvider>
  );
}
