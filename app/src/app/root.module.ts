import {APP_BASE_HREF} from '@angular/common';
import {HTTP_INTERCEPTORS, HttpBackend, HttpClient, HttpClientModule} from '@angular/common/http';
import {APP_INITIALIZER, LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CoreUtilModule, group} from '@kodality-web/core-util';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {environment as env, environment} from 'environments/environment';
import {catchError, map, Observable, of} from 'rxjs';
import {AppComponent} from 'term-web/app.component';
import {AuthModule, AuthService} from 'term-web/core/auth';
import {NoPrivilegeComponent} from 'term-web/core/components/no-privilege/no-privilege.component';
import {LangInterceptor} from 'term-web/core/http';
import {MarinaUiConfigModule} from 'term-web/core/marina';
import {PreferencesService} from 'term-web/core/preferences/preferences.service';
import {CoreUiModule} from 'term-web/core/ui/core-ui.module';
import {FhirModule} from 'term-web/fhir/fhir.module';
import {GlobalSearchModule} from 'term-web/global-search/global-search.module';
import {ImplementationGuideModule} from 'term-web/implementation-guide/implementation-guide.module';
import {IntegrationModule} from 'term-web/integration/integration.module';
import {MeasurementUnitModule} from 'term-web/measurement-unit/measurement-unit.module';
import {ModelerModule} from 'term-web/modeler/modeler.module';
import {ObservationDefinitionModule} from 'term-web/observation-definition/observation-definition.module';
import {PrivilegesModule} from 'term-web/privileges/privileges.module';
import {ResourcesModule} from 'term-web/resources/resources.module';
import {RootRoutingModule} from 'term-web/root-routing.module';
import {RootComponent} from 'term-web/root.component';
import {SequenceModule} from 'term-web/sequence/sequence.module';
import {SysModule} from 'term-web/sys/sys.module';
import {TaskModule} from 'term-web/task/task.module';
import {TerminologyServiceApiModule} from 'term-web/terminology-service-api/terminology-service-api.module';
import {UserModule} from 'term-web/user/user.module';
import {WikiModule} from 'term-web/wiki/wiki.module';


export function HttpLoaderFactory(_http: HttpBackend): TranslateLoader {
  return {
    getTranslation(lang: string): Observable<object> {
      return new HttpClient(_http).get(`./assets/i18n/${lang}.json`).pipe(
        catchError(() => of({})),
        map(translations => {
          const extraLangs = env.extraLanguages ?? {};
          translations['language'] = {
            ...translations['language'] ?? {},
            ...group(Object.entries(extraLangs), ([k]) => k, ([k, v]) => v[lang] ?? k)
          };
          return translations;
        })
      );
    }
  };
}

export function initAuth(authService: AuthService): () => Observable<any> {
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
    SysModule,
    UserModule,
    SequenceModule,
    ImplementationGuideModule
  ],
  providers: [
    {provide: LOCALE_ID, useValue: environment.defaultLanguage},
    {provide: APP_INITIALIZER, useFactory: initAuth, deps: [AuthService], multi: true},
    {provide: APP_BASE_HREF, useFactory: (): string => environment.baseHref},
    {provide: HTTP_INTERCEPTORS, useClass: LangInterceptor, multi: true},
  ],
  bootstrap: [
    RootComponent
  ]
})
export class RootModule {
  public constructor(preferences: PreferencesService, translate: TranslateService) {
    translate.use(preferences.lang);
    translate.onLangChange.subscribe(({lang}) => preferences.setLang(lang));
    preferences.theme$.subscribe(theme => document.documentElement.classList.toggle('dark', theme === 'dark'));
  }
}
