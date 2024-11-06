import {
    Component,
    EventEmitter,
    Input,
    OnChanges, OnDestroy,
    Output,
    SimpleChanges,
    TemplateRef
} from "@angular/core";
import {SearchResult} from "@kodality-web/core-util";
import {
    TransformationDefinition,
    TransformationDefinitionLibService,
    TransformationDefinitionQueryParams
} from "term-web/modeler/_lib";
import {Subscription} from "rxjs";


@Component({
    selector: 'tw-transformation-definition-widget',
    templateUrl: 'transformation-definition-widget.component.html'
})
export class TransformationDefinitionWidgetComponent implements OnChanges, OnDestroy {

    @Input() public spaceId: number;
    @Input() public packageId: number;
    @Input() public packageVersionId: number;
    @Input() public text: string;

    @Input() public actionsTpl: TemplateRef<any>;
    @Output() public loaded = new EventEmitter<void>();

    private searchSub: Subscription;
    protected searchResult = SearchResult.empty<TransformationDefinition>();
    protected query = new TransformationDefinitionQueryParams();
    protected loading = false;


    public constructor(private transformationDefinitionService: TransformationDefinitionLibService) {
        this.query.limit = 50;
        this.query.summary = true;
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['spaceId'] || changes['packageId'] || changes['packageVersionId'] || changes['text']) {
            this.search();
        }
    }

    public ngOnDestroy(): void {
        this.searchSub?.unsubscribe();
    }

    private search(): void {
        this.searchSub?.unsubscribe();

        if (!this.spaceId && !this.packageId && !this.packageVersionId) {
            this.searchResult = SearchResult.empty();
            return;
        }

        this.loading = true;
        this.searchSub = this.transformationDefinitionService.search({
            ...this.query,
            spaceId: this.spaceId,
            packageId: this.packageId,
            packageVersionId: this.packageVersionId,
            nameContains: this.text
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