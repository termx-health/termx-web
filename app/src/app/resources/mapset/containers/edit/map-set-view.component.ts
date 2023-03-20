import {Component, OnInit} from '@angular/core';
import {MapSet} from '@terminology/core';
import {MapSetService} from '../../services/map-set-service';
import {ActivatedRoute} from '@angular/router';

@Component({
  templateUrl: './map-set-view.component.html',
})
export class MapSetViewComponent implements OnInit {
  public mapSetId?: string | null;
  public mapSet?: MapSet;

  public loading = false;

  public constructor(
    private mapSetService: MapSetService,
    private route: ActivatedRoute,
  ) {}

  public ngOnInit(): void {
    this.mapSetId = this.route.snapshot.paramMap.get('id');
    this.loading = true;
    this.mapSetService.load(this.mapSetId!).subscribe(cs => this.mapSet = cs).add(() => this.loading = false);
  }

}
