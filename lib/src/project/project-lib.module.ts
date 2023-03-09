import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProjectLibService} from './services/project-lib-service';
import {PackageLibService} from './services/package-lib-service';
import {PackageVersionLibService} from './services/package-version-lib-service';
import {ProjectDrawerSearchComponent} from './containers/project-drawer-search.component';
import {SharedModule} from '../../../app/src/app/core/shared/shared.module';
import {ProjectSearchComponent} from './containers/project-search.component';
import {TerminologyServerLibService} from './services/terminology-server-lib-service';
import {PackageResourceLibService} from './services/package-resource-lib-service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
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
