import {Component, OnInit} from '@angular/core';
import {TransformationDefinition, TransformationDefinitionResource} from 'term-web/modeler/transformer/services/transformation-definition';
import {ActivatedRoute, Router} from '@angular/router';
import {TransformationDefinitionService} from 'term-web/modeler/transformer/services/transformation-definition.service';
import {Location} from '@angular/common';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {Observable, of} from 'rxjs';
import {remove} from '@kodality-web/core-util';

@Component({
  templateUrl: './transformation-definition-edit.component.html'
})
export class TransformationDefinitionEditComponent implements OnInit {
  public definition: TransformationDefinition;
  public selectedResource: TransformationDefinitionResource;
  public loading = false;

  public constructor(
    private route: ActivatedRoute,
    private transformationDefinitionService: TransformationDefinitionService,
    private location: Location,
    private router: Router,
    private notificationService: MuiNotificationService
  ) { }

  public ngOnInit(): void {
    this.loading = true;
    this.initDefinition().subscribe(r => {
      this.definition = r;
      this.selectedResource = r.mapping;
    }).add(() => this.loading = false);
  }

  public initDefinition(): Observable<TransformationDefinition> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!!id) {
      return this.transformationDefinitionService.load(Number(id));
    }

    const def = new TransformationDefinition();
    def.resources = [];
    def.mapping = {
      reference: {}
    };
    return of(def);
  }

  public save(): void {
    if (!TransformationDefinition.isValid(this.definition)) {
      this.notificationService.error('core.form-invalid');
      return;
    }
    this.cleanResource(this.definition.mapping);
    this.definition.resources.forEach(r => this.cleanResource(r));
    this.loading = true;
    this.transformationDefinitionService.save(this.definition)
      .subscribe(r => this.router.navigate(['/modeler/transformation-definitions', r.id, 'edit'], {replaceUrl: true}))
      .add(() => this.loading = false);
  }


  private cleanResource(r: TransformationDefinitionResource): void {
    r.reference = r.source === 'definition' ? {structureDefinitionId: r.reference.structureDefinitionId}
      : r.source === 'fhir' ? {fhirServer: r.reference.fhirServer, fhirResource: r.reference.fhirResource}
        : r.source === 'static' ? {content: r.reference.content}
          : {};
  }

  protected deleteResource(r: TransformationDefinitionResource): void {
    this.selectedResource = null;
    this.definition.resources = remove(this.definition.resources, r);
  }
}
