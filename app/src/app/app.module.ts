import {LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {TerminologyLibModule} from 'terminology-lib/terminology-lib.module';
import {environment} from '../environments/environment';
import {TERMINOLOGY_API} from 'terminology-lib/terminology-lib.token';
import {CoreZorroModule, MarinaUiModule} from '@kodality-health/marina-ui';
import {I18nService} from '@kodality-web/core-util';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    CoreZorroModule,
    MarinaUiModule,
    TerminologyLibModule
  ],
  providers: [
    {provide: LOCALE_ID, useValue: 'et'},
    {provide: TERMINOLOGY_API, useValue: environment.terminologyApi}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  public constructor(
    translateService: TranslateService,
    i18nService: I18nService
  ) {
    translateService.use('en');
    translateService.onLangChange.subscribe(({lang}) => i18nService.use(lang))
  }
}
