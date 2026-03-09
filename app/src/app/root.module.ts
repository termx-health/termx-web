import {HttpBackend, HttpClient} from '@angular/common/http';
import {NgModule, inject} from '@angular/core';
import {group} from '@kodality-web/core-util';
import {TranslateLoader, TranslateService} from '@ngx-translate/core';
import {environment as env} from 'environments/environment';
import {catchError, map, Observable, of} from 'rxjs';
import {AuthService} from 'term-web/core/auth';
import {PreferencesService} from 'term-web/core/preferences/preferences.service';


export function HttpLoaderFactory(_http: HttpBackend): TranslateLoader {
  return {
    getTranslation(lang: string): Observable<any> {
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


@NgModule()
export class RootModule {
  public constructor() {
    const preferences = inject(PreferencesService);
    const translate = inject(TranslateService);

    translate.use(preferences.lang);
    translate.onLangChange.subscribe(({lang}) => preferences.setLang(lang));
  }
}
