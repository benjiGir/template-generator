import { Outlet, NavLink, useLocation, useNavigation } from "react-router-dom";
import { BookOpen, CircleHelp, Home } from "lucide-react";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";
import { OnboardingProvider, useOnboarding } from "@/components/onboarding/Onboarding";
import { ObjectMark, type ObjectKind } from "@/components/ui/ObjectIdentity";
import { HelpProvider } from "@/help/HelpProvider";

interface NavItem {
  to: string;
  label: string;
  /** Ce qu'on vient faire dans l'espace */
  intent: string;
  /** Type d'objet de l'espace : sa couleur et sa forme ; aucun pour l'accueil */
  kind?: ObjectKind;
  /** Repère pour la visite guidée */
  tour: string;
}

const HOME: NavItem = { to: "/", label: "Accueil", intent: "Reprendre mon travail", tour: "nav-home" };

/** Le Studio d'abord : c'est l'espace des contributeurs, les deux autres servent à préparer les templates */
const PRIMARY: NavItem = {
  to: "/documents",
  label: "Studio",
  intent: "Remplir des documents",
  kind: "doc",
  tour: "nav-studio",
};

const DESIGN: NavItem[] = [
  { to: "/templates", label: "Atelier", intent: "Dessiner les templates", kind: "tpl", tour: "nav-templates" },
  { to: "/components", label: "Bibliothèque", intent: "Régler les presets", kind: "preset", tour: "nav-components" },
];

/** Filet gauche de l'entrée active, dans la couleur de l'espace */
const ACTIVE_BAR: Record<ObjectKind | "home", string> = {
  home: "border-ink",
  doc: "border-doc",
  tpl: "border-tpl",
  preset: "border-preset",
};

function NavEntry({ item, end = false, collapsed }: { item: NavItem; end?: boolean; collapsed: boolean }) {
  const mark = item.kind ? (
    <ObjectMark kind={item.kind} size={collapsed ? 14 : 10} />
  ) : (
    <Home size={collapsed ? 17 : 13} className="shrink-0" aria-hidden />
  );

  if (collapsed) {
    return (
      <NavLink
        to={item.to}
        end={end}
        data-tour={item.tour}
        title={`${item.label} — ${item.intent}`}
        aria-label={item.label}
        className={({ isActive }) =>
          `flex h-10 w-10 items-center justify-center border-l-[3px] transition-colors ${
            isActive ? `bg-white ${ACTIVE_BAR[item.kind ?? "home"]}` : "border-transparent hover:bg-white/60"
          }`
        }
      >
        {mark}
      </NavLink>
    );
  }
  return (
    <NavLink
      to={item.to}
      end={end}
      data-tour={item.tour}
      className={({ isActive }) =>
        `flex items-start gap-2.5 border-l-[3px] px-2.5 py-2 transition-colors ${
          isActive ? `bg-white ${ACTIVE_BAR[item.kind ?? "home"]}` : "border-transparent hover:bg-white/60"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className="mt-[5px] flex w-3.5 justify-center">{mark}</span>
          <span className="min-w-0">
            <span className={`block text-sm leading-5 ${isActive ? "font-semibold" : "font-medium"}`}>
              {item.label}
            </span>
            {item.kind && <span className="block text-xs leading-4 text-ink-subtle">{item.intent}</span>}
          </span>
        </>
      )}
    </NavLink>
  );
}

/** Documentation : chaque étape expliquée avec des extraits d'écrans */
function HelpNavLink({ collapsed }: { collapsed: boolean }) {
  return (
    <NavLink
      to="/aide"
      title="Aide — chaque étape expliquée"
      aria-label={collapsed ? "Aide" : undefined}
      className={({ isActive }) =>
        `mt-auto flex items-center gap-2 transition-colors hover:text-ink ${isActive ? "font-semibold text-ink" : "text-ink-muted"} ${
          collapsed ? "h-10 w-10 justify-center" : "px-3 py-2 font-mono text-xs"
        }`
      }
    >
      <BookOpen size={collapsed ? 18 : 14} />
      {!collapsed && "Aide"}
    </NavLink>
  );
}

/** Relance la visite guidée ; repère de la dernière étape de la visite */
function ReplayTourButton({ collapsed }: { collapsed: boolean }) {
  const { start } = useOnboarding();
  return (
    <button
      onClick={start}
      data-tour="tour-replay"
      title="Revoir le tutoriel"
      aria-label="Revoir le tutoriel"
      className={`flex items-center gap-2 text-ink-muted transition-colors hover:text-ink ${
        collapsed ? "h-10 w-10 justify-center" : "px-3 py-2 font-mono text-xs"
      }`}
    >
      <CircleHelp size={collapsed ? 18 : 14} />
      {!collapsed && "Revoir le tutoriel"}
    </button>
  );
}

/** Dans un workflow, la navigation se replie pour laisser la place à l'espace de travail */
const WORKFLOW_PATH = /^\/(templates|documents|components)\/[^/]+/;

/**
 * Filet animé en haut de l'écran pendant qu'un écran pas encore visité se télécharge :
 * l'écran actuel reste affiché jusque-là. Il n'apparaît qu'au bout d'un instant, pour ne pas clignoter.
 */
function NavigationProgress() {
  const loading = useNavigation().state === "loading";
  if (!loading) return null;
  return (
    <div
      role="progressbar"
      aria-label="Chargement de l'écran"
      className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 animate-pulse bg-ink opacity-0 [animation-delay:150ms] [animation-fill-mode:forwards]"
    />
  );
}

export function RootLayout() {
  const collapsed = WORKFLOW_PATH.test(useLocation().pathname);

  return (
    <ConfirmProvider>
      <OnboardingProvider>
        <HelpProvider>
          <div className="flex h-screen bg-paper text-ink">
            <nav
              className={`flex shrink-0 flex-col gap-0.5 border-r border-rule bg-wash py-6 ${collapsed ? "w-16 items-center px-2" : "w-56 px-3"}`}
              aria-label="Navigation principale"
            >
              <div className={`mb-6 ${collapsed ? "text-center" : "px-3"}`}>
                <div className="text-[17px] font-bold tracking-tight">{collapsed ? "DF" : "DocForge"}</div>
                {!collapsed && <div className="font-mono text-[11px] text-ink-subtle">Documents techniques</div>}
              </div>

              <NavEntry item={HOME} end collapsed={collapsed} />
              <NavEntry item={PRIMARY} collapsed={collapsed} />

              {collapsed ? (
                <div className="my-3 h-px w-8 bg-rule" />
              ) : (
                <div className="mt-5 px-3 pb-1 font-mono text-[11px] tracking-[0.06em] text-ink-subtle">CONCEPTION</div>
              )}
              {DESIGN.map((item) => (
                <NavEntry key={item.to} item={item} collapsed={collapsed} />
              ))}

              <HelpNavLink collapsed={collapsed} />
              <ReplayTourButton collapsed={collapsed} />
            </nav>

            <main className="relative flex-1 overflow-hidden">
              <NavigationProgress />
              <Outlet />
            </main>
          </div>
        </HelpProvider>
      </OnboardingProvider>
    </ConfirmProvider>
  );
}
