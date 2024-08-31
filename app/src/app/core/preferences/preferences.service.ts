import {Injectable, InjectionToken, inject} from '@angular/core';
import {isDefined, toNumber} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {BehaviorSubject, distinctUntilChanged, filter, map, Observable} from 'rxjs';

const LOCALE = 'locale';
const SPACE = 'space';
const THEME = 'theme';

export const PREFERENCES_LANG_PROVIDER = new InjectionToken<() => string>('PREFERENCES_LANG_PROVIDER');


const getBrowserLang = (): string | undefined => {
  const lang = navigator.language; // en-US
  const base = navigator.language?.split('-')?.[0]; // en
  return [lang, base].find(l => environment.uiLanguages.includes(l));
};

const getLang = (): string => {
  return localStorage.getItem(LOCALE)
    ?? getBrowserLang()
    ?? environment.defaultLanguage;
};


type Theme = 'light' | 'dark';

const getTheme = (): Theme => {
  return localStorage.getItem(THEME) as Theme ?? 'light';
};


@Injectable({providedIn: 'root'})
export class PreferencesService {
  private _langProvider = inject(PREFERENCES_LANG_PROVIDER, {optional: true});

  private _lang = new BehaviorSubject<string>(this._langProvider?.() ?? getLang());
  private _spaceId = new BehaviorSubject<{id: number, emit?: boolean}>({id: toNumber(localStorage.getItem(SPACE))});
  private _theme = new BehaviorSubject<Theme>(getTheme());


  // lang

  public setLang(lang: string): void {
    localStorage.setItem(LOCALE, lang);
    this._lang.next(lang);
  }

  public get lang$(): Observable<string> {
    return this._lang.asObservable();
  }

  public get lang(): string {
    return this._lang.getValue();
  }


  // space

  public setSpace(spaceId: number, options?: {emitEvent?: boolean}): void {
    localStorage.setItem(SPACE, spaceId ? String(spaceId) : undefined);
    this._spaceId.next({id: spaceId, emit: options?.emitEvent ?? true});
  }

  public get spaceId$(): Observable<number> {
    return this._spaceId.pipe(
      filter(e => e.emit),
      map(e => e.id),
      map(this.toNumber),
      distinctUntilChanged()
    );
  }

  public get spaceId(): number {
    return this.toNumber(this._spaceId.getValue()?.id);
  }


  // theme

  public setTheme(theme: Theme): void {
    localStorage.setItem(THEME, theme);
    this._theme.next(theme);
  }

  public get theme$(): Observable<Theme> {
    return this._theme.asObservable();
  }

  public get theme(): string {
    return this._theme.getValue();
  }


  // utils

  private toNumber(v: any): number {
    return isDefined(v) ? Number(v) : undefined;
  }
}
