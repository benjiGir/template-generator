export function ComponentsListPage() {
  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Bibliothèque Composants</h1>
        <button
          disabled
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded opacity-40 cursor-not-allowed"
        >
          + Nouveau preset
        </button>
      </div>
      <div className="px-8 py-20 text-center">
        <p className="text-gray-400 text-sm">Bibliothèque Composants — À venir (Phase 3 étape 3)</p>
      </div>
    </div>
  );
}
