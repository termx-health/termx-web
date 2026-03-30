import {Component, OnInit, ViewChild, inject} from '@angular/core';
import {NgForm, FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {isDefined, LoadingManager, validateForm, ApplyPipe} from '@kodality-web/core-util';
import {AsyncPipe} from '@angular/common';
import {MuiFormModule, MuiSpinnerModule, MuiCardModule, MuiInputModule, MuiDatePickerModule, MuiSelectModule, MuiButtonModule, MuiIconModule, MuiMultiLanguageInputModule} from '@kodality-web/marina-ui';
import {SemanticVersionSelectComponent} from 'term-web/core/ui/components/inputs/version-select/semantic-version-select.component';
import {forkJoin, map, Observable} from 'rxjs';
import {StructureDefinition, StructureDefinitionVersion} from 'term-web/modeler/_lib';
import {StructureDefinitionService} from 'term-web/modeler/structure-definition/services/structure-definition.service';
import {ResourceContextComponent} from 'term-web/resources/resource/components/resource-context.component';
import {StatusTagComponent} from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
    templateUrl: 'structure-definition-version-edit.component.html',
    imports: [
      ResourceContextComponent, MuiFormModule, MuiSpinnerModule, MuiCardModule, MuiInputModule,
      MuiDatePickerModule, MuiSelectModule, MuiButtonModule, MuiIconModule, MuiMultiLanguageInputModule,
      FormsModule, StatusTagComponent, TranslatePipe, SemanticVersionSelectComponent, AsyncPipe, ApplyPipe
    ]
})
export class StructureDefinitionVersionEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private structureDefinitionService = inject(StructureDefinitionService);

  protected structureDefinition?: StructureDefinition;
  protected versions?: StructureDefinitionVersion[];
  protected version?: StructureDefinitionVersion;
  protected loader = new LoadingManager();
  protected mode: 'add' | 'edit' = 'add';

  @ViewChild("form") public form?: NgForm;

  public ngOnInit(): void {
    this.sdId = Number(this.route.snapshot.paramMap.get('id'));
    const id = this.sdId;
    const versionCode = this.route.snapshot.paramMap.get('versionCode');

    if (isDefined(versionCode)) {
      this.mode = 'edit';
      this.loader.wrap('load',
        forkJoin([
          this.structureDefinitionService.load(id),
          this.structureDefinitionService.loadVersion(id, versionCode),
          this.structureDefinitionService.listVersions(id)
        ])
      ).subscribe(([sd, version, versions]) => {
        this.structureDefinition = sd;
        this.version = version;
        this.versions = versions;
      });
    } else {
      this.structureDefinitionService.load(id).subscribe(sd => {
        this.structureDefinition = sd;
        this.version = this.writeVersion(new StructureDefinitionVersion());
      });
    }
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loader.wrap('save', this.structureDefinitionService.saveVersion(this.structureDefinition.id, this.version))
      .subscribe(ver => this.router.navigate(['/modeler/structure-definitions', this.structureDefinition.id, 'versions', ver.version, 'summary'], {replaceUrl: true}));
  }

  protected sdId: number;

  protected existingVersions = (id: number): Observable<string[]> => {
    return this.structureDefinitionService.listVersions(id).pipe(map(vs => vs.map(v => v.version)));
  };

  private writeVersion(version: StructureDefinitionVersion): StructureDefinitionVersion {
    version.status ??= 'draft';
    version.contentFormat ??= 'json';
    version.contentType ??= 'logical';
    return version;
  }
}
