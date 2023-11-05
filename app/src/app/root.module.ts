import {APP_INITIALIZER, LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {RootRoutingModule} from 'term-web/root-routing.module';
import {AppComponent} from 'term-web/app.component';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {HTTP_INTERCEPTORS, HttpBackend, HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CoreUtilModule} from '@kodality-web/core-util';
import {registerLocaleData} from '@angular/common';
import de from '@angular/common/locales/de';
import et from '@angular/common/locales/et';
import fr from '@angular/common/locales/fr';
import lt from '@angular/common/locales/lt';
import nl from '@angular/common/locales/nl';
import {MultiTranslateHttpLoader} from 'ngx-translate-multi-http-loader';
import {Observable} from 'rxjs';
import {ResourcesModule} from 'term-web/resources/resources.module';
import {CoreUiModule} from 'term-web/core/ui/core-ui.module';
import {PrivilegesModule} from 'term-web/privileges/privileges.module';
import {IntegrationModule} from 'term-web/integration/integration.module';
import {GlobalSearchModule} from 'term-web/global-search/global-search.module';
import {WikiModule} from 'term-web/wiki/wiki.module';
import {FhirModule} from 'term-web/fhir/fhir.module';
import {MeasurementUnitModule} from 'term-web/measurement-unit/measurement-unit.module';
import {SpaceModule} from 'term-web/space/space.module';
import {AuthModule, AuthService} from 'term-web/core/auth';
import {MarinaUiConfigModule} from 'term-web/core/marina';
import {ObservationDefinitionModule} from 'term-web/observation-definition/observation-definition.module';
import {SequenceModule} from 'term-web/sequence/sequence.module';
import {TaskModule} from 'term-web/task/task.module';
import {RootComponent} from 'term-web/root.component';
import {NoPrivilegeComponent} from 'term-web/core/components/no-privilege/no-privilege.component';
import {SysModule} from 'term-web/sys/sys.module';
import {TerminologyServiceApiModule} from 'term-web/terminology-service-api/terminology-service-api.module';
import {PreferencesService} from 'term-web/core/preferences/preferences.service';
import {ModelerModule} from 'term-web/modeler/modeler.module';
import {UserModule} from 'term-web/user/user.module';
import {LangInterceptor} from 'term-web/core/http';

registerLocaleData(de);
registerLocaleData(et);
registerLocaleData(fr);
registerLocaleData(lt);
registerLocaleData(nl);


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
    WikiModule,
    ModelerModule,
    TaskModule,
    FhirModule,
    ObservationDefinitionModule,
    TerminologyServiceApiModule,
    MeasurementUnitModule,
    SpaceModule,
    SysModule,
    UserModule,
    SequenceModule
  ],
  providers: [
    {provide: LOCALE_ID, useValue: 'en'},
    {provide: APP_INITIALIZER, useFactory: preloadAuth, deps: [AuthService], multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: LangInterceptor, multi: true}
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
