import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {LoadingManager, validateForm} from '@kodality-web/core-util';
import {ActivatedRoute, Router} from '@angular/router';
import {Page, PageContent} from 'term-web/thesaurus/_lib';
import {PageService} from '../services/page.service';
import {Clipboard} from '@angular/cdk/clipboard';
import {mergeMap} from 'rxjs';
import {SpaceService} from 'term-web/space/services/space.service';
import {StructureDefinition, StructureDefinitionLibService} from 'term-web/modeler/_lib';

@Component({
  templateUrl: 'thesaurus-page-edit.component.html',
  styleUrls: ['../styles/thesaurus-page.styles.less', 'thesaurus-page-edit.component.less'],
})
export class ThesaurusPageEditComponent implements OnInit {
  public page?: Page;
  public pageContent?: PageContent;
  public showPreview?: boolean = false;
  protected loader = new LoadingManager();

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private spaceService: SpaceService,
    private pageService: PageService,
    private structureDefinitionService: StructureDefinitionLibService,
    private clipboard: Clipboard,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  public ngOnInit(): void {
    this.route.paramMap.subscribe(routeParam => {
      const space = routeParam.get('space');
      const slug = routeParam.get('slug');
      if (space && slug) {
        this.loadContent(space, slug);
      }
    });
  }


  private loadContent(space: string, slug: string): void {
    const req$ = this.spaceService.search({codes: space, limit: 1}).pipe(mergeMap(resp => {
      return this.pageService.searchPages({
        slugs: slug,
        spaceIds: resp.data[0].id,
        limit: 1
      });
    }));

    this.loader.wrap('init', req$).subscribe(pages => {
      const page = pages.data[0];
      if (page?.contents?.some(c => c.slug === slug)) {
        this.page = page;
        this.pageContent = page.contents.find(c => c.slug === slug);
      } else {
        this.router.navigate(['/thesaurus', this.route.snapshot.paramMap.get("space")]);
      }
    });
  }


  /* Internal API */

  protected saveContent(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loader.wrap('save', this.pageService.savePageContent(this.pageContent, this.page.id)).subscribe(() => this.back());
  }

  protected back(): void {
    this.router.navigate(['/thesaurus', this.route.snapshot.paramMap.get("space"), this.route.snapshot.paramMap.get('slug')]);
  }

  protected afterPageSave(content: PageContent): void {
    this.pageContent = undefined;

    this.loader.start('update');
    setTimeout(() => {
      this.pageContent = content;
      this.loader.stop('update');
    }, 200);

    this.router.navigate(['/thesaurus', this.route.snapshot.paramMap.get("space"), content.slug, 'edit']);
  }


  /* Structure definition */

  public saveAndOpenStructureDefinition(): void {
    if (!validateForm(this.form)) {
      return;
    }

    this.loader.wrap('save', this.pageService.savePageContent(this.pageContent!, this.page.id)).subscribe(() => {
      this.openStructureDefinition();
    });
  }

  public openStructureDefinition(): void {
    const structureDefinitionCode = this.pageContent!.slug + '-model';

    this.structureDefinitionService.search({code: structureDefinitionCode, limit: 1}).subscribe(res => {
      if (res.data?.[0]?.id) {
        this.router.navigate(['/modeler/structure-definitions/', res.data[0].id, 'edit'], {queryParams: {tab: 'elements'}});
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
        this.router.navigate(['/modeler/structure-definitions/', sd.id, 'edit'], {queryParams: {tab: 'elements'}});
      });
    });
  }

  public copyStructureDefToClipboard(): void {
    this.clipboard.copy('{{def:' + this.pageContent!.slug + '-model}}');
  }


  /* Utils */

  protected togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  protected get isLoading(): boolean {
    return this.loader.isLoadingExcept('init');
  }
}
