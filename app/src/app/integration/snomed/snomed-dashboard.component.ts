import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  templateUrl: './snomed-dashboard.component.html',
})
export class SnomedDashboardComponent implements OnInit {
  public conceptId?: string;

  public constructor(private route: ActivatedRoute) {}

  public ngOnInit(): void {
    this.conceptId = this.route.snapshot.paramMap.get("conceptId") || this.conceptId;
  }
}
