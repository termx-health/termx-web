import {Component, Input, OnChanges, SimpleChanges, ViewChild, Optional} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Router} from '@angular/router';
import {isDefined, LoadingManager, remove, validateForm} from '@kodality-web/core-util';
import {LocalizedName} from '@kodality-web/marina-util';
import {TranslateService} from '@ngx-translate/core';
import {ConceptUtil, ValueSetVersionConcept, VsConceptUtil} from 'app/src/app/resources/_lib';
import {CodeSystemService} from 'app/src/app/resources/code-system/services/code-system.service';
import slugify from 'slugify';
import {ImplementationGuideService} from 'term-web/implementation-guide/services/implementation-guide.service';
import {MapSetService} from 'term-web/resources/map-set/services/map-set-service';
import {Resource} from 'term-web/resources/resource/model/resource';
import {ValueSetService} from 'term-web/resources/value-set/services/value-set.service';


@Component({
  selector: 'tw-resource-form',
  templateUrl: 'resource-form.component.html'
})
export class ResourceFormComponent implements OnChanges {
  @Input() public resourceType?: 'CodeSystem' | 'ValueSet' | 'MapSet' | 'ImplementationGuide';
  @Input() public resource?: Resource;
  @Input() public mode?: 'add' | 'edit';

  public readonly idPattern: string = '[A-Za-z0-9\\-.]{1,64}';

  protected loader = new LoadingManager();
  protected customPublisher: boolean = false;
  protected publishers: ValueSetVersionConcept[];

  protected idChangeModalData: {visible?: boolean, id?: string} = {};
  @ViewChild("idChangeModalForm") public idChangeModalForm?: NgForm;

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private router: Router,
    private translateService: TranslateService,
    private codeSystemService: CodeSystemService,
    private valueSetService: ValueSetService,
    private mapSetService: MapSetService,
    @Optional() private implementationGuideService: ImplementationGuideService
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['resource'] && isDefined(this.resource)) {
      this.handlePublisher();
    }
  }

  protected titleChanged(title: LocalizedName): void {
    if (!isDefined(title) || this.mode === 'edit') {
      return;
    }
    const lang = this.translateService.currentLang;
    const t = title[lang] ? title[lang].toLowerCase() : Object.values(title)?.[0]?.toLowerCase();
    if (t) {
      this.resource.id = slugify(t);
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
        this.resource.uri = uri && this.resourceType && this.resource.id ? [uri, this.resourceType, this.resource.id].join('/') : this.resource.uri;
      }
    });
  }

  public valid(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  public getResource(): Resource {
    return this.resource;
  }

  private handlePublisher(): void {
    this.valueSetService.expand({valueSet: 'publisher'}).subscribe(exp => {
      this.publishers = exp;
      if (this.resource.publisher && !exp.find(e => e.concept?.code === this.resource.publisher)) {
        const customPublisher = {concept: {code: this.resource.publisher}};
        customPublisher['_custom'] = true;
        this.publishers = [...this.publishers, customPublisher];
      }
    });

  }

  public changeId(): void {
    if (!validateForm(this.idChangeModalForm)) {
      return;
    }
    if (this.resourceType === 'CodeSystem') {
      this.codeSystemService.changeCodeSystemId(this.resource.id, this.idChangeModalData.id).subscribe(() => {
        this.router.navigate(['/resources/code-systems', this.idChangeModalData.id, 'edit'], {replaceUrl: true});
      });
    }
    if (this.resourceType === 'ValueSet') {
      this.valueSetService.changeValueSetId(this.resource.id, this.idChangeModalData.id).subscribe(() => {
        this.router.navigate(['/resources/value-sets', this.idChangeModalData.id, 'edit'], {replaceUrl: true});
      });
    }
    if (this.resourceType === 'MapSet') {
      this.mapSetService.changeMapSetId(this.resource.id, this.idChangeModalData.id).subscribe(() => {
        this.router.navigate(['/resources/map-sets', this.idChangeModalData.id, 'edit'], {replaceUrl: true});
      });
    }
    if (this.resourceType === 'ImplementationGuide') {
      this.implementationGuideService?.changeId(this.resource.id, this.idChangeModalData.id).subscribe(() => {
        this.router.navigate(['/resources/implementation-guides', this.idChangeModalData.id, 'edit'], {replaceUrl: true});
      });
    }
  }

  protected getDisplay = (concept: ValueSetVersionConcept): string => {
    return VsConceptUtil.getDisplay(concept, this.translateService.currentLang);
  };

  protected addOtherTitle(): void {
    this.resource.otherTitle = [...(this.resource.otherTitle || []), {}];
  }

  protected deleteOtherTitle(otherTitle: any): void {
    this.resource.otherTitle = remove(this.resource.otherTitle, otherTitle);
  }

  protected addContext(): void {
    this.resource.useContext = [...(this.resource.useContext || []), {}];
  }

  protected deleteContext(ctx: any): void {
    this.resource.useContext = remove(this.resource.useContext, ctx);
  }
}
