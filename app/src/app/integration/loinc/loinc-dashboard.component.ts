import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  templateUrl: './loinc-dashboard.component.html',
})
export class LoincDashboardComponent implements OnInit {
  protected conceptId?: string;
  protected tabIndxes = {'loinc': 0, 'parts': 1, 'answer-list': 2};
  protected currentTab: string = 'loinc';

  public constructor(private route: ActivatedRoute) {}

  public ngOnInit(): void {
    this.conceptId = this.route.snapshot.paramMap.get("conceptId") || this.conceptId;

    this.route.queryParams.subscribe(p => this.currentTab = p['tab'] || 'loinc');
  }
}
