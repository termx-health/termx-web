import {Component, forwardRef, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {validateForm} from '@kodality-web/core-util';
import {PreferencesService} from 'term-web/core/preferences/preferences.service';
import {Space} from 'term-web/sys/_lib/space';
import {PageContent} from '../../../page/models/page-content';
import {WikiQuickActionDefinition, WikiQuickActionsBaseComponent} from './wiki-quick-actions.base';


@Component({
  selector: 'tw-wiki-link-action',
  template: `
    <m-modal #modal [(mVisible)]="modalVisible" (mClose)="toggleModal(false)">
      <ng-container *m-modal-header>
        {{'web.wiki-page.texteditor.quick-actions.link-modal.header' | translate}}
      </ng-container>

      <ng-container *m-modal-content>
        <form *ngIf="data">
          <m-form-item mName="linkName" mLabel="web.wiki-page.texteditor.quick-actions.link-modal.link-name" required>
            <m-input [(ngModel)]="data.name" name="linkName" required/>
          </m-form-item>

          <m-form-item mName="type">
            <m-radio-group name="type" [(ngModel)]="data.linkType">
              <label m-radio-button mValue="url">{{'web.wiki-page.texteditor.quick-actions.link-modal.url' | translate}}</label>
              <label m-radio-button mValue="page">{{'web.wiki-page.texteditor.quick-actions.link-modal.page' | translate}}</label>
              <label m-radio-button mValue="resource">{{'web.wiki-page.texteditor.quick-actions.link-modal.resource' | translate}}</label>
            </m-radio-group>
          </m-form-item>

          <ng-container [ngSwitch]="data.linkType">
            <m-form-item *ngSwitchCase="'url'" mName="link" mLabel="web.wiki-page.texteditor.quick-actions.link-modal.url" required>
              <m-input [(ngModel)]="data.link" name="link" required/>
            </m-form-item>

            <m-form-row *ngSwitchCase="'page'">
              <ng-container *ngIf="{spaceSelectVisible: false} as d">
                <ng-container *ngIf="d.spaceSelectVisible">
                  <m-form-item *mFormCol mName="space" mLabel="web.wiki-page.texteditor.quick-actions.link-modal.space">
                    <tw-space-select [(ngModel)]="data.space" name="space" autofocus/>
                  </m-form-item>
                </ng-container>

                <m-form-item *mFormCol mName="page" mLabel="web.wiki-page.texteditor.quick-actions.link-modal.page" required>
                  <tw-page-content-select [(ngModel)]="data.pageContent" name="page" [spaceId]="data.space?.id ?? preferences.spaceId" required/>
                  <a *ngIf="!d.spaceSelectVisible" (mClick)="d.spaceSelectVisible = true" style="font-size: 0.85rem">
                    {{'web.wiki-page.texteditor.quick-actions.link-modal.search-externally' | translate}}
                  </a>
                </m-form-item>
              </ng-container>
            </m-form-row>

            <ng-container *ngSwitchCase="'resource'">
              <m-form-item mName="resource" mLabel="web.wiki-page.texteditor.quick-actions.link-modal.resource-type" required>
                <m-select [(ngModel)]="data.resourceType" name="resource" required>
                  <m-option mLabel="CodeSystem" [mValue]="'cs'"/>
                  <m-option mLabel="ValueSet" [mValue]="'vs'"/>
                  <m-option mLabel="MapSet" [mValue]="'ms'"/>
                  <m-option mLabel="Concept" [mValue]="'concept'"/>
                </m-select>
              </m-form-item>

              <m-form-item *ngIf="data.resourceType === 'cs'" mName="codeSystem" mLabel="web.wiki-page.texteditor.quick-actions.link-modal.code-system" required>
                <tw-code-system-search [(ngModel)]="data.resource" name="codeSystem" valuePrimitive required/>
              </m-form-item>

              <m-form-item *ngIf="data.resourceType === 'vs'" mName="valueSet" mLabel="web.wiki-page.texteditor.quick-actions.link-modal.value-set" required>
                <tw-value-set-search [(ngModel)]="data.resource" name="valueSet" valuePrimitive required/>
              </m-form-item>

              <m-form-item *ngIf="data.resourceType === 'ms'" mName="mapSet" mLabel="web.wiki-page.texteditor.quick-actions.link-modal.map-set" required>
                <tw-map-set-search [(ngModel)]="data.resource" name="mapSet" valuePrimitive required/>
              </m-form-item>

              <m-form-item *ngIf="data.resourceType === 'concept'"
                  mName="conceptCodeSystem"
                  mLabel="web.wiki-page.texteditor.quick-actions.link-modal.concept-code-system"
                  required
              >
                <tw-code-system-search [(ngModel)]="data.conceptCodeSystem" name="conceptCodeSystem" valuePrimitive required/>
              </m-form-item>

              <m-form-item *ngIf="data.resourceType === 'concept' && data.conceptCodeSystem"
                  mName="concept"
                  mLabel="web.wiki-page.texteditor.quick-actions.link-modal.concept"
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
    provide: WikiQuickActionsBaseComponent,
    useExisting: forwardRef(() => WikiQuickActionsLinkComponent)
  }]
})
export class WikiQuickActionsLinkComponent extends WikiQuickActionsBaseComponent {
  public definition: Omit<WikiQuickActionDefinition, 'result'> = {
    id: '_md_link',
    name: 'Link',
    icon: 'link',
    description: 'Insert a link'
  };

  protected data: LinkModalData;
  protected modalVisible: boolean;
  @ViewChild(NgForm) private form?: NgForm;

  public constructor(
    protected preferences: PreferencesService
  ) {
    super();
  }

  public override handle(): void {
    this.toggleModal(true);
  }


  protected toggleModal(visible: boolean): void {
    if (this.modalVisible === visible) {
      return;
    }

    this.modalVisible = visible;
    if (this.modalVisible) {
      this.data = {linkType: 'url'};
    } else {
      this.resolve.next(undefined);
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
    switch (data.linkType) {
      case 'url':
        return data.link;
      case 'page':
        return `page:${data.space ? data.space.code + '/' : ''}${data.pageContent.slug}`;
      case 'resource':
        switch (data.resourceType) {
          case 'cs':
          case 'vs':
          case 'ms':
            return `${data.resourceType}:${data.resource}`;
          case 'csv':
            return `${data.resourceType}:${data.versionCodeSystem}|${data.resource}`;
          case 'vsv':
            return `${data.resourceType}:${data.versionValueSet}|${data.resource}`;
          case 'msv':
            return `${data.resourceType}:${data.versionMapSet}|${data.resource}`;
          case 'concept':
            return `${data.resourceType}:${data.conceptCodeSystem}|${data.resource}`;
        }
    }
  }
}

export class LinkModalData {
  public name?: string;
  public linkType?: 'url' | 'resource' | 'page';
  public link?: string;
  public pageContent?: PageContent;
  public space?: Space;
  public resourceType?: 'cs' | 'csv' | 'vs' | 'vsv' | 'ms' | 'msv' | 'concept';
  public resource?: any;
  public conceptCodeSystem?: string;
  public versionCodeSystem?: string;
  public versionValueSet?: string;
  public versionMapSet?: string;
}
