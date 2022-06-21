import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSystemEntityVersion, CodeSystemEntityVersionLibService} from 'terminology-lib/resources';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';

@Component({
  templateUrl: './code-system-concept-version-view.component.html',
})
export class CodeSystemConceptVersionViewComponent implements OnInit {
  public codeSystemId?: string | null;
  public version?: CodeSystemEntityVersion;

  private loading: {[key: string]: boolean} = {};

  @ViewChild("conceptVersionForm") public conceptVersionForm?: NgForm;

  public constructor(
    public codeSystemEntityVersionService: CodeSystemEntityVersionLibService,
    private route: ActivatedRoute,
  ) { }

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    const versionId = this.route.snapshot.paramMap.get('conceptVersion');
    this.loadVersion(Number(versionId));
  }

  private loadVersion(versionId: number): void {
    this.loading['load'] = true;
    this.codeSystemEntityVersionService.load(versionId).subscribe(v => {
      this.version = v;
    }).add(() => this.loading['load'] = false);
  }

  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }

}
