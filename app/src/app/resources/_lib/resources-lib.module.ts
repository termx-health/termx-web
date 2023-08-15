import {NgModule} from '@angular/core';
import {CodeSystemLibModule} from './codesystem';
import {DesignationLibModule} from './designation';
import {ValueSetLibModule} from './valueset';
import {MapSetLibModule} from './mapset';
import {ContactLibModule} from './contact';
import {NamingSystemLibModule} from './namingsystem';
import {AssociationLibModule} from './association';
import {RelatedArtifactLibModule} from 'term-web/resources/_lib/relatedartifacts/related-artifact-lib.module';
import {DefinedEntityPropertyLibModule} from 'term-web/resources/_lib/definedentityproperty';

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
    DefinedEntityPropertyLibModule
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
    DefinedEntityPropertyLibModule
  ]
})
export class ResourcesLibModule {
}


