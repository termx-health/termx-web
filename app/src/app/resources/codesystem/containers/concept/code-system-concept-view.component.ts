import {Component, OnInit} from '@angular/core';
import {CodeSystemConcept, CodeSystemConceptLibService} from 'terminology-lib/resources';
import {CodeSystemService} from '../../services/code-system.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  templateUrl: './code-system-concept-view.component.html',
})
export class CodeSystemConceptViewComponent implements OnInit {
  public codeSystemId?: string | null;
  public concept?: CodeSystemConcept;

  public loading = false;

  public constructor(
    public codeSystemConceptLibService: CodeSystemConceptLibService,
    public codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
  ) { }

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    const conceptId = this.route.snapshot.paramMap.get('conceptId');
    this.loadConcept(Number(conceptId));
  }

  private loadConcept(conceptId: number): void {
    this.loading = true;
    this.codeSystemConceptLibService.load(conceptId).subscribe(c => this.concept = c).add(() => this.loading = false);
  }
}
