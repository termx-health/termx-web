import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {MapSetVersion} from 'terminology-lib/resources';
import {MapSetService} from '../../services/map-set-service';


@Component({
  selector: 'twa-map-set-versions-list',
  templateUrl: './map-set-versions-list.component.html',
})
export class MapSetVersionsListComponent implements OnChanges {
  @Input() public mapSetId?: string;

  public versions: MapSetVersion[] = [];
  public loading = false;

  public constructor(private mapSetService: MapSetService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["mapSetId"]?.currentValue) {
      this.loadVersions();
    }
  }

  private loadVersions(): void {
    if (!this.mapSetId) {
      return;
    }
    this.loading = true;
    this.mapSetService.loadVersions(this.mapSetId)
      .subscribe(versions => this.versions = versions)
      .add(() => this.loading = false);
  }

  public activateVersion(version: MapSetVersion): void {
    this.loading = true;
    this.mapSetService.activateVersion(version.mapSet!, version.version!).subscribe(() => version.status = 'active').add(() => this.loading = false);
  }

  public retireVersion(version: MapSetVersion): void {
    this.loading = true;
    this.mapSetService.retireVersion(version.mapSet!, version.version!).subscribe(() => version.status = 'retired').add(() => this.loading = false);
  }
}
