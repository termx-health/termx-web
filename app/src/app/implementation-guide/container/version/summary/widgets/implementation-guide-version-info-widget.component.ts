import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {compareDates, isDefined, LoadingManager} from '@kodality-web/core-util';
import {Provenance} from 'term-web/sys/_lib';
import {ImplementationGuide, ImplementationGuideVersion, ImplementationGuideVersionDependsOn} from 'term-web/implementation-guide/_lib';
import {ImplementationGuideService} from 'term-web/implementation-guide/services/implementation-guide.service';

@Component({
  selector: 'tw-implementation-guide-version-info-widget',
  templateUrl: 'implementation-guide-version-info-widget.component.html'
})
export class ImplementationGuideVersionInfoWidgetComponent implements OnChanges {
  @Input() public ig: ImplementationGuide;
  @Input() public version: ImplementationGuideVersion;

  protected provenances: Provenance[];

  protected loader = new LoadingManager();

  public constructor(private igService: ImplementationGuideService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['version'] && this.version) {
      this.loader.wrap('provenance', this.igService.loadProvenances(this.version.implementationGuide, this.version.version))
        .subscribe(resp => this.provenances = resp);
    }
  }

  protected changeVersionStatus(status: 'draft' | 'active' | 'retired'): void {
    this.igService.changeVersionStatus(this.version.implementationGuide, this.version.version, status).subscribe(() => this.version.status = status);
  }

  protected getLastProvenance = (provenances: Provenance[], activity: string): Provenance => {
    return provenances?.filter(p => p.activity === activity).sort((p1, p2) => compareDates(new Date(p2.date), new Date(p1.date)))?.[0];
  };

  protected mapDependsOn = (dependsOn: ImplementationGuideVersionDependsOn): string => [dependsOn.packageId, dependsOn.version].filter(i => isDefined(i)).join(': ');

}
