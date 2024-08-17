import {Location} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {copyDeep} from '@kodality-web/core-util';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {Observable, of} from 'rxjs';
import {TransformationDefinition, TransformationDefinitionResource} from 'term-web/modeler/_lib/transformer/transformation-definition';
import {TransformationDefinitionService} from 'term-web/modeler/transformer/services/transformation-definition.service';

@Component({
  templateUrl: './transformation-definition-edit.component.html',
  styleUrls: ['./transformation-definition-edit.component.less']
})
export class TransformationDefinitionEditComponent implements OnInit {
  public definition: TransformationDefinition;
  public loading = false;


  public readonly types: TransformationDefinitionResource['type'][] = ['definition', 'conceptmap', 'mapping'];
  public selectedResourceType: TransformationDefinitionResource['type'] = 'definition';
  public selectedResource: TransformationDefinitionResource;

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
      this.definition.mapping.type = 'mapping';
      this.definition.mapping.name = 'main';
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
      type: 'mapping',
      reference: {}
    };
    return of(def);
  }

  public save(): void {
    if (!TransformationDefinition.isValid(this.definition)) {
      this.notificationService.error('core.form-invalid');
      return;
    }
    const def = copyDeep(this.definition);
    this.cleanResource(def.mapping);
    def.resources.forEach(r => this.cleanResource(r));
    this.loading = true;
    this.transformationDefinitionService.save(def).subscribe(r => {
      if (def.id) {
        this.ngOnInit();
      } else {
        this.router.navigate(['/modeler/transformation-definitions', r.id, 'edit'], {replaceUrl: true});
      }
    }).add(() => this.loading = false);
  }

  public delete(): void {
    this.loading = true;
    this.transformationDefinitionService.delete(this.definition.id)
      .subscribe(r => this.location.back())
      .add(() => this.loading = false);
  }

  private cleanResource(r: TransformationDefinitionResource): void {
    r.reference = r.source === 'local' ? {localId: r.reference.localId}
      : r.source === 'url' ? {resourceUrl: r.reference.resourceUrl, resourceServerId: r.reference.resourceServerId}
        : r.source === 'static' ? {content: r.reference.content}
          : {};
  }

  // new methods

  protected onTypeSelect(type: TransformationDefinitionResource['type']): void {
    if (this.selectedResourceType !== type) {
      this.selectedResourceType = type;
    } else {
      this.resetView();
    }
  }

  protected resetView(): void {
    this.selectedResourceType = undefined;
    this.selectedResource = this.definition.mapping;
  }

  protected filterByType (r: TransformationDefinitionResource, type: string): boolean {
    return r.type === type;
  }
}
