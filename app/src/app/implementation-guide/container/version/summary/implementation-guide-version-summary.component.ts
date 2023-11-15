import {Component, OnInit, ViewChild} from '@angular/core';
import {LoadingManager} from '@kodality-web/core-util';
import {ActivatedRoute} from '@angular/router';
import {forkJoin} from 'rxjs';
import {ImplementationGuide, ImplementationGuideVersion} from 'term-web/implementation-guide/_lib';
import {ImplementationGuideService} from 'term-web/implementation-guide/services/implementation-guide.service';
import {ImplementationGuideGroupListComponent} from 'term-web/implementation-guide/container/version/summary/widgets/implementation-guide-group-list.component';
import {
  ImplementationGuideResourceListComponent
} from 'term-web/implementation-guide/container/version/summary/widgets/implementation-guide-resource-list.component';

@Component({
  templateUrl: 'implementation-guide-version-summary.component.html'
})
export class ImplementationGuideVersionSummaryComponent implements OnInit {
  protected ig?: ImplementationGuide;
  protected igVersion?: ImplementationGuideVersion;
  protected loader = new LoadingManager();

  protected groupsChanged: boolean;
  @ViewChild(ImplementationGuideGroupListComponent) public groupListComponent?: ImplementationGuideGroupListComponent;
  protected resourcesChanged: boolean;
  @ViewChild(ImplementationGuideResourceListComponent) public resourceListComponent?: ImplementationGuideResourceListComponent;

  public constructor(
    private route: ActivatedRoute,
    private igService: ImplementationGuideService
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const versionCode = this.route.snapshot.paramMap.get('versionCode');
    this.loadData(id, versionCode);
  }

  private loadData(ig: string, versionCode: string): void {
    this.loader.wrap('load',
      forkJoin([this.igService.load(ig), this.igService.loadVersion(ig, versionCode)])
    ).subscribe(([ig, igv]) => {
      this.ig = ig;
      this.igVersion = igv;
    });
  }

  public saveGroups(): void {
    if (!this.groupListComponent.validate()){
      return;
    }
    this.loader.wrap('save', this.igService.saveVersionGroups(this.ig.id, this.igVersion.version, this.groupListComponent.groups))
      .subscribe(() => this.loadData(this.ig.id, this.igVersion.version));
  }

  public saveResources(): void {
    if (!this.groupListComponent.validate()){
      return;
    }
    this.loader.wrap('save', this.igService.saveVersionResource(this.ig.id, this.igVersion.version, this.resourceListComponent.resources))
      .subscribe(() => this.resourceListComponent.loadData(this.ig.id, this.igVersion.version));
  }
}
