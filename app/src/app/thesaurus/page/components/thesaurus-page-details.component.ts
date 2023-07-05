import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {Page, PageContent, PageRelation} from '../../_lib';
import {GithubExportable} from '../../../integration/_lib/github/github.service';
import {collect, LoadingManager, validateForm} from '@kodality-web/core-util';
import {ActivatedRoute, Router} from '@angular/router';
import {PageService} from '../services/page.service';
import {MuiConfigService} from '@kodality-web/marina-ui';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'tw-thesaurus-page-details',
  templateUrl: 'thesaurus-page-details.component.html'
})
export class ThesaurusPageDetailsComponent implements OnChanges {
  @Input() public slug: string;
  @Input() public page: Page;
  protected pageContent?: PageContent;
  protected pageRelations?: {[k: string]: PageRelation[]};
  protected pageUsages?: PageRelation[];

  @Output() public editPage = new EventEmitter<string>();
  @Output() public viewPage = new EventEmitter<string>();
  @Output() public viewRelation = new EventEmitter<PageRelation>();

  @ViewChild("contentForm") public contentFrom: NgForm;

  protected loader = new LoadingManager();
  protected contentModalData: {
    visible?: boolean,
    content?: PageContent
  } = {};

  public constructor(
    private router: Router,
    private route: ActivatedRoute,
    private pageService: PageService,
    protected muiConfig: MuiConfigService
  ) { }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['page'] || changes['slug']) {
      this.init(this.page, this.slug);
    }
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
      this.pageRelations = collect(page.relations, r => r.type);
      this.pageService.searchPageRelations({
        type: 'page',
        target: page.contents?.map(c => c.slug).join(',')!,
        limit: 999
      }).subscribe(resp => {
        this.pageUsages = resp.data;
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


  /* Utils */

  protected prepareExport = (): GithubExportable[] => {
    let filename = `${this.pageContent?.slug}.${this.pageContent?.contentType === 'markdown' ? 'md' : 'html'}`;
    return [{content: this.pageContent?.content, filename: filename}];
  };

  protected filterLanguages = (supportedLangs: string[], currentLang: string, contents: PageContent[]): string[] => {
    return supportedLangs.filter(l => l !== currentLang && !contents.find(c => c.lang === l));
  };

  protected get isLoading(): boolean {
    return this.loader.isLoadingExcept('init');
  }
}
