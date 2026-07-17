import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import {Router} from '@angular/router';
import {isDefined, LoadingManager} from '@termx-health/core-util';
import {MuiNoDataModule, MuiListModule, MuiDividerModule, MuiIconModule, MuiTooltipModule} from '@termx-health/ui';
import {RelatedArtifact, RelatedArtifactLibService} from 'term-web/resources/_lib/related-artifacts';
import {RelatedArtifactUtil} from 'term-web/resources/_lib/related-artifacts/util/related-artifact-util';

@Component({
    selector: 'tw-resource-related-artifact-widget',
    templateUrl: 'resource-related-artifact-widget.component.html',
    imports: [MuiNoDataModule, MuiListModule, MuiDividerModule, MuiIconModule, MuiTooltipModule]
})
export class ResourceRelatedArtifactWidgetComponent implements OnChanges {
  private relatedArtifactService = inject(RelatedArtifactLibService);
  private router = inject(Router);

  @Input() public resourceId: string;
  @Input() public resourceType: 'CodeSystem' | 'ValueSet' | 'MapSet' | 'Concept' | 'StructureDefinition';
  // Artifact types to hide, e.g. when another widget on the same page already surfaces them
  // (the code system summary shows value sets in its dedicated impacts widget).
  @Input() public excludeTypes?: RelatedArtifact['type'][];

  protected relatedArtifacts: RelatedArtifact[];
  protected loader = new LoadingManager();
  private allArtifacts: RelatedArtifact[];

  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['resourceId'] || changes['resourceType']) && isDefined(this.resourceId) && isDefined(this.resourceType)) {
      this.loadArtifacts();
    } else if (changes['excludeTypes']) {
      this.applyExclusions();
    }
  }

  public loadArtifacts(): void {
    this.loader.wrap('load', this.relatedArtifactService.findRelatedArtifacts(this.resourceType, this.resourceId))
      .subscribe(ra => {
        this.allArtifacts = ra;
        this.applyExclusions();
      });
  }

  private applyExclusions(): void {
    const exclude = this.excludeTypes ?? [];
    this.relatedArtifacts = (this.allArtifacts ?? []).filter(a => !exclude.includes(a.type));
  }

  public openArtifact(artifact: RelatedArtifact): void {
    if (artifact.resolved === false) {
      return;
    }
    this.router.navigate(RelatedArtifactUtil.getCommands(artifact));
  }
}
