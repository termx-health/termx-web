export type UmlView      = 'Snapshot' | 'Differential';
export type UmlExport    = 'SVG' | 'PNG' | 'Text file';

export class FhirToUmlRequest {
    public payload: string;
    public view: UmlView = 'Differential';
    public exportAs: UmlExport = 'SVG';
    public attachmentFilename = 'output';
    public hideRemovedObjects = true;
    public showConstraints   = false;
    public showBindings      = false;
    public reduceSliceClasses = false;
    public hideLegend        = false;
}