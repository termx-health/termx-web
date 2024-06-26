import {Component, forwardRef, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {validateForm} from '@kodality-web/core-util';
import {Template} from '../../../template/models/template';
import {TemplateLibService} from '../../../template/services/template-lib.service';
import {WikiQuickActionDefinition, WikiQuickActionsBaseComponent} from './wiki-quick-actions.base';


@Component({
  selector: 'tw-wiki-template-action',
  template: `
    <m-modal #modal [(mVisible)]="modalVisible" (mClose)="toggleModal(false)">
      <ng-container *m-modal-header>
        {{'web.wiki-page.texteditor.quick-actions.template-modal.header' | translate}}
      </ng-container>

      <ng-container *m-modal-content>
        <form *ngIf="data">
          <m-form-item mName="template" mLabel="web.wiki-page.texteditor.quick-actions.template-modal.template" required>
            <m-select [(ngModel)]="data.template" compareWith="id" name="template" required>
              <m-option *ngFor="let template of templates" [mLabel]="template.code" [mValue]="template"></m-option>
            </m-select>
          </m-form-item>
        </form>
      </ng-container>

      <div *m-modal-footer class="m-items-middle">
        <m-button mDisplay="text" (click)="cancel()">{{'core.btn.close' | translate}}</m-button>
        <m-button mDisplay="primary" (click)="confirm()">{{'core.btn.confirm' | translate}}</m-button>
      </div>
    </m-modal>
  `,
  providers: [{
    provide: WikiQuickActionsBaseComponent,
    useExisting: forwardRef(() => WikiQuickActionsTemplateComponent)
  }]
})
export class WikiQuickActionsTemplateComponent extends WikiQuickActionsBaseComponent implements OnInit {
  public definition: Omit<WikiQuickActionDefinition, 'result'> = {
    id: '_md_template',
    name: 'Template',
    icon: 'file-text',
    description: 'Insert template'
  };

  protected data: ModalData;
  protected modalVisible: boolean;
  protected templates?: Template[];
  protected lang: string;
  @ViewChild(NgForm) protected form: NgForm;

  public constructor(
    private templateService: TemplateLibService
  ) {
    super();
  }

  public ngOnInit(): void {
    this.templateService.searchTemplates({limit: 999}).subscribe(t => this.templates = t.data);
  }


  public override handle(ctx: {lang?: string}): void {
    this.lang = ctx.lang;
    this.toggleModal(true);
  }

  protected cancel(): void {
    this.toggleModal(false);
  }

  protected confirm(): void {
    if (validateForm(this.form)) {
      this.resolve.next(this.data.template.contents?.find(c => c.lang === this.lang)?.content);
      this.modalVisible = false;
    }
  }


  protected toggleModal(visible: boolean): void {
    if (this.modalVisible === visible) {
      return;
    }

    this.modalVisible = visible;
    if (this.modalVisible) {
      this.data = {};
    } else {
      this.resolve.next(undefined);
    }
  }
}

class ModalData {
  public template?: Template;
}
