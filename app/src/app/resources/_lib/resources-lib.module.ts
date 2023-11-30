import {NgModule} from '@angular/core';
import {CodeSystemLibModule} from './code-system';
import {DesignationLibModule} from './designation';
import {ValueSetLibModule} from './value-set';
import {MapSetLibModule} from './map-set';
import {ContactLibModule} from './contact';
import {NamingSystemLibModule} from './naming-system';
import {AssociationLibModule} from './association';
import {RelatedArtifactLibModule} from './related-artifacts';
import {DefinedPropertyLibModule} from './defined-property';

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


