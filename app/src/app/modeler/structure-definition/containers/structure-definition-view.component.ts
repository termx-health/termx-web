import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {isDefined, LoadingManager} from '@kodality-web/core-util';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {Fhir} from 'fhir/fhir';
import {map, Observable} from 'rxjs';
import {ChefService} from 'term-web/integration/_lib';
import {StructureDefinition} from 'term-web/modeler/_lib';
import {StructureDefinitionService} from '../services/structure-definition.service';

@Component({
  templateUrl: 'structure-definition-view.component.html'
})
export class StructureDefinitionViewComponent implements OnInit {
  public id?: number | null;
  public structureDefinition: StructureDefinition;
  public contentFsh: string;
  public contentFhir: string;

  public selectedTabIndex: number = 0;
  public tabIndexMap = {fsh: 1, json: 2, element: 3};

  protected loader = new LoadingManager();

  public constructor(
    private structureDefinitionService: StructureDefinitionService,
    private notificationService: MuiNotificationService,
    private route: ActivatedRoute,
    private chefService: ChefService
  ) {}

  public ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    const params = window.location.href.split('?')[1];
    if (isDefined(params) && params.includes('element')) {
      this.selectedTabIndex = this.tabIndexMap['element'];
    }
    this.loader.wrap('init', this.structureDefinitionService.load(this.id!)).subscribe(sd => {
      this.structureDefinition = sd;
      this.loader.wrap('init', this.unmapContent(sd.content, sd.contentFormat)).subscribe();
      this.selectedTabIndex = this.selectedTabIndex === this.tabIndexMap['element'] ? this.selectedTabIndex : this.tabIndexMap[sd.contentFormat!];
    });

  }

  private unmapContent(content: string, format: 'fsh' | 'json'): Observable<void> {
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
  }

  private showErrors(r: any): void {
    r.warnings?.forEach(w => this.notificationService.warning('Conversion warning', w.message!, {duration: 0, closable: true}));
    r.errors?.forEach(e => this.notificationService.error('Conversion failed!', e.message!, {duration: 0, closable: true}));
  }
}
