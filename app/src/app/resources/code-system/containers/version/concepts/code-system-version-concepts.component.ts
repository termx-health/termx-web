import { Component, OnInit, inject } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {LoadingManager} from '@kodality-web/core-util';
import {CodeSystem, CodeSystemVersion} from 'term-web/resources/_lib';
import {forkJoin} from 'rxjs';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';
import { ResourceContextComponent } from 'term-web/resources/resource/components/resource-context.component';

import { CodeSystemConceptsListComponent } from 'term-web/resources/code-system/containers/concepts/list/code-system-concepts-list.component';
import { PrivilegedPipe } from 'term-web/core/auth/privileges/privileged.pipe';

@Component({
    templateUrl: 'code-system-version-concepts.component.html',
    imports: [ResourceContextComponent, CodeSystemConceptsListComponent, PrivilegedPipe]
})
export class CodeSystemVersionConceptsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private codeSystemService = inject(CodeSystemService);

  protected codeSystem?: CodeSystem;
  protected codeSystemVersion?: CodeSystemVersion;
  protected loader = new LoadingManager();

  protected searchInput: string;

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const versionCode = this.route.snapshot.paramMap.get('versionCode');
    this.loadData(id, versionCode);
  }

  private loadData(codeSystem: string, versionCode: string): void {
    this.loader.wrap('load',
      forkJoin([
        this.codeSystemService.load(codeSystem),
        this.codeSystemService.loadVersion(codeSystem, versionCode)
      ])).subscribe(([cs, csv]) => {
      this.codeSystem = cs;
      this.codeSystemVersion = csv;
    });
  }
}
