import {
  buildHierarchyForMode,
  getParentPropertyCodes,
  readParentKeys,
  resolveHierarchyModeFromCodeSystem,
} from './code-system-hierarchy';

/**
 * The server exports concept[] as a FLAT list with parent references, because a hierarchy can be a
 * DAG and FHIR's nested concept[] can only express a tree (repeating a code per parent breaks CSD-1).
 * These cover the client side of that contract.
 */
describe('code-system-hierarchy', () => {
  const partOf = (...codes: string[]): any[] => codes.map(c => ({code: 'partOf', valueCode: c}));

  // One analyte in two panels — the shape that used to be emitted twice.
  const polyhierarchy = [
    {code: 'PANEL-LIPID', display: 'Lipid panel'},
    {code: 'PANEL-METAB', display: 'Metabolic panel'},
    {code: '2093-3', display: 'Cholesterol', property: partOf('PANEL-LIPID')},
    {code: '2345-7', display: 'Glucose', property: partOf('PANEL-LIPID', 'PANEL-METAB')},
  ];

  it('reads every parent a concept declares, not just the first', () => {
    expect(readParentKeys(polyhierarchy[3], getParentPropertyCodes('part-of'))).toEqual(['PANEL-LIPID', 'PANEL-METAB']);
    expect(readParentKeys(polyhierarchy[0], getParentPropertyCodes('part-of'))).toEqual([]);
  });

  it('places a multi-parent concept under each of its parents', () => {
    const tree = buildHierarchyForMode([...polyhierarchy], 'part-of');

    expect(tree.map(n => n.code).sort()).toEqual(['PANEL-LIPID', 'PANEL-METAB']);
    expect(tree.find(n => n.code === 'PANEL-LIPID').concept.map((c: any) => c.code).sort()).toEqual(['2093-3', '2345-7']);
    expect(tree.find(n => n.code === 'PANEL-METAB').concept.map((c: any) => c.code)).toEqual(['2345-7']);
  });

  it('uses the real parent concept rather than a code-only stub', () => {
    const tree = buildHierarchyForMode([...polyhierarchy], 'part-of');

    // A stub would carry the bare code as its display and leave the real panel as a second root.
    expect(tree.find(n => n.code === 'PANEL-LIPID').display).toBe('Lipid panel');
    expect(tree.length).toBe(2);
  });

  it('stands in a placeholder only for a parent that is absent from the set', () => {
    const tree = buildHierarchyForMode(
      [{code: '2345-7', display: 'Glucose', property: partOf('PANEL-MISSING')}],
      'part-of'
    );

    expect(tree.map(n => n.code)).toEqual(['PANEL-MISSING']);
    expect(tree[0].concept.map((c: any) => c.code)).toEqual(['2345-7']);
  });

  it('terminates on a cycle instead of recursing forever', () => {
    const tree = buildHierarchyForMode(
      [
        {code: 'a', property: [{code: 'is-a', valueCode: 'b'}]},
        {code: 'b', property: [{code: 'is-a', valueCode: 'a'}]},
      ],
      'is-a'
    );

    expect(tree).toBeDefined();
  });

  it('resolves the mode from hierarchyMeaning even when concepts are flat', () => {
    expect(resolveHierarchyModeFromCodeSystem({hierarchyMeaning: 'part-of', concept: polyhierarchy})).toBe('part-of');
  });
});
