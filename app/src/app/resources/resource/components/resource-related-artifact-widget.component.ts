import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {isDefined, LoadingManager} from '@kodality-web/core-util';
import {Router} from '@angular/router';
import {RelatedArtifact, RelatedArtifactLibService} from 'term-web/resources/_lib/relatedartifacts';
import {RelatedArtifactUtil} from 'term-web/resources/_lib/relatedartifacts/util/related-artifact-util';

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
    if ((changes['resourceId'] || changes['resurceType']) && isDefined(this.resourceId) && isDefined(this.resourceType)) {
      this.loader.wrap('load', this.relatedArtifactService.findRelatedArtifacts(this.resourceType, this.resourceId))
        .subscribe(ra => this.relatedArtifacts = ra);
    }
  }

  public openArtifact(artifact: RelatedArtifact): void {
    this.router.navigate([RelatedArtifactUtil.getUrl(artifact)]);
  }
}
