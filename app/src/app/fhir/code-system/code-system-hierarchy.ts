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

function readParentKey(concept: any, propertyCodes: string[]): string | undefined {
  const prop = concept.property?.find((p: any) => propertyCodes.includes(p.code));
  if (!prop) {
    return undefined;
  }
  return prop.valueCode ?? prop.valueCoding?.code;
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
  const nodes = flatConcepts.map(c => ({...c, [childKey]: [] as any[]}));
  const byCode = new Map(nodes.map(n => [String(n.code), n]));
  const isChild = new Set<string>();

  for (const n of nodes) {
    const pk = readParentKey(n, propertyCodes);
    if (pk && byCode.has(String(pk)) && String(pk) !== String(n.code)) {
      byCode.get(String(pk))![childKey].push(n);
      isChild.add(String(n.code));
    }
  }

  return nodes.filter(n => !isChild.has(String(n.code)));
}

/**
 * Build tree by grouping under parent keys (synthetic parents when parent concept missing) — part-of style.
 */
export function buildHierarchyBySyntheticParents(
  flatConcepts: any[],
  propertyCodes: string[],
  childKey = 'concept'
): any[] {
  const groupMap = new Map<string, any[]>();
  const roots: any[] = [];

  for (const concept of flatConcepts) {
    const pk = readParentKey(concept, propertyCodes);
    if (pk) {
      if (!groupMap.has(pk)) {
        groupMap.set(pk, []);
      }
      groupMap.get(pk)!.push({...concept, [childKey]: []});
    } else {
      roots.push({...concept, [childKey]: []});
    }
  }

  groupMap.forEach((children, groupKey) => {
    const first = children[0];
    const prop = first.property?.find((p: any) => propertyCodes.includes(p.code));
    const display = prop?.valueCoding?.display || groupKey;
    roots.push({
      code: groupKey,
      display,
      [childKey]: children
    });
  });

  return roots;
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
    return buildHierarchyBySyntheticParents(concepts, codes, childKey);
  }
  return concepts;
}
