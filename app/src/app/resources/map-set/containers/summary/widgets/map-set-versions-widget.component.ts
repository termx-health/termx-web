import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MapSetVersion} from 'app/src/app/resources/_lib';
import {Router} from '@angular/router';
import {LoadingManager} from '@kodality-web/core-util';
import {MapSetService} from 'term-web/resources/map-set/services/map-set-service';

@Component({
  selector: 'tw-map-set-versions-widget',
  templateUrl: 'map-set-versions-widget.component.html'
})
export class MapSetVersionsWidgetComponent {
  @Input() public mapSet: string;
  @Input() public versions: MapSetVersion[];
  @Output() public versionsChanged: EventEmitter<void> = new EventEmitter();

  protected loader = new LoadingManager();

  public constructor(private router: Router, private mapSetService: MapSetService) {}

  protected openVersionSummary(version: string): void {
    this.router.navigate(['/resources/map-sets', this.mapSet, 'versions', version, 'summary']);
  }

  protected deleteVersion(version: string): void {
    if (!version) {
      return;
    }
    this.mapSetService.deleteMapSetVersion(this.mapSet, version).subscribe(() => this.versionsChanged.emit());
  }
}
