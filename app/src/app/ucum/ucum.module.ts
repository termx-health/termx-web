import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {UcumLibModule} from 'term-web/ucum/_lib';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {UcumViewComponent} from './containers/edit/ucum-view.component';
import {UcumMappingListComponent} from './containers/mapping/ucum-mapping-list.component';
import {UcumListComponent} from './containers/ucum-list.component';
import {UcumService} from './services/ucum.service';


export const UCUM_ROUTES: Routes = [
  {path: '', component: UcumListComponent},
  {path: ':code/view', component: UcumViewComponent},
];

@NgModule({
  declarations: [
    UcumListComponent,
    UcumViewComponent,
    UcumMappingListComponent,
  ],
  imports: [
    CoreUiModule,
    UcumLibModule,
  ],
  providers: [
    UcumService
  ]
})
export class UcumModule {}
