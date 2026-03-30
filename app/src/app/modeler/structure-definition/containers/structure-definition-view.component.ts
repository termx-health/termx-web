import { Component, OnInit, inject } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {isDefined, LoadingManager} from '@termx-health/core-util';
import { MuiNotificationService, MuiCardModule, MuiSpinnerModule, MuiFormModule } from '@termx-health/ui';
import {Fhir} from 'fhir/fhir';
import {catchError, map, Observable, of} from 'rxjs';
import {ChefService} from 'term-web/integration/_lib';
import {StructureDefinition} from 'term-web/modeler/_lib';
import {StructureDefinitionService} from 'term-web/modeler/structure-definition/services/structure-definition.service';
import { NzRowDirective, NzColDirective } from 'ng-zorro-antd/grid';
import { NzTabsComponent, NzTabComponent, NzTabDirective } from 'ng-zorro-antd/tabs';
import { NgTemplateOutlet } from '@angular/common';
import { StructureDefinitionTreeComponent } from 'term-web/modeler/_lib/structure-definition/structure-definition-tree.component';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    templateUrl: 'structure-definition-view.component.html',
    imports: [NzRowDirective, NzColDirective, NzTabsComponent, NzTabComponent, NzTabDirective, NgTemplateOutlet, MuiCardModule, StructureDefinitionTreeComponent, MuiSpinnerModule, FormsModule, MuiFormModule, TranslatePipe]
})
export class StructureDefinitionViewComponent implements OnInit {
  private structureDefinitionService = inject(StructureDefinitionService);
  private notificationService = inject(MuiNotificationService);
  private route = inject(ActivatedRoute);
  private chefService = inject(ChefService);

  public id?: number | null;
  public structureDefinition: StructureDefinition;
  public contentFsh: string;
  public contentFhir: string;

  public selectedTabIndex: number = 0;
  public tabIndexMap = {fsh: 1, json: 2, element: 3};

  protected loader = new LoadingManager();

  public ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    const params = window.location.href.split('?')[1];
    if (isDefined(params) && params.includes('element')) {
      this.selectedTabIndex = this.tabIndexMap['element'];
    }
    this.loader.wrap('init', this.structureDefinitionService.load(this.id!).pipe(
      catchError(err => {
        this.notificationService.error('Failed to load structure definition', err?.error?.message || err?.message || 'Unknown error');
        return of(null as any);
      })
    )).subscribe(sd => {
      if (!sd) return;
      this.structureDefinition = sd;
      const contentObs = this.unmapContent(sd.content, sd.contentFormat);
      if (contentObs) {
        this.loader.wrap('init', contentObs).pipe(
          catchError(err => {
            this.notificationService.error('Failed to process content', err?.error?.message || err?.message || 'Unknown error');
            return of(undefined);
          })
        ).subscribe();
      }
      this.selectedTabIndex = this.selectedTabIndex === this.tabIndexMap['element'] ? this.selectedTabIndex : this.tabIndexMap[sd.contentFormat!] ?? 0;
    });

  }

  private unmapContent(content: string | null | undefined, format: 'fsh' | 'json'): Observable<void> | undefined {
    if (content == null || content === '') return undefined;
    if (format == 'json') {
      if (content.startsWith('<')) {
        content = String(new Fhir().xmlToObj(content));
      }
      if (content.startsWith('{')) {
        return this.chefService.fhirToFsh({fhir: [content]}).pipe(map(r => {
          this.showErrors(r);
          this.contentFhir = content;
          this.contentFsh = typeof r.fsh === 'string' ? r.fsh : JSON.stringify(r.fsh, null, 2);
        }));
      }
    }
    if (format == 'fsh') {
      return this.chefService.fshToFhir({fsh: content}).pipe(map(r => {
        this.showErrors(r);
        this.contentFsh = content;
        this.contentFhir = JSON.stringify(r.fhir[0], null, 2);
      }));
    }
    return undefined;
  }

  private showErrors(r: any): void {
    r.warnings?.forEach(w => this.notificationService.warning('Conversion warning', w.message!, {duration: 0, closable: true}));
    r.errors?.forEach(e => this.notificationService.error('Conversion failed!', e.message!, {duration: 0, closable: true}));
  }
}
