import {Component, OnInit} from '@angular/core';
import {CodeSystem, CodeSystemConcept, CodeSystemEntityVersion, CodeSystemVersion, ConceptUtil, EntityProperty} from 'app/src/app/resources/_lib';
import {CodeSystemService} from '../../../services/code-system.service';
import {ActivatedRoute} from '@angular/router';
import {LoadingManager} from '@kodality-web/core-util';
import {forkJoin, of} from 'rxjs';

@Component({
  templateUrl: './code-system-concept-view.component.html',
  styles: [`
    .version-sidebar {
      height: min-content;
      margin-bottom: 1rem
    }

    .padded {
      display: block;
      margin-top: 1rem
    }
  `]
})
export class CodeSystemConceptViewComponent implements OnInit {
  public codeSystemId?: string | null;
  public versionCode?: string | null;
  public parent?: string | null;
  public codeSystem?: CodeSystem;
  public codeSystemVersion?: CodeSystemVersion;
  public codeSystemVersions?: CodeSystemVersion[];
  public concept?: CodeSystemConcept;
  public conceptVersion?: CodeSystemEntityVersion;

  protected loader = new LoadingManager();


  public constructor(
    public codeSystemService: CodeSystemService,
    private route: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    this.versionCode = this.route.snapshot.paramMap.get('versionCode');
    const conceptCode = this.route.snapshot.paramMap.get('conceptCode');
    const conceptVersionId = this.route.snapshot.queryParamMap.get('conceptVersionId');

    this.loadData();

    this.loader.wrap('init', this.codeSystemService.loadConcept(this.codeSystemId, conceptCode, this.versionCode)).subscribe(c => {
      this.concept = c;
      const conceptVersion = this.concept?.versions?.find(v => v.id === Number(conceptVersionId)) || this.concept?.versions?.[this.concept?.versions?.length - 1];
      this.selectVersion(conceptVersion);
    });
  }

  public selectVersion(version?: CodeSystemEntityVersion): void {
    version.designations ??= [];
    version.propertyValues ??= [];
    version.associations ??= [];
    this.conceptVersion = version;
  }

  private loadData(): void {
    this.loader.wrap('init', forkJoin([
      this.codeSystemService.load(this.codeSystemId),
      this.versionCode ? this.codeSystemService.loadVersion(this.codeSystemId, this.versionCode) : of(undefined),
      !this.versionCode ? this.codeSystemService.searchVersions(this.codeSystemId, {limit: -1}) : of({data: []})]
    )).subscribe(([cs, version, versions]) => {
      this.codeSystem = cs;
      this.codeSystemVersion = version;
      this.codeSystemVersions = versions.data;
    });
  }
}
