import { useEditorStore } from "@/store/editor-store";
import { PageView } from "./PageView";

export function Canvas() {
  const template = useEditorStore((s) => s.template);
  const selectNode = useEditorStore((s) => s.selectNode);

  if (!template) return null;

  return (
    <div
      data-print-root
      className="flex-1 overflow-y-auto bg-gray-100 py-8 px-6"
      onClick={() => selectNode(null)}
    >
      <div className="flex flex-col items-center">
        {template.pages.map((page, i) => (
          <PageView
            key={page.id}
            page={page}
            pageIndex={i}
            theme={template.theme}
            pageFormat={page.format ?? template.pageFormat}
          />
        ))}
      </div>
    </div>
  );
}
