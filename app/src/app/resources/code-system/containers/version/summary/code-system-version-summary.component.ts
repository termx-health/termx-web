import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {LoadingManager} from '@kodality-web/core-util';
import {CodeSystem, CodeSystemVersion} from 'app/src/app/resources/_lib';
import {forkJoin} from 'rxjs';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';
import {ResourceTasksWidgetComponent} from 'term-web/resources/resource/components/resource-tasks-widget.component';

@Component({
  templateUrl: 'code-system-version-summary.component.html'
})
export class CodeSystemVersionSummaryComponent implements OnInit {
  protected codeSystem?: CodeSystem;
  protected codeSystemVersion?: CodeSystemVersion;
  protected loader = new LoadingManager();
  protected showOnlyOpenedTasks?: boolean = true;

  @ViewChild(ResourceTasksWidgetComponent) public tasksWidgetComponent?: ResourceTasksWidgetComponent;

  public constructor(
    private route: ActivatedRoute,
    private codeSystemService: CodeSystemService
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const versionCode = this.route.snapshot.paramMap.get('versionCode');
    this.loadData(id, versionCode);
  }

  protected loadData(codeSystem: string, versionCode: string): void {
    this.loader.wrap('load',
      forkJoin([this.codeSystemService.load(codeSystem), this.codeSystemService.loadVersion(codeSystem, versionCode)])
    ).subscribe(([cs, csv]) => {
      this.codeSystem = cs;
      this.codeSystemVersion = csv;
    });
  }
}
