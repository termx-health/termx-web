import {NgModule} from '@angular/core';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {CoreUtilModule} from '@kodality-web/core-util';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {RelatedArtifactLibService} from 'term-web/resources/_lib/relatedartifacts/services/related-artifact-lib.service';

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
