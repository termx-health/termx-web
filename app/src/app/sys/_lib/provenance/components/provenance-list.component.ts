import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {LoadingManager} from '@kodality-web/core-util';
import {Provenance, ProvenanceLibService} from 'term-web/sys/_lib';

@Component({
  selector: 'tw-provenance-list',
  templateUrl: './provenance-list.component.html',
  styles:  [`
    .diff {
      line-height: 27px;
    }
    .diff-value {
      border: 1px solid #d2d2d2;
      border-radius: 4px;
      padding: 3px;
      background-color: #f7f7f7;
    }
    .diff-icon{
      margin: 5px; 
    }
  `]
})
export class ProvenanceListComponent implements OnChanges {
  @Input() public targetType?: string;
  @Input() public targetId?: string;
  @Input() public provenances?: Provenance[];

  protected loader = new LoadingManager();

  public constructor(private provenanceService: ProvenanceLibService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['targetType'] || changes['targetId']) && this.targetType && this.targetId) {
      this.loadProvenances(this.targetType, this.targetId);
    }
  }

  private loadProvenances(targetType: string, targetId: string): void {
    this.loader.wrap('load', this.provenanceService.query(targetType + '|' + targetId))
      .subscribe(provenances => this.provenances = provenances);
  }
}
