import { Component, OnInit, inject, input, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { LocalDatePipe } from '@termx-health/core-util';
import { MuiDividerModule } from '@termx-health/ui';
import { CodeSystem } from 'term-web/resources/_lib/code-system/model/code-system';
import { LocalizedConceptNamePipe } from 'term-web/resources/_lib/code-system/pipe/localized-concept-name-pipe';
import { CodeSystemService } from 'term-web/resources/code-system/services/code-system.service';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';

@Component({
  selector: 'tw-code-system-list-expanded-row',
  template: `
    <div style="display: grid">
      <div><b>{{'web.code-system.list.uri' | translate}}:</b> {{codeSystem().uri}}</div>
      <div><b>{{'entities.code-system.content' | translate}}:</b> {{codeSystem().content | localizedConceptName: {valueSet: 'codesystem-content-mode'} | async}}</div>
      @if (codeSystem().caseSensitive) {
        <div><b>{{'entities.code-system.case-sensitivity' | translate}}:</b> {{'web.case-sensitive.options.' + codeSystem().caseSensitive | translate}}</div>
      }
      @if (loadingVersions()) {
        <div><b>{{'entities.code-system.versions' | translate}}:</b> ...</div>
      }
      @if ((codeSystem().versions?.length || 0) > 0) {
        <div>
          <b>{{'entities.code-system.versions' | translate}}:</b>
          <div style="display: grid ;grid-template-columns: repeat(5, auto); width: max-content; column-gap: 0.5rem; row-gap: 0.2rem">
            @for (version of codeSystem().versions; track version) {
              <b>{{version.version}}</b>
              <m-divider mVertical/>
              <i>{{version.releaseDate ? (version.releaseDate | localDate) : '...'}} - {{version.expirationDate ? (version.expirationDate | localDate) : '...'}}</i>
              <m-divider mVertical/>
              <tw-status-tag [status]="version.status"/>
            }
          </div>
        </div>
      }
    </div>
  `,
  imports: [AsyncPipe, TranslatePipe, LocalDatePipe, MuiDividerModule, LocalizedConceptNamePipe, StatusTagComponent]
})
export class CodeSystemListExpandedRowComponent implements OnInit {
  private codeSystemService = inject(CodeSystemService);

  public codeSystem = input.required<CodeSystem>();
  protected loadingVersions = signal(false);

  public ngOnInit(): void {
    const codeSystem = this.codeSystem();
    if (!codeSystem?.id || codeSystem.versions !== undefined) {
      return;
    }
    this.loadingVersions.set(true);
    this.codeSystemService.searchVersions(codeSystem.id, {limit: -1})
      .pipe(finalize(() => this.loadingVersions.set(false)))
      .subscribe(resp => codeSystem.versions = resp.data);
  }
}
