import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {LoadingManager} from '@kodality-web/core-util';
import {CodeSystemAssociation, CodeSystemLibService} from 'term-web/resources/_lib';

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
  `]
})
export class CodeSystemConceptReferenceComponent implements OnChanges {
  @Input() public codeSystem: string;
  @Input() public entityVersionId: number;
  protected references: CodeSystemAssociation[];

  protected loader = new LoadingManager();

  public constructor(private codeSystemService: CodeSystemLibService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['codeSystem'] || changes['entityVersionId']) && this.codeSystem && this.entityVersionId) {
      this.loader.wrap('load', this.codeSystemService.loadEntityVersionReferences(this.codeSystem, this.entityVersionId))
          .subscribe(ref => this.references = ref);
    }
  }
}
