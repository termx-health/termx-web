import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {LoadingManager} from '@kodality-web/core-util';
import {Provenance, ProvenanceLibService} from '../../_lib';

@Component({
  selector: 'tw-provenance-list',
  templateUrl: './provenance-list.component.html'
})
export class ProvenanceListComponent implements OnChanges {
  @Input() public targetType?: string;
  @Input() public targetId?: string;

  protected provenances?: Provenance[];
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
