import {Injectable} from '@angular/core';
import {BehaviorSubject, distinctUntilChanged, filter, map, Observable} from 'rxjs';
import {isDefined, toNumber} from '@kodality-web/core-util';

const LOCALE = 'locale';
const SPACE = 'space';

@Injectable({providedIn: 'root'})
export class PreferencesService {
  private _lang = new BehaviorSubject<string>(localStorage.getItem(LOCALE) ?? 'en');
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
    console.log('next', {id: spaceId, emit: options?.emitEvent ?? true})
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
