import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import {Router} from '@angular/router';
import {isDefined, LoadingManager} from '@kodality-web/core-util';
import {RelatedArtifact, RelatedArtifactLibService} from 'term-web/resources/_lib/related-artifacts';
import {RelatedArtifactUtil} from 'term-web/resources/_lib/related-artifacts/util/related-artifact-util';

import { MuiNoDataModule, MuiListModule, MuiDividerModule } from '@kodality-web/marina-ui';

@Component({
    selector: 'tw-resource-related-artifact-widget',
    templateUrl: 'resource-related-artifact-widget.component.html',
    imports: [MuiNoDataModule, MuiListModule, MuiDividerModule]
})
export class ResourceRelatedArtifactWidgetComponent implements OnChanges {
  private relatedArtifactService = inject(RelatedArtifactLibService);
  private router = inject(Router);

  @Input() public resourceId: string;
  @Input() public resourceType: 'CodeSystem' | 'ValueSet' | 'MapSet' | 'Concept';

  protected relatedArtifacts: RelatedArtifact[];
  protected loader = new LoadingManager();

  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['resourceId'] || changes['resourceType']) && isDefined(this.resourceId) && isDefined(this.resourceType)) {
      this.loader.wrap('load', this.relatedArtifactService.findRelatedArtifacts(this.resourceType, this.resourceId))
        .subscribe(ra => this.relatedArtifacts = ra);
    }
  }

  public openArtifact(artifact: RelatedArtifact): void {
    this.router.navigate(RelatedArtifactUtil.getCommands(artifact));
  }
}
