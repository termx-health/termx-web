import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@termx-health/core-util';
import {MarinaComponentsModule} from '@termx-health/ui';
import {RelatedArtifactLibService} from 'term-web/resources/_lib/related-artifacts/services/related-artifact-lib.service';

@NgModule({
  imports: [
    MarinaComponentsModule,
    FormsModule,
    CommonModule,
    CoreUtilModule
  ],
  providers: [
    RelatedArtifactLibService
  ],
  declarations: [
  ],
  exports: [
  ]
})

export class RelatedArtifactLibModule {
}
