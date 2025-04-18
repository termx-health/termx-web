export type UmlView      = 'Snapshot' | 'Differential';
export type UmlExport    = 'SVG' | 'PNG' | 'Text file';

export class FhirToUmlRequest {
    public payload: string;
    public view: UmlView = 'Snapshot';
    public exportAs: UmlExport = 'SVG';
    public hideRemovedObjects = false;
    public showConstraints   = false;
    public showBindings      = false;
    public reduceSliceClasses = false;
    public hideLegend        = false;
}