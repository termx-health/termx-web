import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CoreUtilModule} from '@termx-health/core-util';
import {MarinaUiModule} from '@termx-health/ui';
import {TranslateModule} from '@ngx-translate/core';
import {FinderLoadMoreItemComponent, FinderMenuComponent, FinderMenuItemComponent, FinderWrapperComponent} from 'term-web/core/components/finder/finder.component';


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
        TranslateModule,
        ...components
    ],
    exports: [
        ...components
    ]
})
export class FinderModule {
}
