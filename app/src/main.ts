import { enableProdMode, LOCALE_ID, APP_INITIALIZER, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';

import { initAuth, HttpLoaderFactory } from './app/root.module';
import {environment} from './environments/environment';
import { AuthService, AuthModule } from 'term-web/core/auth';
import { HttpBackend, HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { APP_BASE_HREF } from '@angular/common';
import { LangInterceptor } from 'term-web/core/http';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RootRoutingModule } from 'term-web/root-routing.module';
import { MarinaUiConfigModule } from 'term-web/core/marina';
import { CoreUtilModule } from '@kodality-web/core-util';
import { CoreUiModule } from 'term-web/core/ui/core-ui.module';
import { ResourcesModule } from 'term-web/resources/resources.module';
import { IntegrationModule } from 'term-web/integration/integration.module';
import { PrivilegesModule } from 'term-web/privileges/privileges.module';
import { GlobalSearchModule } from 'term-web/global-search/global-search.module';
import { WikiModule } from 'term-web/wiki/wiki.module';
import { ModelerModule } from 'term-web/modeler/modeler.module';
import { TaskModule } from 'term-web/task/task.module';
import { FhirModule } from 'term-web/fhir/fhir.module';
import { ObservationDefinitionModule } from 'term-web/observation-definition/observation-definition.module';
import { TerminologyServiceApiModule } from 'term-web/terminology-service-api/terminology-service-api.module';
import { MeasurementUnitModule } from 'term-web/measurement-unit/measurement-unit.module';
import { SysModule } from 'term-web/sys/sys.module';
import { UserModule } from 'term-web/user/user.module';
import { SequenceModule } from 'term-web/sequence/sequence.module';
import { ImplementationGuideModule } from 'term-web/implementation-guide/implementation-guide.module';
import { RootComponent } from './app/root.component';



if (environment.production) {
  enableProdMode();
}

bootstrapApplication(RootComponent, {
    providers: [
        provideZoneChangeDetection({eventCoalescing: true}),
        importProvidersFrom(BrowserModule, BrowserAnimationsModule, RootRoutingModule, HttpClientModule, TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpBackend]
            }
        }), AuthModule.init(), MarinaUiConfigModule.init(), CoreUtilModule, CoreUiModule, ResourcesModule, IntegrationModule, PrivilegesModule, GlobalSearchModule, WikiModule, ModelerModule, TaskModule, FhirModule, ObservationDefinitionModule, TerminologyServiceApiModule, MeasurementUnitModule, SysModule, UserModule, SequenceModule, ImplementationGuideModule),
        { provide: LOCALE_ID, useValue: environment.defaultLanguage },
        { provide: APP_INITIALIZER, useFactory: initAuth, deps: [AuthService], multi: true },
        { provide: APP_BASE_HREF, useFactory: (): string => environment.baseHref },
        { provide: HTTP_INTERCEPTORS, useClass: LangInterceptor, multi: true }
    ]
})
  // eslint-disable-next-line no-console
  .catch(err => console.error(err));
