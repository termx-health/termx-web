import {Component, OnInit} from '@angular/core';
import {MapSetAssociation} from 'term-web/resources/_lib';
import {MapSetService} from '../../services/map-set-service';
import {ActivatedRoute} from '@angular/router';

@Component({
  templateUrl: './map-set-association-view.component.html',
})
export class MapSetAssociationViewComponent implements OnInit {
  public association?: MapSetAssociation;
  public loading = false;

  public constructor(
    private mapSetService: MapSetService,
    private route: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    const mapSetId = this.route.snapshot.paramMap.get('id');
    const associationId = this.route.snapshot.paramMap.get('associationId');
    this.loadAssociation(mapSetId!, Number(associationId));
  }

  public loadAssociation(mapSetId: string, associationId: number): void {
    this.loading = true;
    this.mapSetService.loadAssociation(mapSetId, associationId).subscribe(a => {
      this.association = a;
    }).add(() => this.loading = false);
  }
}
