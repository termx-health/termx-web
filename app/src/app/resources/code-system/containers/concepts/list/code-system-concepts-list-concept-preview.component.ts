import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { collect, SearchResult, ApplyPipe, KeysPipe, LocalDateTimePipe, SortPipe } from '@kodality-web/core-util';
import {CodeSystemEntityVersion, Designation, EntityProperty} from 'term-web/resources/_lib';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';
import {of} from 'rxjs';
import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { MuiCardModule, MuiDividerModule, MuiIconButtonModule, MuiFormModule, MuiIconModule } from '@kodality-web/marina-ui';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { LocalizedConceptNamePipe } from 'term-web/resources/_lib/code-system/pipe/localized-concept-name-pipe';
import { EntityPropertyNamePipe } from 'term-web/resources/_lib/code-system/pipe/entity-propertye-name-pipe';
import { CodeSystemPropertyValueEditComponent } from 'term-web/resources/code-system/containers/concepts/edit/propertyvalue/code-system-property-value-edit.component';

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
  `],
    imports: [MuiCardModule, MuiDividerModule, StatusTagComponent, MuiIconButtonModule, RouterLink, MuiFormModule, MuiIconModule, FormsModule, AsyncPipe, UpperCasePipe, TranslatePipe, ApplyPipe, KeysPipe, LocalDateTimePipe, SortPipe, LocalizedConceptNamePipe, EntityPropertyNamePipe, CodeSystemPropertyValueEditComponent]
})
export class CodeSystemConceptsListConceptPreviewComponent implements OnChanges {
  private codeSystemService = inject(CodeSystemService);

  @Input() public codeSystemId: string;
  @Input() public version: CodeSystemEntityVersion;
  @Input() public editRoute: any[];


  protected entityProperties: EntityProperty[] = [];


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
