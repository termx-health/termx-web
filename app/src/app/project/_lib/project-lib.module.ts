import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProjectLibService} from './services/project-lib-service';
import {PackageLibService} from './services/package-lib-service';
import {PackageVersionLibService} from './services/package-version-lib-service';
import {ProjectDrawerSearchComponent} from './containers/project-drawer-search.component';
import {ProjectSearchComponent} from './containers/project-search.component';
import {TerminologyServerLibService} from './services/terminology-server-lib-service';
import {PackageResourceLibService} from './services/package-resource-lib-service';
import {FormsModule} from '@angular/forms';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {MarinaUtilModule} from '@kodality-web/marina-util';
import {CoreUtilModule} from '@kodality-web/core-util';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MarinaComponentsModule,
    MarinaUtilModule,
    CoreUtilModule,
    TranslateModule
  ],
  declarations: [
    ProjectDrawerSearchComponent,
    ProjectSearchComponent
  ],
  exports: [
    ProjectDrawerSearchComponent,
    ProjectSearchComponent
  ],
  providers: [
    ProjectLibService,
    PackageLibService,
    PackageResourceLibService,
    PackageVersionLibService,
    TerminologyServerLibService
  ]
})
export class ProjectLibModule {
}
