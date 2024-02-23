import {Injectable} from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';
import {NavigationEnd, Router} from '@angular/router';
import {filter, tap} from 'rxjs';

@Injectable({providedIn: 'root'})
export class SeoService {
  private _title: string;
  private _description: string;

  public constructor(
    router: Router,
    private titleSvc: Title,
    private metaSvc: Meta
  ) {
    this._title = titleSvc.getTitle();
    this._description = metaSvc.getTag('name="description"').content;

    router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        tap(() => this.reset())
      ).subscribe();
  }

  public title(val: string): void {
    this.titleSvc.setTitle(val);
  }

  public description(desc: string): void {
    this.metaSvc.updateTag({name: 'description', content: desc});
    this.metaSvc.updateTag({property: 'og:description', content: desc});
    this.metaSvc.updateTag({property: 'twitter:description', content: desc});
  }

  public reset(): void {
    this.title(this._title);
    this.description(this._description);
  }
}
