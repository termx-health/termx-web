import {Component, OnInit, ViewChild} from '@angular/core';
import {isNil, LoadingManager, sort} from '@kodality-web/core-util';
import {ActivatedRoute, Router} from '@angular/router';
import {Page, PageAttachment, PageContent, WikiSmartTextEditorComponent} from 'term-web/wiki/_lib';
import {PageService} from '../services/page.service';
import {Clipboard} from '@angular/cdk/clipboard';
import {mergeMap} from 'rxjs';
import {SpaceService} from 'term-web/space/services/space.service';
import {StructureDefinition, StructureDefinitionLibService} from 'term-web/modeler/_lib';
import {MuiModalContainerComponent} from '@kodality-web/marina-ui';

@Component({
  templateUrl: 'wiki-page-edit.component.html',
  styleUrls: ['../styles/wiki-page.styles.less', 'wiki-page-edit.component.less'],
})
export class WikiPageEditComponent implements OnInit {
  public page?: Page;
  public pageContent?: PageContent;
  public pageAttachments?: PageAttachment[];
  public showPreview?: boolean = false;
  protected loader = new LoadingManager();

  @ViewChild(WikiSmartTextEditorComponent) public editor?: WikiSmartTextEditorComponent;

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
      this.loader.wrap('init', this.pageService.loadAttachments(page.id)).subscribe(resp => this.pageAttachments = sort(resp, 'fileName'));

      if (page?.contents?.some(c => c.slug === slug)) {
        this.page = page;
        this.pageContent = page.contents.find(c => c.slug === slug);
      } else {
        this.router.navigate(['/wiki', this.route.snapshot.paramMap.get("space")]);
      }
    });
  }


  /* Internal API */

  protected saveContent(): void {
    this.loader.wrap('save', this.pageService.savePageContent(this.pageContent, this.page.id)).subscribe(() => {
      this.back();
    });
  }

  protected back(): void {
    this.router.navigate(['/wiki', this.route.snapshot.paramMap.get("space"), this.route.snapshot.paramMap.get('slug')]);
  }

  protected afterPageSave(content: PageContent): void {
    this.pageContent = undefined;

    this.loader.start('update');
    setTimeout(() => {
      this.pageContent = content;
      this.loader.stop('update');
    }, 200);

    this.router.navigate(['/wiki', this.route.snapshot.paramMap.get("space"), content.slug, 'edit']);
  }


  /* Structure definition */

  protected saveAndOpenStructureDefinition(): void {
    this.loader.wrap('save', this.pageService.savePageContent(this.pageContent!, this.page.id)).subscribe(() => {
      this.openStructureDefinition();
    });
  }


  protected openStructureDefinition(): void {
    const structureDefinitionCode = this.pageContent!.slug + '-model';

    // fixme: to structure definition edit container
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

  protected copyStructureDefToClipboard(): void {
    this.clipboard.copy(`{{def:${this.pageContent!.slug}-model}}`);
  }


  /* Attachments */

  protected insertAttachment(att: PageAttachment, modal: MuiModalContainerComponent): void {
    const md = `![](files/${this.page.id}/${att.fileName})`;
    this.editor.insertAtLastCursorPosition(md);
    modal.close();
  }

  protected uploadAttachment(event, input: HTMLInputElement): void {
    if (isNil(event)) {
      return;
    }

    const file = event.target.files[0] as File;
    const fileExists = this.pageAttachments.some(a => a.fileName === file.name);
    if (fileExists) {
      input.value = '';
      return;
    }

    this.loader.wrap('fileUpload', this.pageService.uploadAttachment(this.page.id, file)).subscribe(resp => {
      resp['_new'] = true;
      this.pageAttachments = [...this.pageAttachments, resp];
      input.value = '';
    });
  }


  /* Utils */

  protected togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  protected get isLoading(): boolean {
    return this.loader.isLoadingExcept('init', 'fileUpload');
  }
}
