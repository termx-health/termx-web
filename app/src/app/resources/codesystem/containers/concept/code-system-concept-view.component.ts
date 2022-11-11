import {Component, OnInit} from '@angular/core';
import {CodeSystemConcept, CodeSystemEntityVersion, CodeSystemVersion} from 'lib/src/resources';
import {CodeSystemService} from '../../services/code-system.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  templateUrl: './code-system-concept-view.component.html',
})
export class CodeSystemConceptViewComponent implements OnInit {
  public codeSystemId?: string | null;
  public conceptCode?: string | null;
  public concept?: CodeSystemConcept;
  public conceptVersion?: CodeSystemEntityVersion;

  public loading: {[k: string]: boolean} = {};

  public statusColorMap: {[status: string]: 'red' | 'green' | 'gray'} = {
    'active': 'green',
    'draft': 'gray',
    'retired': 'red'
  };

  public constructor(
    public codeSystemService: CodeSystemService,
    private route: ActivatedRoute
  ) { }

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    this.conceptCode = this.route.snapshot.paramMap.get('conceptCode') ? this.route.snapshot.paramMap.get('conceptCode') : undefined;
    this.loadConcept(this.conceptCode!);
  }

  public requiredLanguages(codeSystemVersion: CodeSystemVersion): string[] {
    return [codeSystemVersion.preferredLanguage!];
  }

  private loadConcept(conceptCode: string): void {
    this.loading['init'] = true;
    this.codeSystemService.loadConcept(this.codeSystemId!, conceptCode).subscribe(c => this.concept = c).add(() => {
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
