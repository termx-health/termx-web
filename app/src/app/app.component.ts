import {Component, OnInit} from '@angular/core';
import {MuiDestroyService, MuiMenuItem} from '@kodality-health/marina-ui';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import {LocalizedName} from '@kodality-health/marina-util';
import {assetUrl} from '../single-spa/asset-url';
import {singleSpaPropsSubject} from '../single-spa/single-spa-props';
import {takeUntil} from 'rxjs';

interface ParentProps {
  callParentNotification?: (args: any) => void
}

@Component({
  selector: 'twa-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  public menu: MuiMenuItem[] = [];

  public constructor(
    private router: Router,
    private http: HttpClient,
    private translateService: TranslateService,
    private destroy$: MuiDestroyService
  ) {}

  public ngOnInit(): void {
    this.loadMenu();
    singleSpaPropsSubject.pipe(takeUntil(this.destroy$)).subscribe((props) => {
      const _props = props as ParentProps;
      _props.callParentNotification!('Hello from KTS');
    });
  }

  private loadMenu(): void {
    this.http.get<{label?: LocalizedName, icon: string, link: string}[]>(assetUrl("./menu.json")).subscribe((menu) => {
      this.menu = menu.map(i => ({label: i.label?.[this.translateService.currentLang], icon: i.icon, click: () => this.router.navigateByUrl(i.link)}));
    });
  }

  public onLangChange(lang: string): void {
    this.translateService.use(lang);
    this.loadMenu();
  }
}
