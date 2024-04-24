import {Component, EventEmitter, Output, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {DestroyService, LoadingManager, isDefined} from '@kodality-web/core-util';
import {Observable, map, switchMap} from 'rxjs';
import {ValueSetService} from 'app/src/app/resources/value-set/services/value-set.service';
import {ValueSetVersion, ValueSetVersionRule} from 'term-web/resources/_lib';

@Component({
  selector: 'tw-value-set-version-save-modal',
  templateUrl: './value-set-version-save-modal-component.html',
  providers: [DestroyService]
})
export class ValueSetVersionSaveModalComponent {
  @Output() public created: EventEmitter<boolean> = new EventEmitter();

  public modalVisible = false;
  public params: {version?: string, releaseDate?: Date, valueSet: string, codeSystem: string, codeSystemVersionId: number};
  protected loader = new LoadingManager();

  @ViewChild("form") public form?: NgForm;

  public constructor(private valueSetService: ValueSetService) {}

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
      status: 'draft'
    };
    const rule: ValueSetVersionRule = {codeSystem: this.params.codeSystem, codeSystemVersion: {id: this.params.codeSystemVersionId}, type: 'include'};
    this.loader.wrap('save',
      this.valueSetService.saveValueSetVersion(this.params.valueSet, vsv).pipe(switchMap(ver =>
        this.valueSetService.saveRule(ver.valueSet, ver.version, rule)))).subscribe(() => {
      this.toggleModal();
      this.created.emit(true);
    });
  }

  protected isValid = (): boolean => {
    return isDefined(this.params?.valueSet) && isDefined(this.params?.version) && isDefined(this.params?.releaseDate)
      && isDefined(this.params?.codeSystem) && isDefined(this.params?.codeSystemVersionId);
  };
}
