import {NgModule} from '@angular/core';
import {SharedModule} from '../../core/shared/shared.module';
import {Routes} from '@angular/router';
import {ResourcesLibModule} from 'terminology-lib/resources';
import {DevCodeSystemListComponent} from './codesystem/dev-code-system-list.component';
import {CodeSystemModule} from '../codesystem/code-system.module';
import {DevCodeSystemEditComponent} from './codesystem/dev-code-system-edit.component';
import {DevCodeSystemPropertiesComponent} from './codesystem/dev-code-system-properties.component';
import {DevCodeSystemRelationsComponent} from './codesystem/dev-code-system-relations.component';
import {DevCodeSystemConceptListComponent} from './codesystem/dev-code-system-concept-list.component';


export const DEV_RESOURCES_ROUTES: Routes = [
  {path: 'code-systems', component: DevCodeSystemListComponent, data: {privilege: ['*.CodeSystem.view']}},
  {path: 'code-systems/add', component: DevCodeSystemEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: 'code-systems/:id/edit', component: DevCodeSystemEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: 'code-systems/:id/concepts', component: DevCodeSystemConceptListComponent, data: {privilege: ['*.CodeSystem.edit']}}
];

@NgModule({
  imports: [
    SharedModule,
    ResourcesLibModule,
    CodeSystemModule
  ],
  exports: [],
  declarations: [
    DevCodeSystemListComponent,
    DevCodeSystemEditComponent,
    DevCodeSystemRelationsComponent,
    DevCodeSystemPropertiesComponent,
    DevCodeSystemConceptListComponent
  ],
  providers: []
})
export class DevResourcesModule {
}
