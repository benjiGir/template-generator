import { Outlet, NavLink } from "react-router-dom";
import { Home, LayoutTemplate, Puzzle, FileText } from "lucide-react";

const NAV_ITEMS = [
  { icon: Home, to: "/", label: "Dashboard" },
  { icon: LayoutTemplate, to: "/templates", label: "Atelier Templates" },
  { icon: Puzzle, to: "/components", label: "Bibliothèque Composants" },
  { icon: FileText, to: "/documents", label: "Studio Documents" },
];

export function RootLayout() {
  return (
    <div className="flex h-screen">
      <nav className="w-16 shrink-0 bg-[#0F172A] flex flex-col items-center py-3 gap-1">
        {NAV_ITEMS.map(({ icon: Icon, to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            title={label}
            className={({ isActive }) =>
              `relative flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white rounded-r-full -ml-3" />
                )}
                <Icon size={20} />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
