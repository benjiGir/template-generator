// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { useComponentDraftStore } from "./component-draft-store";

const store = useComponentDraftStore;

beforeEach(() => {
  store.getState().reset();
  sessionStorage.clear();
});

describe("preset en cours", () => {
  it("part du composant de base et signale les changements à sauvegarder", () => {
    store.getState().setBaseType("kpi-card", { title: "KPI", color: "blue" }, "data", "Carte KPI");
    store.getState().updateProp("color", "green");
    expect(store.getState().props).toEqual({ title: "KPI", color: "green" });
    expect(store.getState().dirty).toBe(true);
  });

  it("charge un preset existant sans changement à sauvegarder", () => {
    store.getState().loadPreset({
      id: "preset-1",
      baseType: "kpi-card",
      label: "KPI vert",
      description: null,
      defaultProps: { color: "green" },
      category: null,
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    const s = store.getState();
    expect(s.editingId).toBe("preset-1");
    expect(s.category).toBe("content");
    expect(s.description).toBe("");
    expect(s.dirty).toBe(false);
  });

  it("survit à un rafraîchissement de la page (sessionStorage)", () => {
    store.getState().setBaseType("kpi-card", { title: "KPI" }, "data", "Carte KPI");
    const saved = sessionStorage.getItem("docforge-preset-draft");
    expect(saved).toContain('"baseType":"kpi-card"');
  });
});
