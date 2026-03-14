export function DocumentsListPage() {
  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Studio de Publication</h1>
        <button
          disabled
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded opacity-40 cursor-not-allowed"
        >
          + Nouveau document
        </button>
      </div>
      <div className="px-8 py-20 text-center">
        <p className="text-gray-400 text-sm">Studio de Publication — À venir (Phase 3 étapes 4-6)</p>
      </div>
    </div>
  );
}
