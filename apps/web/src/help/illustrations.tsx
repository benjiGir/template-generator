import type { ReactNode } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Eye,
  GripVertical,
  List,
  Lock,
  MousePointer2,
  MousePointerClick,
  Plus,
  Printer,
  Search,
  X,
} from "lucide-react";
import { BUILTIN_THEMES } from "@template-generator/shared/themes/presets";
import { BlueprintFrame, ObjectMark, ObjectTag } from "@/components/ui/ObjectIdentity";
import { SegmentedProgress } from "@/components/ui/SegmentedProgress";
import { Btn, Figure, Input, Label, Line, Mark, MiniPage, MiniStepper, MonoLabel, Table } from "./screen";

/*
 * Extraits d'écrans annotés de l'aide. Les repères sont placés dans le flux, à côté de l'élément
 * qu'ils désignent ; seuls ceux qui pointent une zone de page sont positionnés.
 */

const STUDIO_STEPS = ["Choisir un template", "Remplir", "Relire", "Exporter"];
const ATELIER_STEPS = ["Point de départ", "Thème", "Construire", "Champs et publication"];
const PRESET_STEPS = ["Composant de base", "Configurer", "Nommer et ranger"];

/** Statut monochrome, comme dans les listes */
function Status({ shape, children }: { shape: "hollow" | "filled" | "diamond" | "dashed"; children: string }) {
  const shapes = {
    hollow: "border-[1.5px] border-ink",
    filled: "bg-ink",
    diamond: "bg-ink rotate-45",
    dashed: "border-[1.5px] border-dashed border-ink",
  };
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.06em] text-ink">
      <span className={`box-border inline-block h-1.5 w-1.5 ${shapes[shape]}`} />
      {children}
    </span>
  );
}

function WorkflowHeader({
  kind,
  title,
  steps,
  current,
  right,
}: {
  kind: "doc" | "tpl" | "preset";
  title: string;
  steps: string[];
  current: number;
  right?: ReactNode;
}) {
  const accent = kind === "doc" ? "border-doc" : kind === "tpl" ? "border-tpl" : "border-preset";
  return (
    <div className="flex h-9 items-center gap-3 border-b-2 border-ink bg-paper px-3">
      <span className="flex items-center gap-0.5 font-mono text-[9px] text-ink-soft">
        <X size={9} /> Quitter
      </span>
      <span className="origin-left scale-90">
        <ObjectTag kind={kind} />
      </span>
      <span className="truncate text-[10px] font-semibold">{title}</span>
      <span className="ml-auto">
        <MiniStepper steps={steps} current={current} accent={accent} />
      </span>
      {right}
    </div>
  );
}

