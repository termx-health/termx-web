import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {UcumLibModule} from 'term-web/ucum/_lib';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {UcumEditComponent} from './containers/edit/ucum-edit.component';
import {UcumViewComponent} from './containers/edit/ucum-view.component';
import {UcumMappingListComponent} from './containers/mapping/ucum-mapping-list.component';
import {UcumListComponent} from './containers/ucum-list.component';
import {UcumService} from './services/ucum.service';


export const UCUM_ROUTES: Routes = [
  {path: '', component: UcumListComponent},
  {path: 'add', data: {privilege: ['ucum.CodeSystem.edit']}, component: UcumEditComponent},
  {path: ':id/edit', data: {privilege: ['ucum.CodeSystem.edit']}, component: UcumEditComponent},
  {path: ':id/view', component: UcumViewComponent},
];

@NgModule({
  declarations: [
    UcumListComponent,
    UcumEditComponent,
    UcumViewComponent,
    UcumMappingListComponent,
  ],
  imports: [
    CoreUiModule,
    UcumLibModule
  ],
  providers: [
    UcumService
  ]
})
export class UcumModule {
}
