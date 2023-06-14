import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {LocalizedName} from '@kodality-web/marina-util';
import {TranslateService} from '@ngx-translate/core';
import slugify from 'slugify';
import {CodeSystemService} from 'app/src/app/resources/code-system/services/code-system.service';
import {ConceptUtil, ValueSetLibService, ValueSetVersionConcept} from 'app/src/app/resources/_lib';
import {Resource} from 'term-web/resources/resource/model/resource';


@Component({
  selector: 'tw-resource-form',
  templateUrl: 'resource-form.component.html'
})
export class ResourceFormComponent implements OnChanges {
  @Input() public resourceType?: 'CodeSystem' | 'ValueSet';
  @Input() public resource?: Resource;
  @Input() public mode?: 'add' | 'edit';

  protected loader = new LoadingManager();
  protected customPublisher: boolean = false;
  protected publishers: ValueSetVersionConcept[];

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private translateService: TranslateService,
    private codeSystemService: CodeSystemService,
    private valueSetLibService: ValueSetLibService
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
    if (!isDefined(publisher)) {
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
    this.valueSetLibService.expand({valueSet: 'publisher'}).subscribe(exp => {
      this.publishers = exp;
      this.customPublisher = this.resource.publisher && !exp.find(e => e.concept?.code === this.resource.publisher);
    });

  }
}
