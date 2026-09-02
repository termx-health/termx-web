/**
 * CodeSystem tree eligibility and hierarchy mode (FHIR hierarchyMeaning + fallbacks).
 *
 * Ported verbatim from terminology-explorer
 * (frontend/projects/tx-viewer/src/app/terminology/resource/code-system-hierarchy.ts).
 * Pure/framework-agnostic — keep it a straight copy so the two stay in sync.
 */

export const HIERARCHY_MODES = ['is-a', 'part-of', 'grouped-by'] as const;
export type HierarchyMode = (typeof HIERARCHY_MODES)[number];

const VALID_MEANINGS = new Set<string>(HIERARCHY_MODES);

/** Priority when inferring from multiple property signals (no hierarchyMeaning). */
const INFER_MODE_PRIORITY: HierarchyMode[] = ['grouped-by', 'is-a', 'part-of'];

const IS_A_CODES = new Set(['is-a', 'isA']);
const PART_OF_CODES = new Set(['part-of', 'partOf']);
const GROUPED_BY_CODES = new Set(['grouped-by', 'groupedBy']);

export function propertyCodeToMode(code: string | undefined): HierarchyMode | null {
  if (!code) {
    return null;
  }
  if (IS_A_CODES.has(code)) {
    return 'is-a';
  }
  if (PART_OF_CODES.has(code)) {
    return 'part-of';
  }
  if (GROUPED_BY_CODES.has(code)) {
    return 'grouped-by';
  }
  return null;
}

function pickModeFromSet(found: Set<HierarchyMode>): HierarchyMode | null {
  for (const m of INFER_MODE_PRIORITY) {
    if (found.has(m)) {
      return m;
    }
  }
  return null;
}

function collectModesFromProperties(concept: {property?: Array<{code?: string}>}): Set<HierarchyMode> {
  const found = new Set<HierarchyMode>();
  for (const p of concept.property || []) {
    const m = propertyCodeToMode(p.code);
    if (m) {
      found.add(m);
    }
  }
  return found;
}

function hasNestedConcepts(concepts: any[] | undefined, recurseKey = 'concept'): boolean {
  if (!concepts?.length) {
    return false;
  }
  for (const c of concepts) {
    const children = c[recurseKey];
    if (children?.length) {
      return true;
    }
  }
  return false;
}

function walkConceptsDeep(
  concepts: any[] | undefined,
  recurseKey: string,
  visit: (c: any) => void
): void {
  if (!concepts?.length) {
    return;
  }
  for (const c of concepts) {
    visit(c);
    walkConceptsDeep(c[recurseKey], recurseKey, visit);
  }
}

/**
 * Scan concept trees for hierarchical property codes or nested children.
 */
export function inferHierarchyModeFromConcepts(
  concepts: any[] | undefined,
  recurseKey = 'concept'
): HierarchyMode | null {
  if (!concepts?.length) {
    return null;
  }
  if (hasNestedConcepts(concepts, recurseKey)) {
    return 'grouped-by';
  }
  const found = new Set<HierarchyMode>();
  walkConceptsDeep(concepts, recurseKey, c => {
    for (const m of collectModesFromProperties(c)) {
      found.add(m);
    }
  });
  return pickModeFromSet(found);
}

/**
 * From CodeSystem resource (summary or full): hierarchyMeaning, property definitions, optional concept[].
 */
export function resolveHierarchyModeFromCodeSystem(codeSystem: {
  hierarchyMeaning?: string;
  property?: Array<{code?: string}>;
  concept?: any[];
} | null | undefined): HierarchyMode | null {
  if (!codeSystem) {
    return null;
  }
  const hm = codeSystem.hierarchyMeaning;
  if (hm && VALID_MEANINGS.has(hm)) {
    return hm as HierarchyMode;
  }
  const fromDefs = new Set<HierarchyMode>();
  for (const p of codeSystem.property || []) {
    const m = propertyCodeToMode(p.code);
    if (m) {
      fromDefs.add(m);
    }
  }
  const picked = pickModeFromSet(fromDefs);
  if (picked) {
    return picked;
  }
  return inferHierarchyModeFromConcepts(codeSystem.concept, 'concept');
}

