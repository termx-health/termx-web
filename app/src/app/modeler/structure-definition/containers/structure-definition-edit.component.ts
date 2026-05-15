import {Component, OnInit, ViewChild, inject} from '@angular/core';
import {NgForm, FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {isDefined, LoadingManager, validateForm, ApplyPipe} from '@termx-health/core-util';
import {MuiNotificationService, MuiCardModule, MuiButtonModule, MuiFormModule, MuiInputModule, MuiSelectModule, MuiSpinnerModule, MuiMultiLanguageInputModule, MuiCheckboxModule, MuiIconModule} from '@termx-health/ui';
import {catchError, of, throwError} from 'rxjs';
import {TranslateService, TranslatePipe} from '@ngx-translate/core';
import {LocalizedName} from '@termx-health/util';
import slugify from 'slugify';
import {StructureDefinition} from 'term-web/modeler/_lib';
import {StructureDefinitionService} from 'term-web/modeler/structure-definition/services/structure-definition.service';
import {AuthService} from 'term-web/core/auth';
import {ConceptUtil, ValueSetVersionConcept, CodeSystemLibService, ValueSetLibService} from 'term-web/resources/_lib';
import {VsConceptUtil} from 'term-web/resources/_lib/value-set/util/vs-concept-util';
import {ResourceMultiLanguageViewComponent} from 'term-web/resources/resource/components/resource-multi-language-view.component';
import {SemanticVersionSelectComponent} from 'term-web/core/ui/components/inputs/version-select/semantic-version-select.component';
import {NzRowDirective, NzColDirective} from 'ng-zorro-antd/grid';

@Component({
    templateUrl: 'structure-definition-edit.component.html',
    imports: [
      NzRowDirective, NzColDirective, MuiCardModule, MuiButtonModule, FormsModule, MuiFormModule,
      MuiInputModule, MuiSelectModule, MuiSpinnerModule, MuiMultiLanguageInputModule, MuiCheckboxModule,
      MuiIconModule, ResourceMultiLanguageViewComponent, TranslatePipe, ApplyPipe, SemanticVersionSelectComponent
    ]
})
export class StructureDefinitionEditComponent implements OnInit {
  private structureDefinitionService = inject(StructureDefinitionService);
  private notificationService = inject(MuiNotificationService);
  private translateService = inject(TranslateService);
  private codeSystemService = inject(CodeSystemLibService);
  private valueSetService = inject(ValueSetLibService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public id?: number | null;
  public structureDefinition: StructureDefinition;
  protected loader = new LoadingManager();
  public mode: 'edit' | 'add' = 'add';
  protected viewMode = false;
  protected canEdit = false;
  protected customPublisher = false;
  protected publishers: ValueSetVersionConcept[] = [];

  @ViewChild("form") public form?: NgForm;

  public ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.has('id') ? Number(this.route.snapshot.paramMap.get('id')) : null;
    this.mode = this.id ? 'edit' : 'add';
    this.viewMode = this.route.snapshot.routeConfig?.path?.includes('/details');

    if (this.mode === 'add') {
      this.structureDefinition = new StructureDefinition();
      this.structureDefinition.contentType = 'logical';
      this.structureDefinition.contentFormat = 'json';
    }

    if (this.mode === 'edit') {
      this.canEdit = this.authService.hasPrivilege(this.id + '.StructureDefinition.write');
      this.loader.wrap('init', this.structureDefinitionService.load(this.id!).pipe(
        catchError(err => {
          this.notificationService.error('Failed to load structure definition', err?.error?.message || err?.message || 'Unknown error');
          return of(null as any);
        })
      )).subscribe(sd => {
        if (!sd) return;
        this.structureDefinition = sd;
        this.loadPublishers();
      });
    } else {
      this.loadPublishers();
    }
  }

  protected titleChanged(title: LocalizedName): void {
    if (!isDefined(title) || this.mode === 'edit') {
      return;
    }
    const lang = this.translateService.currentLang;
    const t = title[lang] ? title[lang].toLowerCase() : Object.values(title)?.[0]?.toLowerCase();
    if (t) {
      const correctedText = t.replace(/ü/g, 'y');
      this.structureDefinition.code = slugify(correctedText);
    }
  }

  protected publisherChanged(publisher: string): void {
    if (!isDefined(publisher) || isDefined(this.publishers.find(p => p.concept?.code === publisher && p['_custom']))) {
      return;
    }
    this.codeSystemService.loadConcept('publisher', publisher).subscribe(concept => {
      const version = ConceptUtil.getLastVersion(concept);
      if (version) {
        const uri = version.propertyValues?.find(pv => pv.entityProperty === 'uri')?.value;
        this.structureDefinition.url = uri && this.structureDefinition.code ? [uri, 'StructureDefinition', this.structureDefinition.code].join('/') : this.structureDefinition.url;
      }
    });
  }

  protected getDisplay = (concept: ValueSetVersionConcept): string => {
    return VsConceptUtil.getDisplay(concept, this.translateService.currentLang);
  };

  private loadPublishers(): void {
    this.valueSetService.expand({valueSet: 'publisher'}).pipe(
      catchError((err) => err?.status === 403 ? of([]) : throwError(() => err))
    ).subscribe(exp => {
      this.publishers = exp;
      if (this.structureDefinition.publisher && !exp.find(e => e.concept?.code === this.structureDefinition.publisher)) {
        const customPublisher = {concept: {code: this.structureDefinition.publisher}};
        customPublisher['_custom'] = true;
        this.publishers = [...this.publishers, customPublisher];
      }
    });
  }

  public save(): void {
    if (isDefined(this.form) && !validateForm(this.form)) {
      return;
    }
    this.loader.wrap('save', this.structureDefinitionService.save(this.structureDefinition)).subscribe(sd => {
      this.router.navigate(['/modeler/structure-definitions', sd.id, 'summary']);
    });
  }

  protected openEdit(): void {
    if (this.id) {
      this.router.navigate(['/modeler/structure-definitions', this.id, 'edit']);
    }
  }
}
