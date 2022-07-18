import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {MapSetVersion} from 'terminology-lib/resources';
import {MapSetService} from '../../services/map-set-service';
import {BooleanInput} from '@kodality-web/core-util';


@Component({
  selector: 'twa-map-set-versions-list',
  templateUrl: './map-set-versions-list.component.html',
})
export class MapSetVersionsListComponent implements OnChanges {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
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
    this.mapSetService.searchVersions(this.mapSetId, {limit: -1})
      .subscribe(versions => this.versions = versions.data)
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
