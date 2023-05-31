import {NgModule} from '@angular/core';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {Routes} from '@angular/router';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {DevCodeSystemListComponent} from './codesystem/dev-code-system-list.component';
import {CodeSystemModule} from '../code-system/code-system.module';
import {MapSetModule} from '../map-set/map-set.module';
import {DevCodeSystemEditComponent} from './codesystem/dev-code-system-edit.component';
import {DevCodeSystemRelationsComponent} from './codesystem/dev-code-system-relations.component';
import {DevCodeSystemConceptListComponent} from './codesystem/dev-code-system-concept-list.component';
import {DevMapSetListComponent} from './mapset/dev-map-set-list.component';
import {DevMapSetEditComponent} from './mapset/dev-map-set-edit.component';
import {DevMapSetConceptListComponent} from './mapset/dev-map-set-concept-list.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {DevMapSetUnmappedConceptListComponent} from './mapset/dev-map-set-unmapped-concept-list.component';


export const DEV_RESOURCES_ROUTES: Routes = [
  {path: 'code-systems', component: DevCodeSystemListComponent, data: {privilege: ['*.CodeSystem.view']}},
  {path: 'code-systems/add', component: DevCodeSystemEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: 'code-systems/:id/edit', component: DevCodeSystemEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: 'code-systems/:id/concepts', component: DevCodeSystemConceptListComponent, data: {privilege: ['*.CodeSystem.edit']}},

  {path: 'map-sets', component: DevMapSetListComponent, data: {privilege: ['*.MapSet.view']}},
  {path: 'map-sets/add', component: DevMapSetEditComponent, data: {privilege: ['*.MapSet.edit']}},
  {path: 'map-sets/:id/edit', component: DevMapSetEditComponent, data: {privilege: ['*.MapSet.edit']}},
  {path: 'map-sets/:id/concepts', component: DevMapSetConceptListComponent, data: {privilege: ['*.MapSet.edit']}},

];

@NgModule({
  imports: [
    CoreUiModule,
    ResourcesLibModule,
    CodeSystemModule,
    MapSetModule,
    DragDropModule
  ],
  exports: [],
  declarations: [
    DevCodeSystemListComponent,
    DevCodeSystemEditComponent,
    DevCodeSystemRelationsComponent,
    DevCodeSystemConceptListComponent,

    DevMapSetListComponent,
    DevMapSetEditComponent,
    DevMapSetConceptListComponent,
    DevMapSetUnmappedConceptListComponent
  ],
  providers: []
})
export class DevResourcesModule {
}
