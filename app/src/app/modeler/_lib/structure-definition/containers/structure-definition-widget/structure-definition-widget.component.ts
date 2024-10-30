import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, TemplateRef} from "@angular/core";
import {SearchResult} from "@kodality-web/core-util";
import {
    StructureDefinition,
    StructureDefinitionLibService,
    StructureDefinitionSearchParams
} from "term-web/modeler/_lib";


@Component({
    selector: 'tw-structure-definition-widget',
    templateUrl: 'structure-definition-widget.component.html'
})
export class StructureDefinitionWidgetComponent implements OnChanges {
    @Input() public spaceId: number;
    @Input() public packageId: number;
    @Input() public packageVersionId: number;
    @Input() public text: string;

    @Input() public actionsTpl: TemplateRef<any>;
    @Output() public loaded = new EventEmitter<void>();

    protected searchResult = SearchResult.empty<StructureDefinition>();
    protected query = new StructureDefinitionSearchParams();
    protected loading = false;

    public constructor(private structureDefinitionService: StructureDefinitionLibService) {
        this.query.limit = 50;
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['spaceId'] || changes['packageId'] || changes['packageVersionId']) {
            this.search();
        }
    }

    private search(): void {

        if (!this.spaceId && !this.packageId && !this.packageVersionId) {
            this.searchResult = SearchResult.empty();
            return;
        }

        this.loading = true;
        this.structureDefinitionService.search({
            ...this.query,
            spaceId: this.spaceId,
            packageId: this.packageId,
            packageVersionId: this.packageVersionId,
            textContains: this.text
        }).subscribe(resp => {
            this.searchResult = resp;
            this.loading = false;
            this.loaded.emit();
        });
    }

    protected loadMore(): void {
        this.query.limit += 50;
        this.search();
    }
}