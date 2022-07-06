import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {MapSetService} from '../../services/map-set-service';
import {collect} from '@kodality-web/core-util';
import {MapSetAssociation} from 'terminology-lib/resources';

@Component({
  selector: 'twa-map-set-association-list',
  templateUrl: './map-set-association-list.component.html',
})
export class MapSetAssociationListComponent implements OnChanges {
  @Input() public mapSetId?: string;

  public data: {[id: string]: MapSetAssociation[]} = {};
  public loading: boolean = false;

  public constructor(private mapSetService: MapSetService) { }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['mapSetId']) {
      this.loadAssociations();
    }
  }

  public loadAssociations(): void {
    this.loading = true;
    this.mapSetService.searchAssociations(this.mapSetId!)
      .subscribe(a => this.data = collect(a.data, a => a.source?.codeSystem!))
      .add(() => this.loading = false);
  }

}
