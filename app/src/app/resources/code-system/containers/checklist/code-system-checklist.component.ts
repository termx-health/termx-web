import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {LoadingManager} from '@kodality-web/core-util';
import {forkJoin, of} from 'rxjs';
import {CodeSystem, CodeSystemLibService, CodeSystemVersion} from 'term-web/resources/_lib';
import {CodeSystemChecklistConfigurationComponent} from 'term-web/resources/code-system/containers/checklist/code-system-checklist-configuration.component';

@Component({
  templateUrl: 'code-system-checklist.component.html'
})
export class CodeSystemChecklistComponent implements OnInit {
  protected codeSystem?: CodeSystem;
  protected version?: CodeSystemVersion;
  protected versions?: CodeSystemVersion[];
  protected loader = new LoadingManager();

  protected mode: 'validation' | 'configuration' = 'validation';
  protected emptyConfiguration: boolean = false;
  protected validationShowAll: boolean = true;

  @ViewChild(CodeSystemChecklistConfigurationComponent) public configurationComponent?: CodeSystemChecklistConfigurationComponent;

  public constructor(
    private route: ActivatedRoute,
    private codeSystemService: CodeSystemLibService
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const version = this.route.snapshot.paramMap.get('versionCode');
    this.loader.wrap('load', forkJoin([
      this.codeSystemService.load(id),
      version ? this.codeSystemService.loadVersion(id, version) : of(null),
      !version ? this.codeSystemService.searchVersions(id, {limit: -1}) : of(null)
    ])).subscribe(([cs, version, versions]) => {
      this.codeSystem = cs;
      this.version = version;
      this.versions = versions?.data;
    });
  }

  public saveConfiguration(): void {
    this.configurationComponent?.save();
    this.emptyConfiguration = false;
  }
}
