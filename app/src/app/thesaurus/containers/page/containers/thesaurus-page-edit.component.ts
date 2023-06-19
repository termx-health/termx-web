import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {LoadingManager, validateForm} from '@kodality-web/core-util';
import {ActivatedRoute, Router} from '@angular/router';
import {PageContent, StructureDefinition} from 'term-web/thesaurus/_lib';
import {PageService} from '../services/page.service';
import {Clipboard} from '@angular/cdk/clipboard';
import {StructureDefinitionService} from '../../structure-definition/services/structure-definition.service';

@Component({
  templateUrl: 'thesaurus-page-edit.component.html',
  styles: [`
    .equal-columns {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: minmax(0, 1fr);
      gap: 1rem;
    }

    .page__wrapper {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 2rem;

      height: min-content;
      width: 100%;
      max-width: 1800px;
      margin-inline: auto;

      padding: 2rem 1rem 1rem;
    }
  `]
})
export class ThesaurusPageEditComponent implements OnInit {
  public pageId?: number;
  public pageContent?: PageContent;
  public showPreview?: boolean = false;
  protected loader = new LoadingManager();

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private pageService: PageService,
    private structureDefinitionService: StructureDefinitionService,
    private clipboard: Clipboard,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    this.route.paramMap.subscribe(routeParam => {
      const slug = routeParam.get('slug');
      if (slug) {
        this.loadContent(slug);
      }
    });
  }



  private loadContent(slug: string): void {
    this.loader.wrap('init', this.pageService.searchPageContents({slug: slug, limit: 1})).subscribe(contents => {
      const content = contents.data[0];
      if (content) {
        this.pageContent = content;
        this.pageId = content.pageId;
      } else {
        this.router.navigate(['/thesaurus/pages']);
      }
    });
  }


  /* Internal API */

  protected saveContent(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loader.wrap('save', this.pageService.savePageContent(this.pageContent!, this.pageId!)).subscribe(() => this.back());
  }

  protected back(): void {
    this.router.navigate(['/thesaurus/pages/', this.route.snapshot.paramMap.get('slug')]);
  }


  public afterPageSave(content: PageContent): void {
    this.pageContent = undefined;

    this.loader.start('update');
    setTimeout(() => {
      this.pageContent = content;
      this.loader.stop('update');
    }, 200);

    this.router.navigate(['/thesaurus/pages/', content.slug, 'edit']);
  }


  /* Structure definition */

  public saveAndOpenStructureDefinition(): void {
    if (!validateForm(this.form)) {
      return;
    }

    this.loader.wrap('save', this.pageService.savePageContent(this.pageContent!, this.pageId!)).subscribe(() => {
      this.openStructureDefinition();
    });
  }

  public openStructureDefinition(): void {
    const structureDefinitionCode = this.pageContent!.slug + '-model';

    this.structureDefinitionService.search({code: structureDefinitionCode, limit: 1}).subscribe(res => {
      if (res.data?.[0]?.id) {
        this.router.navigate(['/thesaurus/structure-definitions/', res.data[0].id, 'edit'], {queryParams: {tab: 'elements'}});
        return;
      }

      const fhirSD = {
        resourceType: 'StructureDefinition',
        id: structureDefinitionCode,
        url: structureDefinitionCode,
        name: structureDefinitionCode,
        status: 'active',
        kind: 'logical',
        abstract: false,
        baseDefinition: 'http://hl7.org/fhir/StructureDefinition/Element',
        differential: {}
      };
      const structureDefinition: StructureDefinition = {
        url: structureDefinitionCode,
        code: structureDefinitionCode,
        content: JSON.stringify(fhirSD, null, 2),
        contentFormat: 'json',
        contentType: 'logical'
      };
      this.structureDefinitionService.save(structureDefinition).subscribe(sd => {
        this.router.navigate(['/thesaurus/structure-definitions/', sd.id, 'edit'], {queryParams: {tab: 'elements'}});
      });
    });
  }

  public copyStructureDefToClipboard(): void {
    this.clipboard.copy('{{def:' + this.pageContent!.slug + '-model}}');
  }


  /* Utils */

  public get isLoading(): boolean {
    return this.loader.isLoadingExcept('init');
  }
}
