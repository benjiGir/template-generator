import { useEffect, useRef, type MouseEvent, type ReactNode, type RefObject } from "react";

/**
 * - center : fenêtre au centre (confirmation, saisie courte)
 * - fill : grande fenêtre qui laisse voir un liseré de l'écran (aperçu)
 * - side : panneau sur toute la hauteur, à droite (aide)
 * - cover : calque transparent sur tout l'écran, le contenu se place lui-même (visite guidée)
 */
export type DialogPlacement = "center" | "fill" | "side" | "cover";

const PLACEMENTS: Record<DialogPlacement, string> = {
  center: "m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto bg-white shadow-xl backdrop:bg-ink/40",
  fill: "m-auto h-[calc(100dvh-3rem)] w-[calc(100%-3rem)] overflow-hidden bg-white shadow-2xl backdrop:bg-ink/50",
  side: "my-0 ml-auto mr-0 h-dvh max-h-none w-[520px] max-w-full border-l-2 border-ink bg-paper backdrop:bg-ink/20",
  cover: "m-0 h-dvh max-h-none w-screen max-w-none overflow-visible bg-transparent backdrop:bg-transparent",
};

interface Props {
  /** Appelé sur Échap, sur un clic en dehors de la fenêtre (sauf `dismissable={false}`) ou par le bouton Fermer */
  onClose: () => void;
  children: ReactNode;
  placement?: DialogPlacement;
  /** `alertdialog` pour une confirmation qui attend une réponse */
  role?: "dialog" | "alertdialog";
  /** Identifiant du titre affiché dans la fenêtre ; sinon `label` */
  labelledBy?: string;
  label?: string;
  /** Élément qui reçoit le focus à l'ouverture ; sinon le premier élément focalisable */
  initialFocus?: RefObject<HTMLElement | null>;
  /** Un clic en dehors ferme la fenêtre (vrai par défaut) */
  dismissable?: boolean;
  /** Largeur, mise en page interne… */
  className?: string;
}

/**
 * Fenêtre modale, sur l'élément `<dialog>` natif : le navigateur la place au-dessus de tout,
 * rend le reste de la page inerte, garde le focus dedans et gère Échap.
 * La fenêtre est ouverte tant que le composant est affiché ; le focus revient ensuite
 * à l'élément qui l'avait avant.
 */
export function Dialog({
  onClose,
  children,
  placement = "center",
  role = "dialog",
  labelledBy,
  label,
  initialFocus,
  dismissable = true,
  className = "",
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  // La dernière version du rappel, sans rouvrir la fenêtre quand le parent en recrée un
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Échap : c'est le parent qui ferme, en cessant d'afficher la fenêtre
    const onCancel = (e: Event) => {
      if (!e.cancelable) return; // le navigateur ferme lui-même : `close` suit
      e.preventDefault();
      onCloseRef.current();
    };
    // Fermeture imposée par le navigateur (Échap répété sans autre interaction) : l'état du parent suit
    // L'événement arrive après coup : s'il suit une fermeture déjà rouverte (double montage de
    // StrictMode en développement), la fenêtre est de nouveau ouverte et il ne concerne plus personne
    const onNativeClose = () => {
      if (!dialog.open) onCloseRef.current();
    };
    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("close", onNativeClose);

    dialog.showModal();
    initialFocus?.current?.focus();

    return () => {
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("close", onNativeClose);
      dialog.close();
      if (previous?.isConnected) previous.focus();
    };
  }, [initialFocus]);

  // Un clic sur le fond atteint le <dialog> lui-même, hors de son rectangle
  const handleMouseDown = (e: MouseEvent<HTMLDialogElement>) => {
    if (!dismissable || e.target !== e.currentTarget) return;
    const r = e.currentTarget.getBoundingClientRect();
    const outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    if (outside) onClose();
  };

  return (
    // Le clic sur le fond complète Échap et le bouton Fermer, qui restent accessibles au clavier
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      role={role === "alertdialog" ? "alertdialog" : undefined}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      onMouseDown={handleMouseDown}
      className={`border-0 p-0 text-ink ${PLACEMENTS[placement]} ${className}`}
    >
      {children}
    </dialog>
  );
}
