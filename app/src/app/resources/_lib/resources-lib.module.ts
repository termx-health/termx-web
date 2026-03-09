import {NgModule} from '@angular/core';
import {AssociationLibModule} from 'term-web/resources/_lib/association';
import {CodeSystemLibModule} from 'term-web/resources/_lib/code-system';

import {DefinedPropertyLibModule} from 'term-web/resources/_lib/defined-property';
import {DesignationLibModule} from 'term-web/resources/_lib/designation';
import {MapSetLibModule} from 'term-web/resources/_lib/map-set';
import {NamingSystemLibModule} from 'term-web/resources/_lib/naming-system';
import {RelatedArtifactLibModule} from 'term-web/resources/_lib/related-artifacts';
import {ValueSetLibModule} from 'term-web/resources/_lib/value-set';

@NgModule({
  declarations: [],
  imports: [
    CodeSystemLibModule,
    MapSetLibModule,
    DesignationLibModule,
    ValueSetLibModule,
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
    NamingSystemLibModule,
    AssociationLibModule,
    RelatedArtifactLibModule,
    DefinedPropertyLibModule,
]
})
export class ResourcesLibModule {
}


