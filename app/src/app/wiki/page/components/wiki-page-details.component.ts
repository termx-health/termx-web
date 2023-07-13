import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {GithubExportable} from '../../../integration/_lib/github/github.service';
import {collect, group, LoadingManager, validateForm} from '@kodality-web/core-util';
import {ActivatedRoute, Router} from '@angular/router';
import {PageService} from '../services/page.service';
import {MuiConfigService} from '@kodality-web/marina-ui';
import {NgForm} from '@angular/forms';
import {Clipboard} from '@angular/cdk/clipboard';
import {Page, PageContent, PageRelation, parsePageRelationLink} from 'term-web/wiki/_lib';
import {Space, SpaceLibService} from 'term-web/space/_lib';

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

  protected pageContent?: PageContent;
  protected pageRelations?: {[type: string]: PageRelation[]};
  protected pageUsages?: PageRelation[];

  @ViewChild("contentForm") public contentFrom: NgForm;
  protected spaces: {[id: number]: Space} = {};

  protected loader = new LoadingManager();
  protected contentModalData: {
    visible?: boolean,
    content?: PageContent
  } = {};

  public constructor(
    private router: Router,
    private route: ActivatedRoute,
    private pageService: PageService,
    private clipboard: Clipboard,
    private spaceService: SpaceLibService,
    protected muiConfig: MuiConfigService
  ) { }


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

    if (page) {
      page.contents ??= [];
      page.links ??= [];
      page.relations ??= [];
      page.tags ??= [];

      this.pageContent = page.contents.find(c => c.slug === slug);
      // include relations that are ONLY used in the current page
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


  /* Utils */

  protected copy(): void {
    this.clipboard.copy(this.pageContent.content);
  }

  protected prepareExport = (): GithubExportable[] => {
    const extensions = {
      markdown: 'md',
      html: 'html'
    };
    return [{
      content: this.pageContent?.content,
      filename: `${this.pageContent?.slug}.${extensions[this.pageContent?.contentType]}`
    }];
  };

  protected filterLanguages = (supportedLangs: string[], currentLang: string, contents: PageContent[]): string[] => {
    return supportedLangs.filter(l => l !== currentLang && !contents.find(c => c.lang === l));
  };

  protected get isLoading(): boolean {
    return this.loader.isLoadingExcept('init');
  }
}
