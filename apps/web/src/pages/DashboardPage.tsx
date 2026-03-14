import { Link } from "react-router-dom";
import { LayoutTemplate, Puzzle, FileText } from "lucide-react";

const SPACES = [
  {
    icon: LayoutTemplate,
    label: "Atelier Templates",
    description: "Créez et éditez vos templates de documents.",
    to: "/templates",
  },
  {
    icon: Puzzle,
    label: "Bibliothèque Composants",
    description: "Gérez vos presets de composants réutilisables.",
    to: "/components",
  },
  {
    icon: FileText,
    label: "Studio de Publication",
    description: "Assemblez et publiez vos documents finaux.",
    to: "/documents",
  },
];

export function DashboardPage() {
  return (
    <div className="min-h-full bg-gray-50 flex flex-col items-center justify-center px-8 py-16">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">DocForge</h1>
      <p className="text-sm text-gray-500 mb-10">Choisissez un espace de travail</p>

      <div className="grid grid-cols-3 gap-4 max-w-3xl w-full">
        {SPACES.map(({ icon: Icon, label, description, to }) => (
          <Link
            key={to}
            to={to}
            className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col gap-3 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Icon size={20} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">{label}</h2>
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
