import { Component, OnInit, inject, input, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { LocalDatePipe } from '@termx-health/core-util';
import { MuiCoreModule, MuiDividerModule, MuiFormModule } from '@termx-health/ui';
import { MarinaUtilModule } from '@termx-health/util';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import { ValueSet } from 'term-web/resources/_lib';
import { ValueSetService } from 'term-web/resources/value-set/services/value-set.service';

@Component({
  selector: 'tw-value-set-list-expanded-row',
  template: `
    <m-form-row mFull>
      <div *mFormCol>
        <m-form-item mLabel="entities.value-set.uri">
          {{valueSet().uri ?? '-'}}
        </m-form-item>
        <m-form-item mLabel="entities.value-set.description">
          {{valueSet().description | localName:'-'}}
        </m-form-item>
        <m-form-item mLabel="entities.value-set.versions">
          @if (loadingVersions()) {
            <div>...</div>
          }
          @if ((valueSet().versions?.length || 0) > 0) {
            <div style="display: grid; grid-template-columns: repeat(5, auto); width: max-content; column-gap: 0.5rem; row-gap: 0.2rem">
              @for (version of valueSet().versions; track version) {
                <b>{{version.version}}</b>
                <m-divider mVertical/>
                <i>{{version.releaseDate ? (version.releaseDate | localDate) : '...'}} - {{version.expirationDate ? (version.expirationDate | localDate) : '...'}}</i>
                <m-divider mVertical/>
                <tw-status-tag [status]="version.status"/>
              }
            </div>
          }
        </m-form-item>
      </div>
    </m-form-row>
  `,
  imports: [LocalDatePipe, MuiCoreModule, MuiDividerModule, MuiFormModule, MarinaUtilModule, StatusTagComponent]
})
export class ValueSetListExpandedRowComponent implements OnInit {
  private valueSetService = inject(ValueSetService);

  public valueSet = input.required<ValueSet>();
  protected loadingVersions = signal(false);

  public ngOnInit(): void {
    const valueSet = this.valueSet();
    if (!valueSet?.id || valueSet.versions !== undefined) {
      return;
    }
    this.loadingVersions.set(true);
    this.valueSetService.searchVersions(valueSet.id, {limit: -1})
      .pipe(finalize(() => this.loadingVersions.set(false)))
      .subscribe(resp => valueSet.versions = resp.data);
  }
}
