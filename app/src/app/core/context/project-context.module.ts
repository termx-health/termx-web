import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MarinaUiModule} from '@kodality-web/marina-ui';
import {CommonModule} from '@angular/common';
import {CoreUtilModule} from '@kodality-web/core-util';
import {TranslateModule} from '@ngx-translate/core';
import {MarinaUtilModule} from '@kodality-web/marina-util';
import {ProjectContextComponent} from './project-context.component';
import {ProjectLibModule} from 'term-web/project/_lib';
import {ProjectModule} from 'term-web/project/project.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,

    MarinaUiModule,
    MarinaUtilModule,
    CoreUtilModule,

    ProjectModule,
    ProjectLibModule
  ],
  declarations: [
    ProjectContextComponent
  ],
  exports: [
    ProjectContextComponent
  ]
})
export class ProjectContextModule {
}
