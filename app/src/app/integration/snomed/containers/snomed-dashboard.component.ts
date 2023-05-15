import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  templateUrl: './snomed-dashboard.component.html',
})
export class SnomedDashboardComponent implements OnInit {
  public conceptId?: string;

  public constructor(private route: ActivatedRoute, private router: Router) {}

  public ngOnInit(): void {
    this.conceptId = this.route.snapshot.paramMap.get("conceptId") || this.conceptId;
  }

  public conceptSelected(conceptId: string): void {
    this.conceptId = conceptId;
    const tab = this.route.snapshot.queryParamMap.get("tab");
    this.router.navigate(['/integration/snomed', conceptId], {queryParams: {tab: tab}});
  }
}
