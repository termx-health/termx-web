import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Router} from '@angular/router';
import {isDefined, LoadingManager} from '@kodality-web/core-util';
import {RelatedArtifact, RelatedArtifactLibService} from 'app/src/app/resources/_lib/related-artifacts';
import {RelatedArtifactUtil} from 'term-web/resources/_lib/related-artifacts/util/related-artifact-util';

@Component({
  selector: 'tw-resource-related-artifact-widget',
  templateUrl: 'resource-related-artifact-widget.component.html'
})
export class ResourceRelatedArtifactWidgetComponent implements OnChanges {
  @Input() public resourceId: string;
  @Input() public resourceType: 'CodeSystem' | 'ValueSet' | 'MapSet' | 'Concept';

  protected relatedArtifacts: RelatedArtifact[];
  protected loader = new LoadingManager();

  public constructor(private relatedArtifactService: RelatedArtifactLibService, private router: Router) {}

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
