import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SpaceLibService} from './services/space-lib-service';
import {PackageLibService} from './services/package-lib-service';
import {PackageVersionLibService} from './services/package-version-lib-service';
import {SpaceDrawerSearchComponent} from './containers/space-drawer-search.component';
import {SpaceSelectComponent} from './containers/space-select.component';
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
    SpaceDrawerSearchComponent,
    SpaceSelectComponent
  ],
  exports: [
    SpaceDrawerSearchComponent,
    SpaceSelectComponent
  ],
  providers: [
    SpaceLibService,
    PackageLibService,
    PackageResourceLibService,
    PackageVersionLibService,
    TerminologyServerLibService
  ]
})
export class SpaceLibModule {
}
