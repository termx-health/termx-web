import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SnomedSearchComponent} from 'term-web/integration/_lib';

@Component({
  templateUrl: './snomed-dashboard.component.html',
})
export class SnomedDashboardComponent implements OnInit {
  public conceptId?: string;
  @ViewChild("searchComponent") public searchComponent?: SnomedSearchComponent;

  public constructor(private route: ActivatedRoute, private router: Router) {}

  public ngOnInit(): void {
    this.route.paramMap.subscribe(pm => {
      this.conceptId = pm.get("conceptId") || this.conceptId;
      this.searchComponent?.expandTree(this.conceptId);
    });
  }

  public conceptSelected(conceptId: string): void {
    this.conceptId = conceptId;
    const tab = this.route.snapshot.queryParamMap.get("tab");
    this.router.navigate(['/integration/snomed', conceptId], {queryParams: {tab: tab}});
  }
}
