import type { ComponentDefinition } from "@template-generator/shared/types/component";
import type { Theme } from "@template-generator/shared/types/template";
import type { ComponentType, ReactNode } from "react";

/** Composant React associé à une définition */
export interface RegisteredComponent extends ComponentDefinition {
  render: ComponentType<Record<string, unknown> & { theme: Theme; children?: ReactNode }>;
}

const registryMap = new Map<string, RegisteredComponent>();

export function register(component: RegisteredComponent): void {
  registryMap.set(component.type, component);
}

export function get(type: string): RegisteredComponent | undefined {
  return registryMap.get(type);
}

export function getAll(): RegisteredComponent[] {
  return Array.from(registryMap.values());
}