import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import {LoadingManager} from '@kodality-web/core-util';
import {CodeSystemAssociation, CodeSystemLibService} from 'term-web/resources/_lib';
import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { MuiNoDataModule } from '@kodality-web/marina-ui';
import { LocalizedConceptNamePipe } from 'term-web/resources/_lib/code-system/pipe/localized-concept-name-pipe';

@Component({
    selector: 'tw-cs-concept-reference-list',
    templateUrl: 'code-system-concept-reference.component.html',
    styles: [`
    .col {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      align-self: stretch;
    }
    .row {
      flex: 1;
      display: flex;
      align-items: center;
    }
    .m-subtitle {
      white-space: nowrap;
    }
  `],
    imports: [MuiNoDataModule, AsyncPipe, UpperCasePipe, LocalizedConceptNamePipe]
})
export class CodeSystemConceptReferenceComponent implements OnChanges {
  private codeSystemService = inject(CodeSystemLibService);

  @Input() public codeSystem: string;
  @Input() public entityVersionId: number;
  protected references: CodeSystemAssociation[];

  protected loader = new LoadingManager();

  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['codeSystem'] || changes['entityVersionId']) && this.codeSystem && this.entityVersionId) {
      this.loader.wrap('load', this.codeSystemService.loadEntityVersionReferences(this.codeSystem, this.entityVersionId))
          .subscribe(ref => this.references = ref);
    }
  }
}
