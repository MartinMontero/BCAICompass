import type { Category } from './organizations';

/**
 * The one active preset, shared by the map and the directory.
 *
 * Modelled as a single nullable slot rather than two independent pieces of state,
 * so "an onramp preset and a pathway preset are mutually exclusive" is true by
 * construction instead of by remembering to clear the other one. There is nowhere
 * to put a second preset.
 */
export type Preset =
  | { kind: 'onramp'; id: string; label: string; categories: Category[] }
  | { kind: 'pathway'; id: string; name: string; stops: string[] }
  | null;
