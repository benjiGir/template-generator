import { describe, expect, it } from "vitest";
import { parseBlocks } from "./markdown";

describe("parseBlocks", () => {
  it("sépare deux paragraphes par une ligne vide, comme l'éditeur les écrit", () => {
    expect(parseBlocks("Premier paragraphe.\n\nSecond paragraphe.")).toEqual([
      { type: "paragraph", content: "Premier paragraphe." },
      { type: "paragraph", content: "Second paragraphe." },
    ]);
  });

  it("réunit des lignes qui se suivent en un seul paragraphe", () => {
    expect(parseBlocks("Une phrase\nqui continue.")).toEqual([
      { type: "paragraph", content: "Une phrase qui continue." },
    ]);
  });

  it("reconnaît les listes, et reprend un paragraphe après elles", () => {
    expect(parseBlocks("**En bref**\n\n- Un\n- Deux\n\n1. Premier\nSuite")).toEqual([
      { type: "paragraph", content: "**En bref**" },
      { type: "ul-item", content: "Un" },
      { type: "ul-item", content: "Deux" },
      { type: "ol-item", content: "Premier" },
      { type: "paragraph", content: "Suite" },
    ]);
  });

  it("ne produit rien pour un texte vide", () => {
    expect(parseBlocks("  \n \n")).toEqual([]);
  });
});
