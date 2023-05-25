import {APP_INITIALIZER, LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {RootRoutingModule} from './root-routing.module';
import {AppComponent} from './app.component';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {HttpBackend, HttpClientModule} from '@angular/common/http';
import {CoreUtilModule} from '@kodality-web/core-util';
import {registerLocaleData} from '@angular/common';
import et from '@angular/common/locales/et';
import lt from '@angular/common/locales/lt';
import {ResourcesModule} from './resources/resources.module';
import {SharedModule} from './core/shared/shared.module';
import {Observable} from 'rxjs';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MultiTranslateHttpLoader} from 'ngx-translate-multi-http-loader';
import {PrivilegesModule} from './privileges/privileges.module';
import {IntegrationModule} from './integration/integration.module';
import {GlobalSearchModule} from './global-search/global-search.module';
import {ThesaurusModule} from './thesaurus/thesaurus.module';
import {FhirModule} from './fhir/fhir.module';
import {ToolsModule} from './tools/tools.module';
import {MeasurementUnitModule} from './measurement-unit/measurement-unit.module';
import {ProjectModule} from './project/project.module';
import {JobLibModule} from './job/_lib';
import {AuthModule, AuthService} from './core/auth';
import {MarinaUiConfigModule} from './core/marina';
import {ObservationDefinitionModule} from 'term-web/observation-definition/observation-definition.module';
import {TableModule} from 'term-web/core/ui/table-container/table.module';
import {SequenceModule} from 'term-web/sequence/sequence.module';
import {TaskflowModule} from 'term-web/taskflow/taskflow.module';
import {RootComponent} from 'term-web/root.component';
import {NoPrivilegeComponent} from 'term-web/core/ui/no-privilege/no-privilege.component';

registerLocaleData(et);
registerLocaleData(lt);


export function HttpLoaderFactory(http: HttpBackend): TranslateLoader {
  return new MultiTranslateHttpLoader(http, ['/assets/i18n/']);
}

export function preloadAuth(authService: AuthService): () => Observable<any> {
  return () => authService.refresh();
}


@NgModule({
  declarations: [
    AppComponent,
    RootComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,

    RootRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpBackend]
      }
    }),

    AuthModule.init(),
    MarinaUiConfigModule.init(),
    CoreUtilModule,

    SharedModule,
    TableModule,
    NoPrivilegeComponent,

    ResourcesModule,
    IntegrationModule,
    JobLibModule,
    PrivilegesModule,
    GlobalSearchModule,
    ThesaurusModule,
    TaskflowModule,
    FhirModule,
    ObservationDefinitionModule,
    ToolsModule,
    MeasurementUnitModule,
    ProjectModule,
    SequenceModule
  ],
  providers: [
    {provide: LOCALE_ID, useValue: 'en'},
    {provide: APP_INITIALIZER, useFactory: preloadAuth, deps: [AuthService], multi: true}
  ],
  bootstrap: [
    RootComponent
  ]
})
export class RootModule {
  public constructor(translate: TranslateService,) {
    translate.use(localStorage.getItem('locale') ?? 'en');
    translate.onLangChange.subscribe(({lang}) => localStorage.setItem('locale', lang));
  }
}