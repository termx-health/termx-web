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
  public sourceCodeSystem?: string;
  public sourceVersion?: CodeSystemVersion;
  public targetCodeSystem?: string;
  public targetVersion?: string;

  @ViewChild("form") public form?: NgForm;

  public constructor(private codeSystemService: CodeSystemService) { }

  public toggleModal(targetCodeSystem: string, sourceCodeSystem?: string, sourceVersion?: CodeSystemVersion): void {
    this.modalVisible = !this.modalVisible;
    this.sourceCodeSystem = sourceCodeSystem;
    this.sourceVersion = sourceVersion;
    this.targetCodeSystem = targetCodeSystem;
  }

  public closeModal(): void {
    this.modalVisible = false;
  }

  public duplicate(): void {
    if (!validateForm(this.form)) {
      return;
    }
    const duplicateRequest = {codeSystem: this.targetCodeSystem!, version: this.targetVersion!};
    this.codeSystemService.duplicateCodeSystemVersion(this.sourceCodeSystem!, this.sourceVersion?.version!, duplicateRequest).subscribe(() => {
        this.modalVisible = false;
        this.duplicated.emit();
      }
    );
  }

}
