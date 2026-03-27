import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {EcosystemListComponent} from './containers/ecosystem-list.component';
import {EcosystemEditComponent} from './containers/ecosystem-edit.component';
import {EcosystemService} from './services/ecosystem.service';

export const ECOSYSTEM_ROUTES: Routes = [
  {path: '', component: EcosystemListComponent},
  {path: 'add', component: EcosystemEditComponent, data: {privilege: ['*.Space.edit']}},
  {path: ':id/edit', component: EcosystemEditComponent, data: {privilege: ['{id}.Space.edit']}},
];

@NgModule({
  providers: [EcosystemService]
})
export class EcosystemModule {}
