import {Injectable} from '@angular/core';
import {BehaviorSubject, distinctUntilChanged, filter, map, Observable} from 'rxjs';
import {isDefined, toNumber} from '@kodality-web/core-util';
import {environment} from 'environments/environment';

const LOCALE = 'locale';
const SPACE = 'space';

const getBrowserLang = (): string | undefined => {
  const lang = navigator.language;
  if (lang?.includes('-')) {
    return lang.split('-')[0];
  }
};

const getLang = (): string => {
  return localStorage.getItem(LOCALE)
    ?? getBrowserLang()
    ?? environment.defaultLanguage;
};


@Injectable({providedIn: 'root'})
export class PreferencesService {
  private _lang = new BehaviorSubject<string>(getLang());
  private _spaceId = new BehaviorSubject<{id: number, emit?: boolean}>({id: toNumber(localStorage.getItem(SPACE)), emit: false});


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


  private toNumber(v: any): number {
    return isDefined(v) ? Number(v) : undefined;
  }
}
