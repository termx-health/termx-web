import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {validateForm} from '@kodality-web/core-util';
import {TranslateService} from '@ngx-translate/core';
import {Template, TemplateLibService} from '@terminology/core';


@Component({
  selector: 'twa-template-modal',
  template: `
    <m-modal #modal [(mVisible)]="modalVisible" (mClose)="toggleModal(false)" [mMaskClosable]="false">
      <ng-container *m-modal-header>
        {{'web.thesaurus-page.template-modal.header' | translate}}
      </ng-container>

      <ng-container *m-modal-content>
        <form #form="ngForm" *ngIf="data">
          <m-form-item mName="template" mLabel="web.thesaurus-page.template-modal.template" required>
            <m-select [(ngModel)]="data.template" compareWith="id" name="template" required>
              <m-option *ngFor="let template of templates" [mLabel]="template.code" [mValue]="template"></m-option>
            </m-select>
          </m-form-item>
        </form>
      </ng-container>

      <div *m-modal-footer class="m-items-middle">
        <m-button mDisplay="text" (click)="toggleModal(false)">{{'core.btn.close' | translate}}</m-button>
        <m-button mDisplay="primary" (click)="confirm()">{{'core.btn.confirm' | translate}}</m-button>
      </div>
    </m-modal>
  `
})
export class ThesaurusTemplateModalComponent implements OnInit {
  @Input() public lang?: string;
  @Output() public templateComposed: EventEmitter<string> = new EventEmitter();

  public modalVisible = false;
  public templates?: Template[];
  public data?: ModalData;

  @ViewChild("form") public form?: NgForm;

  public constructor(
    public translateService: TranslateService,
    public templateService: TemplateLibService
  ) {}

  public ngOnInit(): void {
    this.loadTemplates();
  }

  public toggleModal(visible: boolean): void {
    if (this.modalVisible === visible) {
      return;
    }
    this.modalVisible = visible;

    if (!this.modalVisible) {
      this.templateComposed.emit();
    } else {
      this.data = {};
    }
  }

  public confirm(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.templateComposed.emit(this.data!.template!.contents?.find(c => c.lang === this.lang)?.content);
    this.modalVisible = false;
  }

  private loadTemplates(): void {
    this.templateService.searchTemplates({limit: 999}).subscribe(t => this.templates = t.data);
  }
}

export class ModalData {
  public template?: Template;
}
