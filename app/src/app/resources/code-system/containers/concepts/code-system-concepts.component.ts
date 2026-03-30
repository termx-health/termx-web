import { Component, OnInit, inject } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {LoadingManager} from '@termx-health/core-util';
import {forkJoin} from 'rxjs';
import {CodeSystem, CodeSystemVersion} from 'term-web/resources/_lib';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';
import { ResourceContextComponent } from 'term-web/resources/resource/components/resource-context.component';
import { MarinPageLayoutModule } from '@termx-health/ui';

import { CodeSystemConceptsListComponent } from 'term-web/resources/code-system/containers/concepts/list/code-system-concepts-list.component';
import { PrivilegedPipe } from 'term-web/core/auth/privileges/privileged.pipe';

@Component({
    templateUrl: 'code-system-concepts.component.html',
    imports: [ResourceContextComponent, MarinPageLayoutModule, CodeSystemConceptsListComponent, PrivilegedPipe]
})
export class CodeSystemConceptsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private codeSystemService = inject(CodeSystemService);

  protected codeSystem?: CodeSystem;
  protected versions?: CodeSystemVersion[];
  protected loader = new LoadingManager();

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loader.wrap('load',
      forkJoin([this.codeSystemService.load(id), this.codeSystemService.searchVersions(id, {limit: -1})]))
      .subscribe(([cs, versions]) => {
        this.codeSystem = cs;
        this.versions = versions.data;
      });
  }
}
