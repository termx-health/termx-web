import {Component, OnInit} from '@angular/core';
import {CodeSystemConcept, CodeSystemConceptLibService, CodeSystemEntityVersion, CodeSystemVersion} from 'lib/src/resources';
import {CodeSystemService} from '../../services/code-system.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  templateUrl: './code-system-concept-view.component.html',
})
export class CodeSystemConceptViewComponent implements OnInit {
  public codeSystemId?: string | null;
  public conceptId?: number | null;
  public concept?: CodeSystemConcept;
  public conceptVersion?: CodeSystemEntityVersion;

  public loading: {[k: string]: boolean} = {};

  public constructor(
    public codeSystemConceptLibService: CodeSystemConceptLibService,
    public codeSystemService: CodeSystemService,
    private route: ActivatedRoute
  ) { }

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    this.conceptId = this.route.snapshot.paramMap.get('conceptId') ? Number(this.route.snapshot.paramMap.get('conceptId')) : undefined;
    this.loadConcept(this.conceptId!);
  }

  public requiredLanguages(codeSystemVersion: CodeSystemVersion): string[] {
    return [codeSystemVersion.preferredLanguage!];
  }

  private loadConcept(conceptId: number): void {
    this.loading['init'] = true;
    this.codeSystemConceptLibService.load(conceptId).subscribe(c => this.concept = c).add(() => {
      this.loading['init'] = false;
      this.selectVersion(this.concept?.versions?.[this.concept?.versions?.length - 1]);
    });
  }

  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }

  public selectVersion(version?: CodeSystemEntityVersion): void {
    this.conceptVersion = version;
  }

}