/** Ligne avec un repère dans la marge gauche */
function Row({ n, children, className = "" }: { n?: number; children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-start gap-1.5 ${className}`}>
      <span className="w-5 shrink-0">{n !== undefined && <Mark n={n} />}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

// ─── Les bases ────────────────────────────────────────────────────────────────

export function ConceptFigure() {
  const caption = (kind: "preset" | "tpl" | "doc", n: number, label: string) => (
    <span className="flex items-center gap-1.5 text-[11px] font-semibold">
      <Mark n={n} />
      <ObjectMark kind={kind} />
      {label}
    </span>
  );
  return (
    <Figure
      where="Principe"
      height={210}
      legend={[
        <>
          Un <strong>preset</strong> est un composant déjà réglé (couleurs, textes par défaut), rangé dans la
          Bibliothèque pour être réutilisé.
        </>,
        <>
          Un <strong>template</strong> assemble des composants en une mise en page et désigne les zones à remplir (en
          pointillés).
        </>,
        <>
          Chaque <strong>document</strong> est une édition remplie de ce template : seules les zones prévues changent.
        </>,
      ]}
    >
      <Table className="flex items-center justify-center gap-6 px-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-24 w-28 flex-col justify-center gap-1.5 rounded-[10px] border border-preset/40 bg-preset-tint p-3">
            <Line w="50%" h={4} tone="bg-preset" />
            <Line w="90%" h={3} tone="bg-ink-faint" />
            <Line w="70%" h={3} tone="bg-ink-faint" />
          </div>
          {caption("preset", 1, "Preset")}
        </div>
        <ArrowRight size={16} className="text-ink-subtle" />
        <div className="flex flex-col items-center gap-2">
          <BlueprintFrame className="p-2.5">
            <div className="flex h-[120px] w-24 flex-col gap-1.5 border border-white/80 p-2">
              <Line w="60%" h={4} tone="bg-white" />
              <span className="block h-3 border border-dashed border-white" />
              <div className="flex gap-1">
                <span className="block h-5 flex-1 border border-dashed border-white" />
                <span className="block h-5 flex-1 border border-dashed border-white" />
              </div>
              <span className="block h-4 border border-dashed border-white" />
            </div>
          </BlueprintFrame>
          {caption("tpl", 2, "Template")}
        </div>
        <ArrowRight size={16} className="text-ink-subtle" />
        <div className="flex flex-col items-center gap-2">
          <div className="relative h-[136px] w-[118px]">
            <MiniPage dense className="absolute left-4 top-0 h-[120px] w-[100px] overflow-hidden opacity-50" />
            <MiniPage
              dense
              className="absolute left-0 top-4 h-[120px] w-[100px] overflow-hidden border-t-[3px] border-doc"
            />
          </div>
          {caption("doc", 3, "Documents")}
        </div>
      </Table>
    </Figure>
  );
}

export function LockedFigure() {
  return (
    <Figure
      where="Studio · 02 Remplir · Sur la page"
      height={250}
      legend={[
        <>
          Une zone en <strong>pointillés</strong> est remplissable : le template l'a déclarée comme champ. Cliquez
          dessus pour la modifier.
        </>,
        <>
          Le reste (titre de section, libellés, décor) appartient au template. Un clic dessus affiche ce message ; «
          Pourquoi ? » mène à cette page.
        </>,
        <>« Révéler les zones modifiables » encadre d'un coup tout ce que vous pouvez changer.</>,
      ]}
    >
      <div className="flex h-7 items-center justify-end gap-1.5 border-b border-rule bg-paper px-3">
        <Mark n={3} />
        <span className="flex items-center gap-1 bg-white px-1.5 py-0.5 text-[9px] text-ink ring-1 ring-rule">
          <Eye size={9} /> Masquer les zones modifiables
        </span>
      </div>
      <Table className="relative flex justify-center pt-3">
        <MiniPage
          className="h-fit w-64"
          zones={{ intro: "field", kpis: "field", left: "field", right: "field", box: "field" }}
        />
        <div className="absolute left-1/2 top-[30px] flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-ink-soft py-1 pl-1 pr-2.5 text-[9px] text-white shadow-lg">
          <Mark n={2} />
          <Lock size={9} /> Cette partie fait partie du template : elle ne se modifie pas ici.{" "}
          <span className="font-semibold underline">Pourquoi ?</span>
        </div>
        <MousePointer2 size={14} className="absolute left-[calc(50%-80px)] top-[52px] fill-white text-ink" />
        <Mark n={1} at={{ top: 96, left: "calc(50% + 146px)" }} />
      </Table>
    </Figure>
  );
}

// ─── Studio ───────────────────────────────────────────────────────────────────

export function StudioSelectFigure() {
  return (
    <Figure
      where="Studio · 01 Choisir un template"
      height={236}
      legend={[
        <>Cliquez sur une carte : le document est créé aussitôt et vous passez au remplissage.</>,
        <>L'effort annoncé (court, moyen, long) et le nombre de champs vous disent à quoi vous attendre.</>,
        <>« Aperçu » ouvre le template en grand, sans rien créer.</>,
      ]}
    >
      <WorkflowHeader kind="doc" title="Nouveau document" steps={STUDIO_STEPS} current={0} />
      <div className="grid grid-cols-3 gap-3 bg-paper p-3">
        {[
          { name: "RH — Bilan Mensuel", effort: "Moyen", count: "12 champs, dont 1 obligatoire", hover: true },
          { name: "Produit — Release Notes", effort: "Long", count: "26 champs à remplir" },
          { name: "Incident — Post-Mortem", effort: "Court", count: "7 champs, dont 7 obligatoires" },
        ].map((t, i) => (
          <div key={t.name} className={`relative border bg-white ${t.hover ? "border-doc" : "border-rule"}`}>
            <div className="flex justify-center bg-wash px-4 pt-2">
              <MiniPage className="h-[78px] w-full overflow-hidden" />
            </div>
            <div className="space-y-1 p-2">
              <span className="flex items-center gap-1">
                {i === 0 && <Mark n={1} />}
                <Label className="font-semibold">{t.name}</Label>
              </span>
              <span className="flex items-center gap-1 text-[9px] text-ink-muted">
                <span className="bg-wash px-1 font-medium text-ink">{t.effort}</span>
                {t.count}
                {i === 1 && <Mark n={2} />}
              </span>
            </div>
            {i === 0 && (
              <>
                <span className="absolute right-1.5 top-1.5 flex items-center gap-1">
                  <Mark n={3} />
                  <span className="flex items-center gap-0.5 bg-white/95 px-1 py-0.5 text-[9px] font-medium text-ink ring-1 ring-rule-strong">
                    <Eye size={9} /> Aperçu
                  </span>
                </span>
                <MousePointer2 size={14} className="absolute left-1/2 top-12 fill-white text-ink" />
              </>
            )}
          </div>
        ))}
      </div>
    </Figure>
  );
}

export function FillFormFigure() {
  return (
    <Figure
      where="Studio · 02 Remplir · Formulaire"
      height={290}
      legend={[
        <>Deux façons de remplir le même document : le formulaire, champ par champ, ou directement sur la page.</>,
        <>Ce qu'il reste à faire, et un raccourci vers le premier champ obligatoire encore vide.</>,
        <>Les champs sont rangés par groupes, dans l'ordre choisi par l'auteur du template.</>,
        <>Le champ en cours est surligné sur la page : vous voyez toujours où va votre texte.</>,
      ]}
    >
      <WorkflowHeader kind="doc" title="Bilan mensuel — octobre" steps={STUDIO_STEPS} current={1} />
      <div className="grid h-full grid-cols-[48%_52%]">
        <div className="space-y-2.5 border-r border-rule bg-white py-3 pl-2 pr-3">
          <Row n={1}>
            <div className="flex gap-4 border-b border-rule pb-1.5 text-[10px]">
              <span className="flex items-center gap-1 border-b-2 border-doc pb-1 font-semibold">
                <List size={10} /> Formulaire
              </span>
              <span className="flex items-center gap-1 pb-1 text-ink-subtle">
                <MousePointerClick size={10} /> Sur la page
              </span>
            </div>
          </Row>
          <Row n={2}>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span>Encore 2 champs à remplir</span>
                <span className="font-mono text-ink-muted">5 / 7</span>
              </div>
              <SegmentedProgress filled={5} total={7} height={4} />
              <span className="block text-[9px] text-doc-strong underline">
                1 champ obligatoire vide — aller au premier
              </span>
            </div>
          </Row>
          <Row n={3}>
            <div className="flex items-center justify-between border-b border-rule pb-0.5">
              <MonoLabel>
                <ChevronDown size={9} className="mr-0.5 inline" />
                En-tête
              </MonoLabel>
              <span className="font-mono text-[9px] text-ink-subtle">1/1</span>
            </div>
          </Row>
          <Row>
            <div className="space-y-1.5">
              <Label>Période</Label>
              <Input value="Octobre 2026" />
              <div className="flex items-center justify-between border-b border-rule pb-0.5 pt-1">
                <MonoLabel>
                  <ChevronDown size={9} className="mr-0.5 inline" />
                  Indicateurs
                </MonoLabel>
                <span className="font-mono text-[9px] text-ink-subtle">2/4</span>
              </div>
              <div className="flex justify-between">
                <Label>KPI — Effectif total</Label>
                <span className="text-[9px] text-warn-strong">obligatoire</span>
              </div>
              <Input value="128" className="border-doc ring-1 ring-doc" />
            </div>
          </Row>
        </div>
        <Table className="relative flex justify-center pt-3">
          <MiniPage className="h-fit w-56" zones={{ kpis: "active" }} />
          <Mark n={4} at={{ top: 98, left: "calc(50% - 124px)" }} />
        </Table>
      </div>
    </Figure>
  );
}

export function InlineFillFigure() {
  return (
    <Figure
      where="Studio · 02 Remplir · Sur la page"
      height={250}
      legend={[
        <>Survolez la page : chaque zone remplissable s'encadre. Cliquez pour l'ouvrir.</>,
        <>La zone s'édite dans un panneau posé à côté d'elle ; le document se met à jour pendant la frappe.</>,
        <>« Champ vide suivant » vous emmène directement au prochain champ à remplir.</>,
      ]}
    >
      <div className="flex h-7 items-center gap-3 border-b border-rule bg-paper px-3 text-[10px]">
        <span>Encore 2 champs</span>
        <span className="flex items-center gap-1 font-semibold text-ink">
          <ArrowRight size={10} /> Champ vide suivant
        </span>
        <Mark n={3} />
      </div>
      <Table className="relative flex justify-center pt-3">
        <MiniPage className="h-fit w-60" zones={{ intro: "active" }} />
        <div className="absolute left-[calc(50%+128px)] top-[52px] w-40 space-y-1.5 border border-ink bg-white p-2 shadow-md">
          <span className="flex items-center justify-between">
            <MonoLabel>Introduction</MonoLabel>
            <Mark n={2} />
          </span>
          <span className="block h-12 border border-doc bg-white p-1 text-[9px] leading-snug text-ink ring-1 ring-doc">
            Ce mois-ci, l'équipe a accueilli 4 nouveaux arrivants…
          </span>
          <span className="flex justify-end">
            <Btn tone="ink">OK</Btn>
          </span>
        </div>
        <MousePointer2 size={14} className="absolute left-[calc(50%+40px)] top-[64px] fill-white text-ink" />
        <Mark n={1} at={{ top: 72, left: "calc(50% - 134px)" }} />
      </Table>
    </Figure>
  );
}

export function ReviewFigure() {
  return (
    <Figure
      where="Studio · 03 Relire"
      height={236}
      legend={[
        <>Les champs obligatoires encore vides sont listés. Survolez-en un : sa place s'allume sur la page.</>,
        <>Cliquez dessus pour revenir au remplissage, directement sur ce champ.</>,
        <>La page affichée est exactement celle qui sera exportée en PDF.</>,
      ]}
    >
      <WorkflowHeader kind="doc" title="Bilan mensuel — octobre" steps={STUDIO_STEPS} current={2} />
      <div className="flex flex-wrap items-center gap-1.5 border-b border-warn-rule bg-warn-tint px-3 py-1.5 text-[10px]">
        <Mark n={1} />
        <span className="font-medium text-warn-strong">2 champs obligatoires vides :</span>
        <span className="bg-white px-1 py-0.5 font-medium text-warn-strong ring-1 ring-warn">Effectif total</span>
        <span className="bg-white px-1 py-0.5 font-medium text-warn-strong ring-1 ring-warn-rule">
          Actions prioritaires
        </span>
        <Mark n={2} />
        <span className="text-warn-strong/80">Vous pouvez tout de même exporter.</span>
      </div>
      <Table className="relative flex justify-center pt-3">
        <MiniPage className="h-fit w-64" zones={{ kpis: "warn" }} />
        <Mark n={3} at={{ top: 22, left: "calc(50% + 146px)" }} />
      </Table>
    </Figure>
  );
}

export function ExportFigure() {
  return (
    <Figure
      where="Studio · 04 Exporter"
      height={260}
      legend={[
        <>
          Nommez le fichier et choisissez le format : « Adapté au contenu » (une page de la hauteur du contenu) ou « A4
          standard » (pages découpées).
        </>,
        <>« Exporter en PDF » ouvre la fenêtre d'impression du navigateur.</>,
        <>
          Dans cette fenêtre, choisissez la destination <strong>Enregistrer au format PDF</strong> et des marges{" "}
          <strong>Aucune</strong>, puis Enregistrer.
        </>,
      ]}
    >
      <WorkflowHeader kind="doc" title="Bilan mensuel — octobre" steps={STUDIO_STEPS} current={3} />
      <div className="grid h-full grid-cols-[44%_56%]">
        <div className="space-y-2 border-r border-rule bg-white py-3 pl-2 pr-3">
          <Row n={1}>
            <div className="space-y-2">
              <Label className="font-semibold">Nom du fichier</Label>
              <span className="flex items-center gap-1">
                <Input value="Bilan mensuel — octobre" className="flex-1" />
                <span className="text-[9px] text-ink-subtle">.pdf</span>
              </span>
              <Label className="pt-1 font-semibold">Format de page</Label>
              <div className="grid grid-cols-2 gap-1.5">
                <span className="border border-ink bg-paper p-1.5">
                  <Label className="font-semibold">Adapté au contenu</Label>
                  <span className="text-[8px] text-ink-subtle">une page, sans coupure</span>
                </span>
                <span className="border border-rule p-1.5">
                  <Label className="font-semibold">A4 standard</Label>
                  <span className="text-[8px] text-ink-subtle">pages découpées</span>
                </span>
              </div>
            </div>
          </Row>
          <Row n={2} className="pt-3">
            <Btn tone="doc">
              <Printer size={10} /> Exporter en PDF
            </Btn>
          </Row>
        </div>
        <Table className="flex items-start justify-center pt-4">
          <div className="w-64 space-y-2 border border-rule-strong bg-white p-3 shadow-lg">
            <span className="flex items-center gap-1.5">
              <Mark n={3} />
              <Label className="text-[11px] font-semibold">Imprimer</Label>
            </span>
            <div className="grid grid-cols-[70px_1fr] items-center gap-y-1.5 text-[10px]">
              <span className="text-ink-muted">Destination</span>
              <span className="border border-doc bg-doc-tint px-1.5 py-0.5 text-ink">Enregistrer au format PDF</span>
              <span className="text-ink-muted">Pages</span>
              <span className="border border-rule px-1.5 py-0.5 text-ink-subtle">Toutes</span>
              <span className="text-ink-muted">Marges</span>
              <span className="border border-doc bg-doc-tint px-1.5 py-0.5 text-ink">Aucune</span>
            </div>
            <span className="flex justify-end gap-1.5 pt-1">
              <Btn tone="ghost">Annuler</Btn>
              <Btn tone="tpl">Enregistrer</Btn>
            </span>
          </div>
        </Table>
      </div>
    </Figure>
  );
}

export function DocumentCardFigure() {
  return (
    <Figure
      where="Studio · liste des documents"
      height={206}
      legend={[
        <>
          Le statut se lit à la forme du repère : <strong>Brouillon</strong> (vide), <strong>Finalisé</strong> (plein,
          exporté en PDF), <strong>Modifié depuis l'export</strong> (losange : le PDF n'est plus à jour).
        </>,
        <>« Dupliquer » crée une nouvelle édition avec le même contenu : idéal pour repartir du mois précédent.</>,
        <>Export PDF direct et suppression (une confirmation est toujours demandée).</>,
      ]}
    >
      <div className="grid h-full grid-cols-3 gap-3 bg-paper p-3">
        {[
          { name: "Bilan — septembre", status: <Status shape="filled">Finalisé</Status>, filled: 7 },
          { name: "Bilan — octobre", status: <Status shape="hollow">Brouillon</Status>, filled: 5 },
          { name: "Bilan — août", status: <Status shape="diamond">Modifié depuis l'export</Status>, filled: 7 },
        ].map((d, i) => (
          <div key={d.name} className="flex flex-col border border-rule border-t-[3px] border-t-doc bg-white">
            <div className="flex h-16 justify-center overflow-hidden bg-wash px-5 pt-2">
              <MiniPage className="w-full" />
            </div>
            <div className="space-y-1.5 p-2">
              <Label className="font-semibold">{d.name}</Label>
              <span className="flex items-center gap-1.5">
                {d.status}
                {i === 0 && <Mark n={1} />}
              </span>
              <SegmentedProgress filled={d.filled} total={7} height={3} />
              <span className="flex items-center justify-end gap-2 text-[9px] text-ink-muted">
                {i === 0 && <Mark n={2} />}
                <span>Dupliquer</span>
                <span>PDF</span>
                <span>Suppr.</span>
                {i === 0 && <Mark n={3} />}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Figure>
  );
}

// ─── Atelier ──────────────────────────────────────────────────────────────────

export function TemplateStartFigure() {
  return (
    <Figure
      where="Atelier · 01 Point de départ"
      height={226}
      legend={[
        <>Repartir d'un template existant : la copie reprend thème, mise en page et champs. C'est le plus rapide.</>,
        <>
          Le statut de chaque template : <strong>Publié</strong> (utilisable dans le Studio), <strong>Brouillon</strong>
          , ou <strong>Modifs non publiées</strong>.
        </>,
        <>Ou partir d'une page blanche, avec un thème à choisir.</>,
      ]}
    >
      <WorkflowHeader kind="tpl" title="Nouveau template" steps={ATELIER_STEPS} current={0} />
      <div className="grid grid-cols-[1fr_1fr_1fr_150px] gap-3 bg-paper p-3">
        {[
          { name: "RH — Bilan Mensuel", status: <Status shape="filled">Publié</Status> },
          { name: "Chantiers techniques", status: <Status shape="dashed">Brouillon</Status> },
          { name: "Release Notes", status: <Status shape="diamond">Modifs non publiées</Status> },
        ].map((t, i) => (
          <div key={t.name} className="border border-rule bg-white">
            <BlueprintFrame className="flex h-20 justify-center overflow-hidden px-4 pt-2">
              <MiniPage className="w-full" />
            </BlueprintFrame>
            <div className="space-y-1 p-2">
              <span className="flex items-center gap-1">
                {i === 0 && <Mark n={1} />}
                <Label className="font-semibold">{t.name}</Label>
              </span>
              <span className="flex items-center gap-1">
                {t.status}
                {i === 0 && <Mark n={2} />}
              </span>
            </div>
          </div>
        ))}
        <div className="flex flex-col gap-1.5">
          <MonoLabel>Ou partir d'autre chose</MonoLabel>
          <span className="space-y-0.5 border border-rule bg-white p-2">
            <span className="flex items-center gap-1">
              <Mark n={3} />
              <Label className="font-semibold">Page blanche</Label>
            </span>
            <span className="block text-[8px] text-ink-subtle">Choisir un thème puis assembler</span>
          </span>
        </div>
      </div>
    </Figure>
  );
}

export function ThemeFigure() {
  return (
    <Figure
      where="Atelier · 02 Thème"
      height={246}
      legend={[
        <>Un clic sur un thème prédéfini l'applique en entier ; vous pouvez ensuite l'ajuster.</>,
        <>
          Couleur de marque, couleurs des blocs, typographie, fonds : chaque réglage se répercute sur tout le document.
        </>,
        <>L'aperçu se met à jour immédiatement. Cette étape est facultative : le thème par défaut fonctionne.</>,
      ]}
    >
      <WorkflowHeader kind="tpl" title="RH — Bilan Mensuel" steps={ATELIER_STEPS} current={1} />
      <div className="grid h-full grid-cols-[46%_54%]">
        <div className="space-y-2 border-r border-rule bg-white py-3 pl-2 pr-3">
          <Row n={1}>
            <MonoLabel>Thèmes prédéfinis</MonoLabel>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              {BUILTIN_THEMES.slice(0, 4).map(({ name, colors }) => {
                const active = name === "Minimal Light";
                return (
                  <span
                    key={name}
                    className={`space-y-1 border p-1.5 ${active ? "border-ink bg-paper" : "border-rule"}`}
                  >
                    <span className="flex gap-0.5">
                      {[colors.primary, colors.accent, colors.success, colors.warning].map((color, i) => (
                        <span key={i} className="h-2.5 w-2.5" style={{ backgroundColor: color }} />
                      ))}
                    </span>
                    <Label className={active ? "font-semibold" : ""}>{name}</Label>
                  </span>
                );
              })}
            </div>
          </Row>
          <Row n={2}>
            <MonoLabel>Couleur de marque</MonoLabel>
            <span className="mt-1 flex items-center gap-1.5">
              <span className="h-4 w-4 bg-ink" />
              <Input value="#1a1a1a" className="w-20" />
            </span>
            <span className="mt-1.5 flex items-center gap-1 text-[10px] text-ink-muted">
              <ChevronDown size={10} className="-rotate-90" /> Indicateurs et blocs colorés
            </span>
            <span className="flex items-center gap-1 text-[10px] text-ink-muted">
              <ChevronDown size={10} className="-rotate-90" /> Textes
            </span>
          </Row>
        </div>
        <Table className="relative flex justify-center pt-3">
          <MiniPage className="h-fit w-52" />
          <Mark n={3} at={{ top: 22, left: "calc(50% + 120px)" }} />
        </Table>
      </div>
    </Figure>
  );
}

export function BuildFigure() {
  return (
    <Figure
      where="Atelier · 03 Construire"
      height={270}
      legend={[
        <>
          La bibliothèque : vos presets en tête, puis les composants de base par catégorie. Glissez-en un sur la page.
        </>,
        <>Un trait indique où le composant sera déposé. Les poignées permettent ensuite de le déplacer.</>,
        <>Cliquez sur un composant : l'inspecteur affiche ses réglages (textes par défaut, couleurs, colonnes…).</>,
        <>« Aperçu PDF » imprime le template avec son contenu par défaut, pour vérifier la mise en page.</>,
      ]}
    >
      <div className="flex h-9 items-center gap-3 border-b-2 border-ink bg-paper px-3">
        <span className="origin-left scale-90">
          <ObjectTag kind="tpl" />
        </span>
        <span className="text-[10px] font-semibold">RH — Bilan Mensuel</span>
        <span className="ml-auto flex items-center gap-1.5">
          <Mark n={4} />
          <Btn tone="outline">
            <Eye size={10} /> Aperçu PDF
          </Btn>
          <Btn tone="ink">
            Champs et publication <ArrowRight size={10} />
          </Btn>
        </span>
      </div>
      <div className="grid h-full grid-cols-[28%_44%_28%]">
        <div className="space-y-1.5 border-r border-rule bg-white p-2.5">
          <span className="flex items-center gap-1.5">
            <Mark n={1} />
            <MonoLabel>Bibliothèque</MonoLabel>
          </span>
          <span className="flex items-center gap-1 border border-rule-strong px-1.5 py-0.5 text-[9px] text-ink-faint">
            <Search size={9} /> Rechercher…
          </span>
          <span className="flex items-center gap-1 font-mono text-[9px] font-semibold text-preset">
            <ObjectMark kind="preset" size={6} /> MES PRESETS
          </span>
          {["KPI Succès vert", "Intro alerte rouge"].map((p, i) => (
            <span
              key={p}
              className={`block rounded-[6px] px-2 py-1 ${i === 0 ? "bg-preset-tint ring-1 ring-preset/40" : ""}`}
            >
              <Label className="font-semibold">{p}</Label>
              <span className="text-[8px] text-ink-faint">Carte KPI</span>
            </span>
          ))}
          <MonoLabel className="pt-1">Mise en page</MonoLabel>
          <Label>Colonnes</Label>
          <Label>Encadré</Label>
        </div>
        <Table className="relative flex justify-center pt-3">
          <MiniPage className="h-fit w-48" zones={{ right: "pick" }} />
          <span className="absolute left-[calc(50%-96px)] top-[113px] h-0.5 w-48 bg-tpl" />
          <span className="absolute left-[calc(50%-20px)] top-[97px] flex items-center gap-1 rounded-[6px] bg-preset-tint px-1.5 py-0.5 text-[9px] font-semibold shadow ring-1 ring-preset/40">
            <GripVertical size={9} /> KPI Succès vert
          </span>
          <Mark n={2} at={{ top: 114, left: "calc(50% - 108px)" }} />
        </Table>
        <div className="space-y-1.5 border-l border-rule bg-white p-2.5">
          <span className="flex items-center gap-1.5">
            <Mark n={3} />
            <MonoLabel>Inspecteur</MonoLabel>
          </span>
          <Label className="font-semibold">Bloc de détails</Label>
          <Label>Titre</Label>
          <Input value="Sorties & mobilité" />
          <Label>Couleur d'accent</Label>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 bg-warn" />
            <Input value="#D97706" className="flex-1" />
          </span>
        </div>
      </div>
    </Figure>
  );
}

export function FieldsFigure() {
  const field = (label: string, required = false, n?: number) => (
    <span className="flex items-center gap-1.5 py-0.5">
      <GripVertical size={9} className="text-ink-faint" />
      <Input value={label} className="flex-1" />
      <span
        className={`px-1 py-0.5 text-[8px] ${required ? "bg-warn-tint text-warn-strong ring-1 ring-warn-rule" : "text-ink-faint ring-1 ring-rule"}`}
      >
        Obligatoire
      </span>
      <X size={9} className="text-ink-faint" />
      {n !== undefined && <Mark n={n} />}
    </span>
  );
  return (
    <Figure
      where="Atelier · 04 Champs et publication"
      height={300}
      legend={[
        <>
          Les <strong>champs retenus</strong> forment le formulaire du Studio. DocForge en propose une sélection ;
          renommez-les, groupez-les, réordonnez-les.
        </>,
        <>
          « Obligatoire » : la relecture signalera ce champ s'il est vide. La croix le retire : son texte deviendra
          fixe.
        </>,
        <>
          Les <strong>contenus non retenus</strong> resteront identiques dans tous les documents. Le « + » en fait un
          champ.
        </>,
        <>Cliquez sur une zone de la page pour retrouver ses champs dans la liste.</>,
      ]}
    >
      <WorkflowHeader kind="tpl" title="RH — Bilan Mensuel" steps={ATELIER_STEPS} current={3} />
      <div className="grid h-full grid-cols-[52%_48%]">
        <div className="space-y-1.5 border-r border-rule bg-white py-3 pl-2 pr-3">
          <Row n={1}>
            <div className="flex gap-3 border-b border-rule pb-1 text-[10px]">
              <span className="border-b-2 border-tpl pb-0.5 font-semibold">
                Champs <span className="font-mono text-[9px]">12</span>
              </span>
              <span className="text-ink-subtle">Formulaire du Studio</span>
              <span className="text-ink-subtle">Nom et description</span>
            </div>
          </Row>
          <Row>
            <MonoLabel>En-tête</MonoLabel>
            {field("Période", true, 2)}
            <MonoLabel className="pt-1">Indicateurs</MonoLabel>
            {field("KPI — Effectif total")}
            {field("KPI — Recrutements")}
          </Row>
          <Row n={3}>
            <span className="flex items-center justify-between border-t border-rule pt-1.5 text-[10px] font-semibold text-ink-muted">
              <span className="flex items-center gap-1">
                <ChevronDown size={10} /> Contenus non retenus
              </span>
              <span className="font-normal text-ink-faint">6</span>
            </span>
            <span className="mt-1 flex items-center gap-1.5 text-[10px] text-ink-soft">
              <span className="flex h-3.5 w-3.5 items-center justify-center border border-rule-strong">
                <Plus size={8} />
              </span>
              Titre de section « Mouvements du mois »
            </span>
          </Row>
        </div>
        <Table className="relative flex justify-center pt-3">
          <MiniPage
            className="h-fit w-52"
            zones={{ title: "pick", intro: "pick", kpis: "active", left: "pick", right: "pick", box: "pick" }}
          />
          <MousePointer2 size={14} className="absolute left-[calc(50%-30px)] top-[92px] fill-white text-ink" />
          <Mark n={4} at={{ top: 98, left: "calc(50% + 118px)" }} />
        </Table>
      </div>
    </Figure>
  );
}

export function VersionsFigure() {
  const doc = (name: string, version: string, faded = false) => (
    <span
      className={`flex items-center gap-1.5 border border-rule border-l-[3px] border-l-doc bg-white px-2 py-1 ${faded ? "opacity-70" : ""}`}
    >
      <ObjectMark kind="doc" size={7} />
      <span className="text-[10px] font-semibold">{name}</span>
      <span className="ml-auto font-mono text-[9px] text-ink-subtle">{version}</span>
    </span>
  );
  const tpl = (version: string, status: ReactNode) => (
    <span className="flex items-center gap-1.5 border-[1.5px] border-dashed border-tpl bg-tpl-tint px-2 py-1">
      <span className="text-[10px] font-semibold text-tpl">Template {version}</span>
      <span className="ml-auto">{status}</span>
    </span>
  );
  const title = (n: number, label: string) => (
    <span className="flex items-center gap-1.5">
      <Mark n={n} />
      <MonoLabel>{label}</MonoLabel>
    </span>
  );
  return (
    <Figure
      where="Principe · versions publiées"
      height={196}
      legend={[
        <>
          Publier fige une <strong>version</strong> du template. Le Studio crée les documents à partir de cette version.
        </>,
        <>
          Tant que vous ne republiez pas, vos modifications restent dans l'Atelier (« Modifs non publiées ») : les
          contributeurs ne les voient pas.
        </>,
        <>
          Après publication, seuls les <strong>nouveaux</strong> documents suivent la nouvelle version. Un document
          existant garde la sienne (et ses doublons aussi).
        </>,
      ]}
    >
      <Table className="grid grid-cols-3 gap-5 p-4">
        <div className="space-y-2">
          {title(1, "Publication")}
          {tpl("v1", <Status shape="filled">Publié</Status>)}
          {doc("Bilan — septembre", "v1")}
        </div>
        <div className="space-y-2">
          {title(2, "Modification")}
          {tpl("v1 + modifs", <Status shape="diamond">Non publiées</Status>)}
          {doc("Bilan — octobre", "v1")}
          <span className="block text-[9px] text-ink-muted">Le Studio utilise encore la v1.</span>
        </div>
        <div className="space-y-2">
          {title(3, "Republication")}
          {tpl("v2", <Status shape="filled">Publié</Status>)}
          {doc("Bilan — novembre", "v2")}
          {doc("Bilan — octobre", "v1", true)}
        </div>
      </Table>
    </Figure>
  );
}

// ─── Bibliothèque ─────────────────────────────────────────────────────────────

export function PresetFigure() {
  return (
    <Figure
      where="Bibliothèque · Nouveau preset"
      height={280}
      legend={[
        <>Choisissez le composant de base à préconfigurer (carte KPI, encadré, bloc de détails…).</>,
        <>Réglez ses propriétés ; l'aperçu montre le résultat dans le thème choisi.</>,
        <>Donnez-lui un nom parlant et une catégorie : c'est ce qu'on lira dans l'Atelier.</>,
        <>Le preset apparaît ensuite en tête de la bibliothèque de l'Atelier, sous « Mes presets ».</>,
      ]}
    >
      <WorkflowHeader kind="preset" title="Nouveau preset — Carte KPI" steps={PRESET_STEPS} current={1} />
      <div className="grid h-full grid-cols-[30%_38%_32%]">
        <div className="space-y-1.5 border-r border-rule bg-white p-2.5">
          <span className="flex items-center gap-1.5">
            <Mark n={1} />
            <MonoLabel>Composant de base</MonoLabel>
          </span>
          {["Carte KPI", "Encadré d'introduction", "Bloc de détails"].map((c, i) => (
            <span
              key={c}
              className={`flex items-center gap-1 px-1.5 py-1 text-[10px] ${i === 0 ? "bg-preset-tint font-semibold ring-1 ring-preset/40" : "text-ink-soft"}`}
            >
              {i === 0 && <Check size={9} className="text-preset" />}
              {c}
            </span>
          ))}
          <span className="flex items-center gap-1.5 pt-2">
            <Mark n={2} />
            <MonoLabel>Propriétés</MonoLabel>
          </span>
          <Label>Titre</Label>
          <Input value="Effectif total" />
          <Label>Couleur</Label>
          <span className="flex gap-1">
            <span className="h-3 w-3 bg-preset ring-1 ring-ink ring-offset-1" />
            <span className="h-3 w-3 bg-tpl" />
            <span className="h-3 w-3 bg-warn" />
          </span>
        </div>
        <Table className="flex items-center justify-center">
          <span className="w-32 space-y-1 border-t-[3px] border-preset bg-preset-tint p-2 shadow-sm">
            <span className="block text-[10px] font-semibold">Effectif total</span>
            <span className="block text-[14px] font-bold">128</span>
            <Line w="70%" h={3} />
          </span>
        </Table>
        <div className="space-y-1.5 border-l border-rule bg-white p-2.5">
          <span className="flex items-center gap-1.5">
            <Mark n={3} />
            <MonoLabel>Nommer et ranger</MonoLabel>
          </span>
          <Label>Nom</Label>
          <Input value="KPI Succès vert" />
          <Label>Catégorie</Label>
          <Input value="Données" />
          <span className="flex items-center gap-1.5 pt-2">
            <Mark n={4} />
            <MonoLabel>Dans l'Atelier</MonoLabel>
          </span>
          <span className="flex items-center gap-1 font-mono text-[9px] font-semibold text-preset">
            <ObjectMark kind="preset" size={6} /> MES PRESETS
          </span>
          <span className="block rounded-[6px] bg-preset-tint px-2 py-1 ring-1 ring-preset/40">
            <Label className="font-semibold">KPI Succès vert</Label>
          </span>
        </div>
      </div>
    </Figure>
  );
}
