import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {LoadingManager, validateForm} from '@kodality-web/core-util';
import {MuiTableComponent} from '@kodality-web/marina-ui';
import {SnomedBranch, SnomedCodeSystem} from 'app/src/app/integration/_lib';
import {SnomedService} from 'app/src/app/integration/snomed/services/snomed-service';
import {forkJoin} from 'rxjs';

@Component({
  templateUrl: './snomed-management.component.html',
})
export class SnomedManagementComponent implements OnInit {
  protected workingBranches: SnomedBranch[] = [];
  protected dailyBuildBranches: SnomedBranch[] = [];
  protected codeSystems: SnomedCodeSystem[] = [];
  protected loader = new LoadingManager();

  @ViewChild("form") public form?: NgForm;
  @ViewChild("csTable") public table?: MuiTableComponent<SnomedCodeSystem>;


  public editionModalData: {
    visible?: boolean,
    countryCode?: string
    name?: string
  } = {};

  public constructor(private snomedService: SnomedService) {}

  public ngOnInit(): void {
    this.loadData();
  }

  protected encodeUriComponent = (c: string): string => {
    return c.split('/').join('--');
  };

  protected createCodeSystem(): void {
    if (!validateForm(this.form)) {
      return;
    }
    const cs: SnomedCodeSystem = {
      shortName: 'SNOMEDCT-' + this.editionModalData.countryCode,
      branchPath: 'MAIN/SNOMEDCT-' + this.editionModalData.countryCode,
      name: this.editionModalData.name
    };
    this.loader.wrap('load', this.snomedService.createCodeSystem(cs)).subscribe(() => {
      this.editionModalData = {};
      this.loadData();
    });
  }

  private loadData(): void {
    this.loader.wrap('load', forkJoin([
        this.snomedService.loadBranches(),
        this.snomedService.loadCodeSystems()
    ])).subscribe(([branches, codeSystems]) =>{
      this.codeSystems = codeSystems;
      this.workingBranches = branches.filter(b => !codeSystems.find(cs => cs.branchPath == b.path || !!cs.versions.find(v => v.branchPath === b.path)));
      this.dailyBuildBranches = branches.filter(b => !!codeSystems.find(cs => cs.branchPath == b.path && cs.dailyBuildAvailable));
    });
  }
}
