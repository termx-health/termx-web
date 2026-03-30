import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@termx-health/core-util';
import {MarinaComponentsModule} from '@termx-health/ui';
import {AssociationTypeSearchComponent} from 'term-web/resources/_lib/association/containers/association-type-search.component';
import {AssociationTypeLibService} from 'term-web/resources/_lib/association/services/association-type-lib.service';

@NgModule({
    imports: [
        MarinaComponentsModule,
        FormsModule,
        CommonModule,
        CoreUtilModule,
        AssociationTypeSearchComponent
    ],
    providers: [
        AssociationTypeLibService,
    ],
    exports: [
        AssociationTypeSearchComponent,
    ]
})
export class AssociationLibModule {
}
