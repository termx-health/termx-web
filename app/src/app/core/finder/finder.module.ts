import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreUtilModule} from '@kodality-web/core-util';
import {MarinaUiModule} from '@kodality-health/marina-ui';
import {FinderLoadMoreItemComponent, FinderMenuComponent, FinderMenuItemComponent, FinderWrapperComponent} from './finder.component';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';


const components = [
  FinderWrapperComponent,
  FinderMenuComponent,
  FinderMenuItemComponent,
  FinderLoadMoreItemComponent
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MarinaUiModule,
    CoreUtilModule,
    TranslateModule
  ],
  declarations: [
    ...components
  ],
  exports: [
    ...components
  ]
})
export class FinderModule {
}
