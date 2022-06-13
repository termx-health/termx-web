import {Component, OnInit} from '@angular/core';
import {MapSetVersion} from 'terminology-lib/resources';
import {ActivatedRoute} from '@angular/router';
import {MapSetService} from '../../services/map-set-service';
import {Location} from '@angular/common';


@Component({
  templateUrl: './map-set-version-view.component.html',
})
export class MapSetVersionViewComponent implements OnInit {
  public version?: MapSetVersion;
  public loading = false;

  public constructor(
    private mapSetService: MapSetService,
    private route: ActivatedRoute,
    private location: Location,
  ) {}

  public ngOnInit(): void {
    const mapSetId = this.route.snapshot.paramMap.get('id');
    const mapSetVersion = this.route.snapshot.paramMap.get('version');
    this.loadVersion(mapSetId!, mapSetVersion!);
  }

  private loadVersion(id: string, version: string): void {
    this.loading = true;
    this.mapSetService.loadVersion(id, version).subscribe(v => this.version = v).add(() => this.loading = false);
  }

  public back(): void {
    this.location.back();
  }
}
