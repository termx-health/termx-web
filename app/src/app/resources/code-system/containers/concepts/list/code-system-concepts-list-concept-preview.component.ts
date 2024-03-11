import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {collect, SearchResult} from '@kodality-web/core-util';
import {CodeSystemEntityVersion, Designation, EntityProperty} from 'app/src/app/resources/_lib';
import {CodeSystemService} from 'app/src/app/resources/code-system/services/code-system.service';
import {of} from 'rxjs';

@Component({
  selector: 'tw-code-system-concepts-list-concept-preview',
  templateUrl: 'code-system-concepts-list-concept-preview.component.html',
  styles: [`
    .italic {
      font-style: italic;
    }

    .title {
      font-weight: bold;
      margin-bottom: 0.3rem;
    }


    .col {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .two-col {
      display: grid;
      grid-template-columns: auto 1fr;
      column-gap: 1rem
    }


    .offset {
      margin-left: 1rem
    }

    .m-subtitle {
      margin-block: 0.5rem;
    }
  `]
})
export class CodeSystemConceptsListConceptPreviewComponent implements OnChanges {
  @Input() public codeSystemId: string;
  @Input() public version: CodeSystemEntityVersion;
  @Input() public editRoute: any[];


  protected entityProperties: EntityProperty[] = [];


  public constructor(
    private codeSystemService: CodeSystemService
  ) {}


  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['codeSystemId']) {
      const req$ = this.codeSystemId
        ? this.codeSystemService.searchProperties(this.codeSystemId, {limit: -1, sort: 'order-number'})
        : of(SearchResult.empty());

      req$.subscribe(resp => {
        this.entityProperties = resp.data;
      });
    }
  }

  protected collectDesignations = (designations: Designation[]): {[dType: string]: Designation[]} => {
    return collect(designations, d => d.designationType);
  };

  protected getProperty = (prop: string, props: EntityProperty[]): EntityProperty => {
    return props?.find(p => p.name === prop);
  };
}
