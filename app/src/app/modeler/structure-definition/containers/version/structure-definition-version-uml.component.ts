import {Component, OnInit, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {LoadingManager} from '@termx-health/core-util';
import {MuiNotificationService, MuiCardModule, MuiButtonModule, MuiFormModule, MuiInputModule, MuiSelectModule, MuiCheckboxModule, MuiIconModule, MuiSpinnerModule, MuiTooltipModule, MuiNoDataModule, MarinPageLayoutModule} from '@termx-health/ui';
import {forkJoin, map, Observable, of} from 'rxjs';
import {Fhir} from 'fhir/fhir';
import {ChefService, FhirToUmlRequest, FhirUmlConverterService, UmlExport} from 'term-web/integration/_lib';
import {StructureDefinition, StructureDefinitionVersion} from 'term-web/modeler/_lib';
import {StructureDefinitionService} from 'term-web/modeler/structure-definition/services/structure-definition.service';
import {ResourceContextComponent} from 'term-web/resources/resource/components/resource-context.component';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  templateUrl: 'structure-definition-version-uml.component.html',
  imports: [
    ResourceContextComponent, MuiCardModule, MuiButtonModule, MuiFormModule, MuiInputModule, MuiSelectModule,
    MuiCheckboxModule, MuiIconModule, MuiSpinnerModule, MuiTooltipModule, MuiNoDataModule, MarinPageLayoutModule,
    FormsModule, TranslatePipe
  ]
})
export class StructureDefinitionVersionUmlComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private structureDefinitionService = inject(StructureDefinitionService);
  private chefService = inject(ChefService);
  private fhirUmlConverterService = inject(FhirUmlConverterService);
  private notificationService = inject(MuiNotificationService);
  private sanitizer = inject(DomSanitizer);

  protected structureDefinition?: StructureDefinition;
  protected versions?: StructureDefinitionVersion[];
  protected version?: StructureDefinitionVersion;
  protected contentFhir?: string;

  protected request = new FhirToUmlRequest();
  protected readonly views = ['Snapshot', 'Differential'];
  protected readonly exports: UmlExport[] = ['SVG', 'PNG', 'Text file'];

  protected imageUrl?: SafeUrl;
  protected umlText?: string;
  private generatedBlob?: Blob;
  private objectUrl?: string;
  protected generatedExportAs?: UmlExport;
  protected loader = new LoadingManager();

  public ngOnInit(): void {
    this.route.paramMap.subscribe(pm => this.loadData(Number(pm.get('id')), pm.get('versionCode')));
  }

  protected get isImageResponse(): boolean {
    return this.generatedExportAs === 'SVG' || this.generatedExportAs === 'PNG';
  }

  private loadData(id: number, versionCode: string): void {
    this.clearResult();
    this.loader.wrap('load', forkJoin([
      this.structureDefinitionService.load(id),
      this.structureDefinitionService.loadVersion(id, versionCode),
      this.structureDefinitionService.listVersions(id)
    ])).subscribe(([sd, version, versions]) => {
      this.structureDefinition = sd;
      this.version = version;
      this.versions = versions;
      this.request.attachmentFilename = sd?.code || 'structure-definition';
      this.resolveFhir(version).subscribe();
    });
  }

  /** Ensure we have the version's FHIR JSON (convert from FSH when the content is stored as FSH). */
  private resolveFhir(version: StructureDefinitionVersion): Observable<void> {
    let content = version?.content;
    if (!content) {
      this.contentFhir = undefined;
      return of(undefined);
    }
    if (version.contentFormat === 'json') {
      if (content.startsWith('<')) {
        content = String(new Fhir().xmlToObj(content));
      }
      this.contentFhir = content;
      return of(undefined);
    }
    // Request a generated snapshot: the FHIR->UML converter renders from the snapshot, but
    // FSH-authored definitions (logical models, profiles) ship only a differential otherwise.
    return this.loader.wrap('content', this.chefService.fshToFhirV2(content, {snapshot: true}).pipe(map(r => {
      r.errors?.forEach(e => this.notificationService.error('FSH to FHIR conversion failed', e.message!, {duration: 0, closable: true}));
      this.contentFhir = JSON.stringify(r.fhir?.[0], null, 2);
    })));
  }

  public generate(): void {
    if (!this.contentFhir) {
      this.notificationService.warning('No content', 'This version has no FHIR content to render.');
      return;
    }
    this.clearResult();
    this.request.payload = this.contentFhir;
    this.loader.wrap('generate', this.fhirUmlConverterService.fhirToUml(this.request)).subscribe({
      next: resp => {
        this.generatedExportAs = this.request.exportAs;
        this.generatedBlob = resp.body;
        if (this.isImageResponse) {
          this.objectUrl = URL.createObjectURL(resp.body);
          this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(this.objectUrl);
        } else {
          resp.body.text().then(t => this.umlText = t);
        }
      },
      error: err => this.handleError(err)
    });
  }

  public download(): void {
    if (!this.generatedBlob) {
      return;
    }
    const ext = this.generatedExportAs === 'PNG' ? 'png' : this.generatedExportAs === 'SVG' ? 'svg' : 'txt';
    const url = URL.createObjectURL(this.generatedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.request.attachmentFilename || 'output'}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private clearResult(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = undefined;
    }
    this.imageUrl = undefined;
    this.umlText = undefined;
    this.generatedBlob = undefined;
    this.generatedExportAs = undefined;
  }

  private handleError(err: any): void {
    if (err?.error instanceof Blob && err.error.type?.includes('application/json')) {
      err.error.text().then((t: string) => {
        let msg = t;
        try {
          const parsed = JSON.parse(t);
          msg = parsed?.message || parsed?.error || t;
        } catch {
          // keep raw text
        }
        this.notificationService.error('Generation failed', msg);
      });
    } else {
      this.notificationService.error('Generation failed', 'An error occurred while generating the UML diagram.');
    }
  }
}
