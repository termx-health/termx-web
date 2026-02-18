import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NzTabsComponent, NzTabComponent, NzTabLinkTemplateDirective, NzTabLinkDirective } from 'ng-zorro-antd/tabs';
import { MuiCoreModule } from '@kodality-web/marina-ui';
import { LoincListComponent } from 'term-web/integration/loinc/loinc-list.component';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { LoincPartListComponent } from 'term-web/integration/loinc/loinc-part-list.component';
import { LoincAnswerListListComponent } from 'term-web/integration/loinc/loinc-answer-list-list.component';

@Component({
    templateUrl: './loinc-dashboard.component.html',
    imports: [
        NzTabsComponent,
        NzTabComponent,
        NzTabLinkTemplateDirective,
        MuiCoreModule,
        NzTabLinkDirective,
        RouterLink,
        LoincListComponent,
        PrivilegedDirective,
        LoincPartListComponent,
        LoincAnswerListListComponent,
    ],
})
export class LoincDashboardComponent implements OnInit {
  private route = inject(ActivatedRoute);

  protected conceptId?: string;
  protected tabIndxes = {'loinc': 0, 'parts': 1, 'answer-list': 2};
  protected currentTab: string = 'loinc';

  public ngOnInit(): void {
    this.conceptId = this.route.snapshot.paramMap.get("conceptId") || this.conceptId;

    this.route.queryParams.subscribe(p => this.currentTab = p['tab'] || 'loinc');
  }
}
