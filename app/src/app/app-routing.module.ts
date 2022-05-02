import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CODE_SYSTEM_ROUTES} from './codesystem/code-system.module';

const routes: Routes = [
  {
    path: '', children: [
      {path: 'code-systems', children: CODE_SYSTEM_ROUTES},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
