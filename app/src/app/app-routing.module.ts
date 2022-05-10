import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CODE_SYSTEM_ROUTES} from './codesystem/code-system.module';
import {VALUE_SET_ROUTES} from './valueset/value-set.module';

const routes: Routes = [
  {
    path: '', children: [
      {path: 'code-systems', children: CODE_SYSTEM_ROUTES},
      {path: 'value-sets', children: VALUE_SET_ROUTES}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
