import {NgModule} from '@angular/core';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {Routes} from '@angular/router';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {CodeSystemModule} from '../code-system/code-system.module';
import {MapSetModule} from '../map-set/map-set.module';
import {DevMapSetListComponent} from './mapset/dev-map-set-list.component';
import {DevMapSetEditComponent} from './mapset/dev-map-set-edit.component';
import {DevMapSetConceptListComponent} from './mapset/dev-map-set-concept-list.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {DevMapSetUnmappedConceptListComponent} from './mapset/dev-map-set-unmapped-concept-list.component';


export const DEV_RESOURCES_ROUTES: Routes = [
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
    DevMapSetListComponent,
    DevMapSetEditComponent,
    DevMapSetConceptListComponent,
    DevMapSetUnmappedConceptListComponent
  ],
  providers: []
})
export class DevResourcesModule {
}
