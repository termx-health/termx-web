import {Injectable} from '@angular/core';
import {BehaviorSubject, map, Observable} from 'rxjs';
import {isDefined, toNumber} from '@kodality-web/core-util';
import {distinctUntilChanged} from 'rxjs/operators';

const LOCALE = 'locale';
const SPACE = 'space';

@Injectable({providedIn: 'root'})
export class PreferencesService {
  private _lang = new BehaviorSubject<string>(localStorage.getItem(LOCALE) ?? 'en');
  private _spaceId = new BehaviorSubject<number>(toNumber(localStorage.getItem(SPACE)));


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


  public setSpace(spaceId: number): void {
    localStorage.setItem(SPACE, spaceId ? String(spaceId) : undefined);
    this._spaceId.next(spaceId);
  }

  public get spaceId$(): Observable<number> {
    return this._spaceId.pipe(map(this.toNumber), distinctUntilChanged());
  }

  public get spaceId(): number {
    return this.toNumber(this._spaceId.getValue());
  }


  private toNumber(v: any): number {
    return isDefined(v) ? Number(v) : undefined;
  }
}
