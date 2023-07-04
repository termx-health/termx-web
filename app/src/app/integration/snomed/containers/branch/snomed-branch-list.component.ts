import {Component, OnInit} from '@angular/core';
import {LoadingManager} from '@kodality-web/core-util';
import {SnomedBranch, SnomedLibService} from 'app/src/app/integration/_lib';

@Component({
  templateUrl: './snomed-branch-list.component.html',
})
export class SnomedBranchListComponent implements OnInit {
  protected branches: SnomedBranch[] = [];
  protected loader = new LoadingManager();

  public constructor(private snomedService: SnomedLibService) {}

  public ngOnInit(): void {
    this.loader.wrap('load', this.snomedService.loadBranches()).subscribe(b => this.branches = b);
  }

  protected encodeUriComponent = (c: string): string => {
    return c.replace('/', '--');
  };
}
