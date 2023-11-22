import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {isNil, LoadingManager, remove, sort} from '@kodality-web/core-util';
import {ActivatedRoute, Router} from '@angular/router';
import {Page, PageAttachment, PageComment, PageContent, WikiSmartTextEditorComponent} from 'term-web/wiki/_lib';
import {PageService} from '../services/page.service';
import {Clipboard} from '@angular/cdk/clipboard';
import {combineLatest, mergeMap} from 'rxjs';
import {SpaceService} from 'term-web/space/services/space.service';
import {StructureDefinition, StructureDefinitionLibService} from 'term-web/modeler/_lib';
import {MuiModalContainerComponent} from '@kodality-web/marina-ui';
import {PageCommentService} from 'term-web/wiki/page/services/page-comment.service';
import {UnsavedChangesGuardComponent} from 'term-web/core/ui/guard/unsaved-changes.guard';
import {SeoService} from 'term-web/core/ui/services/seo.service';

@Component({
  templateUrl: 'wiki-page-edit.component.html',
  styleUrls: ['../styles/wiki-page.styles.less', 'wiki-page-edit.component.less'],
})
export class WikiPageEditComponent implements OnInit, UnsavedChangesGuardComponent {
  public page?: Page;
  public pageContent?: PageContent;
  public _pageContent?: PageContent; // for change detection
  public pageAttachments?: PageAttachment[];
  public pageComments?: PageComment[];

  protected loader = new LoadingManager();
  protected showPreview = false;
  protected showComments = false;
  protected lineWrapping = false;
  protected versionInfo: Date;

  @ViewChild(WikiSmartTextEditorComponent) public editor?: WikiSmartTextEditorComponent;

  @HostListener('window:beforeunload', ['$event'])
  public handleClose(e: BeforeUnloadEvent): void {
    e.preventDefault();
    e.returnValue = this.canDeactivate(true);
  }

  public canDeactivate(beforeunload?: boolean): boolean {
    const isSaved = isNil(this._pageContent) || this._pageContent.content === this.pageContent.content;
    if (beforeunload) {
      return isSaved;
    }
    return isSaved || confirm("Changes you made may not be saved.");
  }


  public constructor(
    private spaceService: SpaceService,
    private pageService: PageService,
    private pageCommentService: PageCommentService,
    private structureDefinitionService: StructureDefinitionLibService,
    private clipboard: Clipboard,
    private seoService: SeoService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}


  public ngOnInit(): void {
    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(([routeParam, qParams]) => {
      const space = routeParam.get('space');
      const slug = routeParam.get('slug');
      const version = qParams.get('version');
      if (space && slug) {
        this.loadContent(space, slug, {version: Number(version)});
      }
    });
  }

  private loadContent(space: string, slug: string, opts: {version: number}): void {
    const req$ = this.spaceService.search({codes: space, limit: 1}).pipe(mergeMap(resp => {
      return this.pageService.searchPages({
        slugs: slug,
        spaceIds: resp.data[0].id,
        limit: 1
      });
    }));

    this.loader.wrap('init', req$).subscribe(pages => {
      const page = pages.data[0];

      this.page = page;
      this.pageContent = page.contents.find(c => c.slug === slug);
      this._pageContent = structuredClone(this.pageContent);

      if (isNil(this.pageContent)) {
        this.router.navigate(['/wiki', this.route.snapshot.paramMap.get("space")]);
        return;
      }

      this.loader.wrap('init', this.pageService.loadAttachments(page.id)).subscribe(resp => {
        this.pageAttachments = sort(resp, 'fileName');
      });

      this.loader.wrap('init', this.pageCommentService.search({
        pageContentIds: this.pageContent.id,
        statuses: 'active'
      })).subscribe(comments => {
        this.pageComments = comments.data;
      });

      if (opts?.version) {
        this.loader.wrap('init', this.pageService.loadPageContentHistoryItem(this.pageContent.pageId, this.pageContent.id, opts.version)).subscribe(ver => {
          this.pageContent.content = ver.content;
          this.versionInfo = ver.modifiedAt;
        });
      }

      this.seoService.title(this.pageContent.name);
    });
  }


  /* Internal API */

  protected saveContent(): void {
    this.loader.wrap('save', this.pageService.savePageContent(this.pageContent, this.page.id)).subscribe(() => {
      this.back();
    });
  }

  protected back(): void {
    this._pageContent = undefined;
    const spaceCode = this.route.snapshot.paramMap.get("space");
    const slug = this.route.snapshot.paramMap.get('slug');
    this.router.navigate(['/wiki', spaceCode, slug]);
  }

  protected afterPageSave(content: PageContent): void {
    this.pageContent = undefined;

    this.loader.start('update');
    setTimeout(() => {
      this.pageContent = content;
      this._pageContent = structuredClone(content);
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
    const md = `![](files/${this.page.id}/${encodeURIComponent(att.fileName)})`;
    this.editor.insertAtLastCursorPosition(md);
    modal.close();
  }

  protected uploadAttachment(event, input: HTMLInputElement): void {
    if (isNil(event)) {
      return;
    }

    const file = event.target.files[0] as File;
    const fileExists = this.pageAttachments.some(a => a.fileName === file.name);
    if (fileExists || !this.isImage(file.type)) {
      input.value = '';
      return;
    }

    this.loader.wrap('fileUpload', this.pageService.uploadAttachment(this.page.id, file)).subscribe(resp => {
      resp['_new'] = true;
      this.pageAttachments = [...this.pageAttachments, resp];
      input.value = '';
    });
  }

  protected deleteAttachment(att: PageAttachment): void {
    if (att['_deleting']) {
      return;
    }
    att['_deleting'] = true;
    this.pageService.deleteAttachment(this.page.id, att.fileName).subscribe(resp => {
      this.pageAttachments = remove(this.pageAttachments, att);
    }).add(() => att['_deleting'] = false);
  }

  protected isImage(contentType: string): boolean {
    return contentType?.startsWith('image/');
  }


  /* Comments */

  protected toggleComments(): void {
    this.showComments = !this.showComments;
    if (this.showComments) {
      this.showPreview = true;
    }
  }

  protected onCommentsChange(): void {
    if (!this.pageComments?.length) {
      this.showComments = false;
    }
  }


  /* Utils */

  protected togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  protected get isLoading(): boolean {
    return this.loader.isLoadingExcept('init', 'fileUpload');
  }
}
