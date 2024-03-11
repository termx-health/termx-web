import {NgModule} from '@angular/core';
import {AssociationLibModule} from './association';
import {CodeSystemLibModule} from './code-system';
import {ContactLibModule} from './contact';
import {DefinedPropertyLibModule} from './defined-property';
import {DesignationLibModule} from './designation';
import {MapSetLibModule} from './map-set';
import {NamingSystemLibModule} from './naming-system';
import {RelatedArtifactLibModule} from './related-artifacts';
import {ValueSetLibModule} from './value-set';

@NgModule({
  declarations: [],
  imports: [
    CodeSystemLibModule,
    MapSetLibModule,
    DesignationLibModule,
    ValueSetLibModule,
    ContactLibModule,
    NamingSystemLibModule,
    AssociationLibModule,
    RelatedArtifactLibModule,
    DefinedPropertyLibModule,
  ],
  exports: [
    CodeSystemLibModule,
    MapSetLibModule,
    DesignationLibModule,
    ValueSetLibModule,
    ContactLibModule,
    NamingSystemLibModule,
    AssociationLibModule,
    RelatedArtifactLibModule,
    DefinedPropertyLibModule,
  ]
})
export class ResourcesLibModule {
}


