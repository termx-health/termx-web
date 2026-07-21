import {HttpBackend, HttpClient} from '@angular/common/http';
import {NgModule, inject} from '@angular/core';
import {group} from '@termx-health/core-util';
import {TranslateLoader, TranslateService} from '@ngx-translate/core';
import {environment as env} from 'environments/environment';
import {catchError, forkJoin, map, Observable, of} from 'rxjs';
import {AuthService} from 'term-web/core/auth';
import {PreferencesService} from 'term-web/core/preferences/preferences.service';


export function HttpLoaderFactory(_http: HttpBackend): TranslateLoader {
  return {
    getTranslation(lang: string): Observable<any> {
      const http = new HttpClient(_http);
      // The bundled catalogue first, then any deployment overlays on top (later wins). A missing
      // file yields {} rather than failing the load, so one bad overlay can't blank the whole UI.
      const sources = [
        `./assets/i18n/${lang}.json`,
        ...(env.i18nOverlays ?? []).map(url => url.replace(/\{lang}/g, lang))
      ].map(url => http.get<TranslationNode>(url).pipe(catchError(() => of({} as TranslationNode))));

      return forkJoin(sources).pipe(
        map(catalogues => catalogues.reduce<TranslationNode>((merged, c) => deepMerge(merged, c), {})),
        map(translations => {
          const extraLangs = env.extraLanguages ?? {};
          const languages = translations['language'];
          translations['language'] = {
            ...(isTranslationGroup(languages) ? languages : {}),
            ...group(Object.entries(extraLangs), ([k]) => k, ([k, v]) => v[lang] ?? k)
          };
          return translations;
        })
      );
    }
  };
}

/** A translation catalogue: nested groups of strings, as in `assets/i18n/*.json`. */
type TranslationNode = {[key: string]: string | TranslationNode};

const isTranslationGroup = (v: string | TranslationNode): v is TranslationNode =>
  !!v && typeof v === 'object' && !Array.isArray(v);

/**
 * Merge a translation overlay onto the base catalogue.
 *
 * Recursive by necessity: the catalogues are deeply nested (`web.code-system.list.…`), so a shallow
 * spread would let an overlay touching one key replace that whole subtree and silently drop every
 * sibling string.
 */
function deepMerge(base: TranslationNode, overlay: TranslationNode): TranslationNode {
  const out: TranslationNode = {...base};
  Object.entries(overlay ?? {}).forEach(([k, v]) => {
    out[k] = isTranslationGroup(v) && isTranslationGroup(out[k]) ? deepMerge(out[k], v) : v;
  });
  return out;
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
    preferences.theme$.subscribe(theme => document.documentElement.classList.toggle('dark', theme === 'dark'));
  }
}
