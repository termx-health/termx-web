import {Component, OnInit} from '@angular/core';
import {SearchResult} from '@kodality-web/core-util';
import {CodeSystem} from 'lib/src/resources';
import {CodeSystemService} from '../services/code-system.service';
import {Router} from '@angular/router';


@Component({
  template: `
    <div style="max-height: 100%; width: 100%; height: 100%; padding: 0 0 1rem 0; overflow: auto;">
      <twa-finder-wrapper [loading]="loading">
        <twa-finder-menu title="CODE SYSTEMS" [length]="searchResult.meta.total">
          <twa-finder-menu-item *ngFor="let cs of searchResult.data" [navigate]="[cs.id]" (view)="openResource(cs)">
            {{(cs.names | localName) || cs.id}}
          </twa-finder-menu-item>
        </twa-finder-menu>
      </twa-finder-wrapper>
    </div>
  `
})
export class FinderCodeSystemListComponent implements OnInit {
  public searchResult = new SearchResult<CodeSystem>();
  public loading = false;

  public constructor(
    private codeSystemService: CodeSystemService,
    private router: Router
  ) {}

  public ngOnInit(): void {
    this.loading = true;
    this.codeSystemService.search({limit: -1}).subscribe(resp => {
      return this.searchResult = resp;
    }).add(() => this.loading = false);
  }

  public openResource(cs: CodeSystem): void {
    this.router.navigate(['/resources/code-systems/', cs.id, 'edit'])
  }
}
