import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CoreUtilModule} from '@kodality-web/core-util';
import {MarinaUiModule} from '@kodality-web/marina-ui';
import {MarinaUtilModule} from '@kodality-web/marina-util';
import {TranslateModule} from '@ngx-translate/core';
import {AuthModule} from 'term-web/core/auth';
import {SpaceLibModule} from 'term-web/space/_lib';
import {SpaceModule} from 'term-web/space/space.module';
import {SpaceContextComponent} from './space-context.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,

    MarinaUiModule,
    MarinaUtilModule,
    CoreUtilModule,

    SpaceModule,
    SpaceLibModule,
    AuthModule
  ],
  declarations: [
    SpaceContextComponent
  ],
  exports: [
    SpaceContextComponent
  ]
})
export class SpaceContextModule {
}