/**
 * Full resolution when the full concept list is available (after full CodeSystem read).
 */
export function resolveHierarchyModeWithConcepts(
  codeSystem: {hierarchyMeaning?: string; property?: Array<{code?: string}>} | null | undefined,
  concepts: any[]
): HierarchyMode | null {
  const hm = codeSystem?.hierarchyMeaning;
  if (hm && VALID_MEANINGS.has(hm)) {
    return hm as HierarchyMode;
  }
  if (concepts.length > 0) {
    const fromConcepts = inferHierarchyModeFromConcepts(concepts, 'concept');
    if (fromConcepts) {
      return fromConcepts;
    }
  }
  return resolveHierarchyModeFromCodeSystem({...codeSystem, concept: undefined});
}

/**
 * Whether the CodeSystem content UI should offer tree view (before or without full concept load).
 */
export function codeSystemSupportsTreeView(codeSystem: {
  hierarchyMeaning?: string;
  property?: Array<{code?: string}>;
  concept?: any[];
  count?: number;
} | null | undefined): boolean {
  return resolveHierarchyModeFromCodeSystem(codeSystem) !== null;
}

export function getParentPropertyCodes(mode: HierarchyMode): string[] {
  switch (mode) {
    case 'is-a':
      return ['is-a', 'isA'];
    case 'part-of':
      return ['part-of', 'partOf'];
    case 'grouped-by':
      return ['grouped-by', 'groupedBy'];
    default:
      return [];
  }
}

/** Every parent code this concept declares (a concept may legitimately have several). */
export function readParentKeys(concept: any, propertyCodes: string[]): string[] {
  const keys: string[] = [];
  for (const p of concept.property || []) {
    if (!propertyCodes.includes(p.code)) {
      continue;
    }
    const key = p.valueCode ?? p.valueCoding?.code;
    if (key !== undefined && key !== null && !keys.includes(String(key))) {
      keys.push(String(key));
    }
  }
  return keys;
}

function readParentKey(concept: any, propertyCodes: string[]): string | undefined {
  return readParentKeys(concept, propertyCodes)[0];
}

/**
 * Materialising a DAG as a tree repeats a multi-parent concept under each parent, so the node count
 * can exceed the concept count by a lot. Cap it so a pathological code system cannot freeze the tab.
 */
const MAX_TREE_NODES = 200000;

/**
 * Shared core for the flat-list builders: link concepts to their parents by property reference.
 *
 * A concept is placed under EVERY parent it declares, not just the first — the server exports a flat
 * concept[] precisely because a hierarchy can be a DAG (a lab analyte belongs to many panels), and
 * reading only the first reference would hide every other membership.
 */
function buildFromParentRefs(
  flatConcepts: any[],
  propertyCodes: string[],
  childKey: string,
  synthesizeMissingParents: boolean
): any[] {
  const byCode = new Map<string, any>();
  for (const c of flatConcepts) {
    byCode.set(String(c.code), c);
  }

  const childrenOf = new Map<string, string[]>();
  const synthetic = new Map<string, any>();
  const placed = new Set<string>();
  const rootCodes: string[] = [];

  for (const c of flatConcepts) {
    const code = String(c.code);
    const parents = readParentKeys(c, propertyCodes).filter(pk => pk !== code);
    let attached = false;
    for (const pk of parents) {
      if (!byCode.has(pk)) {
        if (!synthesizeMissingParents) {
          continue;
        }
        // A dangling reference — the parent concept is not in this set, so stand one in. Its display
        // is the best label the child can offer (a plain valueCode carries none), else the raw code.
        if (!synthetic.has(pk)) {
          const prop = (c.property || []).find((x: any) => propertyCodes.includes(x.code) && (x.valueCode ?? x.valueCoding?.code) === pk);
          synthetic.set(pk, {code: pk, display: prop?.valueCoding?.display || pk});
          rootCodes.push(pk);
        }
      }
      childrenOf.set(pk, [...(childrenOf.get(pk) || []), code]);
      placed.add(code);
      attached = true;
    }
    if (!attached) {
      rootCodes.push(code);
    }
  }

  if (!placed.size) {
    return [];
  }

  let budget = MAX_TREE_NODES;
  let truncated = false;
  const nodeFor = (code: string): any => byCode.get(code) ?? synthetic.get(code) ?? {code};
  const materialise = (code: string, ancestors: Set<string>): any => {
    budget--;
    const children = childrenOf.get(code) || [];
    // Stop on a cycle (a concept reachable from itself) or once the node budget is spent.
    if (!children.length || ancestors.has(code) || budget <= 0) {
      truncated = truncated || (children.length > 0 && budget <= 0);
      return {...nodeFor(code), [childKey]: []};
    }
    const nextAncestors = new Set(ancestors).add(code);
    return {...nodeFor(code), [childKey]: children.map(child => materialise(child, nextAncestors))};
  };

  const tree = rootCodes.filter(code => !placed.has(code)).map(code => materialise(code, new Set<string>()));
  if (truncated) {
    console.warn(`CodeSystem hierarchy truncated at ${MAX_TREE_NODES} nodes; use the list view for the complete set.`);
  }
  return tree;
}

