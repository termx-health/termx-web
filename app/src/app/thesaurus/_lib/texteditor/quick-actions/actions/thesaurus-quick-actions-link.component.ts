import {Component, forwardRef, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {validateForm} from '@kodality-web/core-util';
import {TranslateService} from '@ngx-translate/core';
import {Page} from '../../../page/models/page';
import {ThesaurusQuickActionDefinition, ThesaurusQuickActionsBaseComponent} from '../thesaurus-quick-actions-base.directive';
import {Space} from 'term-web/space/_lib';
import {PreferencesService} from 'term-web/core/preferences/preferences.service';


@Component({
  selector: 'tw-link-modal',
  template: `
    <m-modal #modal [(mVisible)]="modalVisible" (mClose)="toggleModal(false)">
      <ng-container *m-modal-header>
        {{'web.thesaurus-page.link-modal.header' | translate}}
      </ng-container>

      <ng-container *m-modal-content>
        <form *ngIf="data">
          <m-form-item mName="linkName" mLabel="web.thesaurus-page.link-modal.link-name" required>
            <m-input [(ngModel)]="data.name" name="linkName" required/>
          </m-form-item>

          <m-form-item mName="type">
            <m-radio-group name="type" [(ngModel)]="data.linkType">
              <label m-radio-button mValue="url">{{'web.thesaurus-page.link-modal.url' | translate}}</label>
              <label m-radio-button mValue="page">{{'web.thesaurus-page.link-modal.page' | translate}}</label>
              <label m-radio-button mValue="resource">{{'web.thesaurus-page.link-modal.resource' | translate}}</label>
            </m-radio-group>
          </m-form-item>

          <ng-container [ngSwitch]="data.linkType">
            <m-form-item *ngSwitchCase="'url'" mName="link" mLabel="web.thesaurus-page.link-modal.url" required>
              <m-input [(ngModel)]="data.link" name="link" required/>
            </m-form-item>

            <m-form-row *ngSwitchCase="'page'">
              <ng-container *ngIf="{spaceSelectVisible: false} as d">
                <ng-container *ngIf="d.spaceSelectVisible">
                  <m-form-item *mFormCol mName="space" mLabel="web.thesaurus-page.link-modal.space">
                    <tw-space-select [(ngModel)]="data.space" name="space" autofocus/>
                  </m-form-item>
                </ng-container>

                <m-form-item *mFormCol mName="page" mLabel="web.thesaurus-page.link-modal.page" required>
                  <tw-page-select [(ngModel)]="data.page" name="page" [spaceId]="data.space?.id ?? preferences.spaceId" required/>
                  <a *ngIf="!d.spaceSelectVisible" (mClick)="d.spaceSelectVisible = true" style="font-size: 0.85rem">
                    {{'web.thesaurus-page.link-modal.search-externally' | translate}}
                  </a>
                </m-form-item>
              </ng-container>
            </m-form-row>

            <ng-container *ngSwitchCase="'resource'">
              <m-form-item mName="resource" mLabel="web.thesaurus-page.link-modal.resource-type" required>
                <m-select [(ngModel)]="data.resourceType" name="resource" required>
                  <m-option mLabel="CodeSystem" [mValue]="'cs'"/>
                  <m-option mLabel="ValueSet" [mValue]="'vs'"/>
                  <m-option mLabel="MapSet" [mValue]="'ms'"/>
                  <m-option mLabel="Concept" [mValue]="'concept'"/>
                </m-select>
              </m-form-item>

              <m-form-item *ngIf="data.resourceType === 'cs'" mName="codeSystem" mLabel="web.thesaurus-page.link-modal.code-system" required>
                <tw-code-system-search [(ngModel)]="data.resource" name="codeSystem" valuePrimitive required/>
              </m-form-item>

              <m-form-item *ngIf="data.resourceType === 'vs'" mName="valueSet" mLabel="web.thesaurus-page.link-modal.value-set" required>
                <tw-value-set-search [(ngModel)]="data.resource" name="valueSet" valuePrimitive required/>
              </m-form-item>

              <m-form-item *ngIf="data.resourceType === 'ms'" mName="mapSet" mLabel="web.thesaurus-page.link-modal.map-set" required>
                <tw-map-set-search [(ngModel)]="data.resource" name="mapSet" valuePrimitive required/>
              </m-form-item>

              <m-form-item *ngIf="data.resourceType === 'concept'"
                  mName="conceptCodeSystem"
                  mLabel="web.thesaurus-page.link-modal.concept-code-system"
                  required
              >
                <tw-code-system-search [(ngModel)]="data.conceptCodeSystem" name="conceptCodeSystem" valuePrimitive required/>
              </m-form-item>

              <m-form-item *ngIf="data.resourceType === 'concept' && data.conceptCodeSystem"
                  mName="concept"
                  mLabel="web.thesaurus-page.link-modal.concept"
                  required
              >
                <div *ngIf="data.conceptCodeSystem === 'snomed-ct' && data.resource">
                  <label>{{data.resource}}</label>
                  <m-icon style="cursor: pointer; margin-left: 0.5rem" mCode="close" (click)="data.resource = null"></m-icon>
                </div>

                <tw-term-concept-search [(ngModel)]="data.resource"
                    [codeSystem]="data.conceptCodeSystem"
                    valueType="code"
                    name="concept"
                    required
                ></tw-term-concept-search>
              </m-form-item>
            </ng-container>
          </ng-container>
        </form>
      </ng-container>

      <div *m-modal-footer class="m-items-middle">
        <m-button mDisplay="text" (click)="cancel()">{{'core.btn.close' | translate}}</m-button>
        <m-button mDisplay="primary" (click)="confirm()">{{'core.btn.confirm' | translate}}</m-button>
      </div>
    </m-modal>
  `,
  providers: [{
    provide: ThesaurusQuickActionsBaseComponent,
    useExisting: forwardRef(() => ThesaurusQuickActionsLinkComponent)
  }]
})
export class ThesaurusQuickActionsLinkComponent extends ThesaurusQuickActionsBaseComponent {
  public definition: Omit<ThesaurusQuickActionDefinition, 'result'> = {
    id: '_md_link',
    name: 'Link',
    icon: 'link',
    description: 'Insert a link',

  };

  protected data: LinkModalData;
  protected modalVisible: boolean;
  @ViewChild(NgForm) private form?: NgForm;

  public constructor(
    private translateService: TranslateService,
    protected preferences: PreferencesService
  ) {
    super();
  }

  public override handle(): void {
    this.toggleModal(true);
  }


  protected toggleModal(visible: boolean): void {
    this.modalVisible = visible;

    if (!this.modalVisible) {
      this.resolve.next(undefined);
    }

    if (this.modalVisible) {
      this.data = {linkType: 'url'};
    }
  }

  protected cancel(): void {
    this.toggleModal(false);
  }

  protected confirm(): void {
    if (!validateForm(this.form)) {
      return;
    }

    const link = this.composePageRelationLink(this.data);
    this.resolve.next(this.data.name ? `[${this.data.name}](${link})` : link);

    this.modalVisible = false;
  }


  private composePageRelationLink(data: LinkModalData): string | undefined {
    if (data.linkType === 'url') {
      return data.link;
    }

    if (data.linkType === 'page') {
      const content = data.page?.contents?.find(c => c.lang === this.translateService.currentLang) || data.page?.contents?.[0];
      return `page:${data.space ? data.space.code + '/' : ''}${content.slug}`;
    }

    if (data.linkType === 'resource') {
      if (data.resourceType && ['cs', 'vs', 'ms'].includes(data.resourceType)) {
        return `${data.resourceType}:${data.resource}`;
      }
      if ('concept' === data.resourceType) {
        return `${data.resourceType}:${data.conceptCodeSystem}|${data.resource}`;
      }
    }
  }
}

export class LinkModalData {
  public name?: string;
  public linkType?: 'url' | 'resource' | 'page';
  public link?: string;
  public page?: Page;
  public space?: Space;
  public resourceType?: 'cs' | 'vs' | 'ms' | 'concept';
  public resource?: any;
  public conceptCodeSystem?: string;
}
