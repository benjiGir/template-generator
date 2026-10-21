import { useContext, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { HelpContext, InHelpPanelContext, helpPath } from "./context";

/**
 * Renvoi vers une autre section de l'aide (« article#section »).
 * Dans le panneau latéral, le renvoi remplace le contenu du panneau : on ne quitte pas son travail.
 */
export function HelpLink({ to, children }: { to: string; children: ReactNode }) {
  const inPanel = useContext(InHelpPanelContext);
  const help = useContext(HelpContext);
  const [slug = "", sectionId] = to.split("#");

  if (inPanel && help) {
    return (
      <button type="button" onClick={() => help.open(slug, sectionId)} className="font-medium text-ink underline underline-offset-2 hover:no-underline">
        {children}
      </button>
    );
  }
  return (
    <Link to={helpPath(slug, sectionId)} className="font-medium text-ink underline underline-offset-2 hover:no-underline">
      {children}
    </Link>
  );
}
