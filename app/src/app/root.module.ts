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
import {CoreUiModule} from './core/ui/core-ui.module';
import {Observable} from 'rxjs';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MultiTranslateHttpLoader} from 'ngx-translate-multi-http-loader';
import {PrivilegesModule} from './privileges/privileges.module';
import {IntegrationModule} from './integration/integration.module';
import {GlobalSearchModule} from './global-search/global-search.module';
import {ThesaurusModule} from './thesaurus/thesaurus.module';
import {FhirModule} from './fhir/fhir.module';
import {MeasurementUnitModule} from './measurement-unit/measurement-unit.module';
import {SpaceModule} from './space/space.module';
import {AuthModule, AuthService} from './core/auth';
import {MarinaUiConfigModule} from './core/marina';
import {ObservationDefinitionModule} from 'term-web/observation-definition/observation-definition.module';
import {SequenceModule} from 'term-web/sequence/sequence.module';
import {TaskflowModule} from 'term-web/taskflow/taskflow.module';
import {RootComponent} from 'term-web/root.component';
import {NoPrivilegeComponent} from 'term-web/core/components/no-privilege/no-privilege.component';
import {SysModule} from 'term-web/sys/sys.module';
import {TerminologyServiceApiModule} from 'term-web/terminology-service-api/terminology-service-api.module';
import {PreferencesService} from 'term-web/core/preferences/preferences.service';

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

    CoreUiModule,
    NoPrivilegeComponent,

    ResourcesModule,
    IntegrationModule,
    PrivilegesModule,
    GlobalSearchModule,
    ThesaurusModule,
    TaskflowModule,
    FhirModule,
    ObservationDefinitionModule,
    TerminologyServiceApiModule,
    MeasurementUnitModule,
    SpaceModule,
    SysModule,
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
  public constructor(preferences: PreferencesService, translate: TranslateService) {
    translate.use(preferences.lang);
    translate.onLangChange.subscribe(({lang}) => preferences.setLang(lang));
  }
}
