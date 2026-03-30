import { Component, EventEmitter, Output, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { DestroyService, LoadingManager, isDefined, ApplyPipe } from '@termx-health/core-util';
import {Observable, map, switchMap} from 'rxjs';
import {ValueSetService} from 'term-web/resources/value-set/services/value-set.service';
import {ValueSetVersion, ValueSetVersionRule, CodeSystemVersion} from 'term-web/resources/_lib';
import { MuiModalModule, MarinPageLayoutModule, MuiFormModule, MuiDatePickerModule, MuiButtonModule } from '@termx-health/ui';
import { AsyncPipe } from '@angular/common';
import { SemanticVersionSelectComponent } from 'term-web/core/ui/components/inputs/version-select/semantic-version-select.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'tw-value-set-version-save-modal',
    templateUrl: './value-set-version-save-modal-component.html',
    providers: [DestroyService],
    imports: [MuiModalModule, MarinPageLayoutModule, FormsModule, MuiFormModule, SemanticVersionSelectComponent, MuiDatePickerModule, MuiButtonModule, AsyncPipe, TranslatePipe, ApplyPipe]
})
export class ValueSetVersionSaveModalComponent {
  private valueSetService = inject(ValueSetService);

  @Output() public created: EventEmitter<boolean> = new EventEmitter();

  public modalVisible = false;
  public params: {version?: string, releaseDate?: Date, valueSet: string, codeSystem: string, codeSystemVersion: CodeSystemVersion};
  protected loader = new LoadingManager();

  @ViewChild("form") public form?: NgForm;

  public toggleModal(params?: any): void {
    this.modalVisible = !!params;
    this.params = params;
  }

  protected versions = (id): Observable<string[]> => {
    return this.valueSetService.searchVersions(id, {limit: -1}).pipe(map(r => r.data.map(d => d.version)));
  };

  public saveVersion(): void {
    if (!this.isValid()) {
      return;
    }
    const vsv: ValueSetVersion = {
      version: this.params.version,
      valueSet: this.params.valueSet,
      releaseDate: this.params.releaseDate,
      algorithm: this.params.codeSystemVersion?.algorithm,
      preferredLanguage: this.params.codeSystemVersion?.preferredLanguage,
      supportedLanguages: this.params.codeSystemVersion?.supportedLanguages,
      status: 'draft'
    };
    const rule: ValueSetVersionRule = {codeSystem: this.params.codeSystem, codeSystemVersion: {id: this.params.codeSystemVersion.id}, type: 'include'};
    this.loader.wrap('save',
      this.valueSetService.saveValueSetVersion(this.params.valueSet, vsv).pipe(switchMap(ver =>
        this.valueSetService.saveRule(ver.valueSet, ver.version, rule)))).subscribe(() => {
      this.toggleModal();
      this.created.emit(true);
    });
  }

  protected isValid = (): boolean => {
    return isDefined(this.params?.valueSet) && isDefined(this.params?.version) && isDefined(this.params?.releaseDate)
      && isDefined(this.params?.codeSystem) && isDefined(this.params?.codeSystemVersion?.id);
  };
}
