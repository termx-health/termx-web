import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {collect, group, LoadingManager, validateForm} from '@kodality-web/core-util';
import {PageService} from '../services/page.service';
import {MuiConfigService} from '@kodality-web/marina-ui';
import {NgForm} from '@angular/forms';
import {Clipboard} from '@angular/cdk/clipboard';
import {Page, PageComment, PageContent, PageRelation, parsePageRelationLink} from 'term-web/wiki/_lib';
import {Space, SpaceLibService} from 'term-web/space/_lib';
import {PageCommentService} from 'term-web/wiki/page/services/page-comment.service';
import {WikiComment} from 'term-web/wiki/_lib/texteditor/comments/wiki-comment';
import {MediaMatcher} from '@angular/cdk/layout';

@Component({
  selector: 'tw-wiki-page-details',
  templateUrl: 'wiki-page-details.component.html'
})
export class WikiPageDetailsComponent implements OnChanges, OnInit {
  @Input() public space: Space;
  @Input() public slug: string;
  @Input() public page: Page;
  @Output() public editPage = new EventEmitter<string>();
  @Output() public viewPage = new EventEmitter<string>();
  @Output() public viewResource = new EventEmitter<{type: string, id: string, options: {space?: string}}>();
  @Output() public pageDeleted = new EventEmitter<Page>();

  protected pageContent?: PageContent;
  protected pageRelations?: {[type: string]: PageRelation[]};
  protected pageUsages?: PageRelation[];
  protected pageComments?: PageComment[];

  @ViewChild("contentForm") public contentFrom: NgForm;
  protected spaces: {
    [id: number]: Space
  } = {};

  protected loader = new LoadingManager();
  protected mobileQuery: MediaQueryList;
  protected contentModalData: {
    visible?: boolean,
    content?: PageContent
  } = {};

  public constructor(
    private pageService: PageService,
    private pageCommentService: PageCommentService,
    private clipboard: Clipboard,
    private spaceService: SpaceLibService,
    protected muiConfig: MuiConfigService,
    media: MediaMatcher
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 992px)');
  }


  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['page'] || changes['slug']) {
      this.init(this.page, this.slug);
    }
  }

  public ngOnInit(): void {
    this.loader.wrap('spaces', this.spaceService.search({})).subscribe(resp => {
      // used for relation decorating
      this.spaces = group(resp.data, s => s.id);
    });
  }


  private init(page?: Page, slug?: string): void {
    this.pageContent = undefined;
    this.pageRelations = {};
    this.pageUsages = [];
    this.pageComments = [];

    if (page) {
      page.contents ??= [];
      page.links ??= [];
      page.relations ??= [];
      page.tags ??= [];

      this.pageContent = page.contents.find(c => c.slug === slug);
      // include relations that are used ONLY in the current page
      this.pageRelations = collect(page.relations.filter(r => r.content.code === slug), r => r.type);
      // $slug and $space/$slug params are used in order to find references from other spaces
      this.pageService.searchPageRelations({
        type: 'page',
        target: page.contents.map(c => `${c.slug},${this.space?.code}/${c.slug}`).join(',')!,
        limit: 999
      }).subscribe(resp => {
        this.pageUsages = resp.data
          // local links (doesn't start with "$space/") should be from the same space
          .filter(r => r.spaceId === this.space.id || r.target.startsWith(`${this.space?.code}/`))
          // include usages where current page is referenced from
          .filter(u => u.target.endsWith(slug));
      });

      this.pageCommentService.search({
        statuses: 'active',
        pageContentIds: this.pageContent.id,
        limit: this.pageContent ? 101 : 0
      }).subscribe(resp => {
        this.pageComments = resp.data;
      });
    }
  }


  protected savePageContent(): void {
    if (validateForm(this.contentFrom)) {
      const req$ = this.pageService.savePageContent(this.contentModalData.content, this.page?.id);
      this.loader.wrap('save', req$).subscribe(content => {
        this.editPage.emit(content.slug);
      });
    }
  }

  protected delete(): void {
    this.pageService.deletePage(this.page.id).subscribe(() => {
      this.pageDeleted.emit(this.page);
    });
  }


  protected createPageContent(lang: string): void {
    this.contentModalData = {
      visible: true,
      content: {lang: lang, contentType: 'markdown'}
    };
  }

  protected openRelation(type: string, target: string): void {
    const {space, page} = parsePageRelationLink(target);
    this.viewResource.emit({type: type, id: page, options: {space}});
  }


  /* WikiComments */

  protected onPageCommentCreated(comment: WikiComment): void {
    this.pageCommentService.save({
      pageContentId: this.pageContent.id,
      text: comment.quote?.trim().length ? comment.quote : undefined,
      comment: comment.comment,
      options: {lineNumber: comment.line},
      status: 'active',
    }).subscribe(resp => {
      this.pageComments = [...this.pageComments, resp];
    });
  }


  /* Utils */

  protected copy(): void {
    this.clipboard.copy(this.pageContent.content);
  }

  protected filterLanguages = (supportedLangs: string[], currentLang: string, contents: PageContent[]): string[] => {
    return supportedLangs.filter(l => l !== currentLang && !contents.find(c => c.lang === l));
  };

  protected getCommentsContainerOffset(): number {
    return document.getElementById('comments-container').offsetTop;
  }

  protected calcLineOffset(nr: number): number {
    return document.querySelector<HTMLElement>(`[data-source-line="${nr}"]`)?.offsetTop ?? 0;
  }

  protected toWikiComments(comments: PageComment[]): WikiComment[] {
    return comments?.map(c => ({comment: c.comment, quote: c.text, line: c.options?.lineNumber}));
  }

  protected get isLoading(): boolean {
    return this.loader.isLoadingExcept('init');
  }
}
