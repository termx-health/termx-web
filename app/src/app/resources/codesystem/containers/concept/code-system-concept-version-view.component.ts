import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSystemEntityVersion, CodeSystemEntityVersionLibService} from 'terminology-lib/resources';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';

@Component({
  templateUrl: './code-system-concept-version-view.component.html',
})
export class CodeSystemConceptVersionViewComponent implements OnInit {
  public codeSystemId?: string | null;
  public conceptVersion?: CodeSystemEntityVersion;

  private loading: {[key: string]: boolean} = {};

  @ViewChild("conceptVersionForm") public conceptVersionForm?: NgForm;

  public constructor(
    public codeSystemEntityVersionService: CodeSystemEntityVersionLibService,
    private route: ActivatedRoute,
  ) { }

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    const conceptVersionId = this.route.snapshot.paramMap.get('conceptVersionId');
    this.loadConceptVersion(Number(conceptVersionId));
  }

  private loadConceptVersion(conceptVersionId: number): void {
    this.loading['load'] = true;
    this.codeSystemEntityVersionService.load(conceptVersionId).subscribe(v => {
      this.conceptVersion = v;
    }).add(() => this.loading['load'] = false);
  }

  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }

}