/**
 * Attach concepts under parent codes when parent exists in the set (is-a / grouped-by flat links).
 */
export function buildHierarchyByParentRef(
  flatConcepts: any[],
  propertyCodes: string[],
  childKey = 'concept'
): any[] {
  if (!flatConcepts.length) {
    return flatConcepts;
  }
  return buildFromParentRefs(flatConcepts, propertyCodes, childKey, false);
}

/**
 * Build tree by grouping under parent keys — part-of style. Unlike {@link buildHierarchyByParentRef}
 * this stands in a placeholder for a parent that is not in the set, so nothing is dropped; a parent
 * that IS present is used as itself rather than being shadowed by a code-only stub.
 */
export function buildHierarchyBySyntheticParents(
  flatConcepts: any[],
  propertyCodes: string[],
  childKey = 'concept'
): any[] {
  if (!flatConcepts.length) {
    return flatConcepts;
  }
  return buildFromParentRefs(flatConcepts, propertyCodes, childKey, true);
}

/**
 * Apply hierarchy mode to concepts (may already be nested for grouped-by).
 */
export function buildHierarchyForMode(concepts: any[], mode: HierarchyMode, childKey = 'concept'): any[] {
  if (!concepts.length) {
    return concepts;
  }
  if (mode === 'grouped-by') {
    if (hasNestedConcepts(concepts, childKey)) {
      return concepts;
    }
    const codes = getParentPropertyCodes('grouped-by');
    const hasLink = concepts.some(c => readParentKey(c, codes));
    if (hasLink) {
      const tree = buildHierarchyByParentRef(concepts, codes, childKey);
      return tree.length ? tree : concepts.map(c => ({...c, [childKey]: []}));
    }
    return concepts.map(c => ({...c, [childKey]: c[childKey] ? [...c[childKey]] : []}));
  }
  if (mode === 'is-a') {
    const codes = getParentPropertyCodes('is-a');
    if (!concepts.some(c => readParentKey(c, codes))) {
      return concepts.map(c => ({...c, [childKey]: c[childKey] ? [...c[childKey]] : []}));
    }
    const tree = buildHierarchyByParentRef(concepts, codes, childKey);
    return tree.length ? tree : concepts.map(c => ({...c, [childKey]: []}));
  }
  if (mode === 'part-of') {
    const codes = getParentPropertyCodes('part-of');
    if (!concepts.some(c => readParentKey(c, codes))) {
      return concepts.map(c => ({...c, [childKey]: c[childKey] ? [...c[childKey]] : []}));
    }
    if (hasNestedConcepts(concepts, childKey)) {
      return concepts;
    }
    const tree = buildHierarchyBySyntheticParents(concepts, codes, childKey);
    return tree.length ? tree : concepts.map(c => ({...c, [childKey]: []}));
  }
  return concepts;
}
