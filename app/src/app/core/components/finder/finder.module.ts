import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CoreUtilModule} from '@kodality-web/core-util';
import {MarinaUiModule} from '@kodality-web/marina-ui';
import {TranslateModule} from '@ngx-translate/core';
import {FinderLoadMoreItemComponent, FinderMenuComponent, FinderMenuItemComponent, FinderWrapperComponent} from './finder.component';


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
