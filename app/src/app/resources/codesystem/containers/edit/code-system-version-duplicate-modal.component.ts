import {Component, EventEmitter, Output, ViewChild} from '@angular/core';
import {CodeSystemService} from '../../services/code-system.service';
import {NgForm} from '@angular/forms';
import {validateForm} from '@kodality-web/core-util';
import {CodeSystemVersion} from 'terminology-lib/resources';


@Component({
  selector: 'twa-code-system-version-duplicate-modal',
  templateUrl: './code-system-version-duplicate-modal.component.html',
})
export class CodeSystemVersionDuplicateModalComponent {
  @Output() public duplicated: EventEmitter<boolean> = new EventEmitter();

  public modalVisible = false;
  public params?: {targetCodeSystem?: string, targetVersion?: string, sourceCodeSystem?: string, sourceVersion?: CodeSystemVersion};

  @ViewChild("form") public form?: NgForm;

  public constructor(private codeSystemService: CodeSystemService) { }

  public toggleModal(params?: {targetCodeSystem: string, sourceCodeSystem?: string, sourceVersion?: CodeSystemVersion}): void {
    this.modalVisible = !!params;
    this.params = params;
  }

  public duplicate(): void {
    if (!validateForm(this.form)) {
      return;
    }
    const duplicateRequest = {codeSystem: this.params?.targetCodeSystem!, version: this.params?.targetVersion!};
    this.codeSystemService.duplicateCodeSystemVersion(this.params?.sourceCodeSystem!, this.params?.sourceVersion?.version!, duplicateRequest).subscribe(() => {
        this.duplicated.emit();
        this.toggleModal();
      }
    );
  }

}
