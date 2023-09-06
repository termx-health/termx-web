import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {LoadingManager, validateForm} from '@kodality-web/core-util';
import {Page, PageContent, PageLink, Tag, TagLibService, Template, TemplateLibService} from 'term-web/wiki/_lib';
import {PageService} from '../services/page.service';
import {TranslateService} from '@ngx-translate/core';
import {MuiConfigService} from '@kodality-web/marina-ui';
import {PreferencesService} from 'term-web/core/preferences/preferences.service';

@Component({
  selector: 'tw-wiki-page-setup',
  templateUrl: 'wiki-page-setup-modal.component.html',
})
export class WikiPageSetupModalComponent implements OnInit, OnChanges {
  @Input() public pageId: number | undefined;
  @Input() public contentId: number | undefined;

  @Output() public saved = new EventEmitter<{page: Page, pageContent: PageContent}>();
  @Output() public closed = new EventEmitter<void>();

  @ViewChild(NgForm) protected form: NgForm;

  protected page?: Page;
  protected pageTags?: string[];
  protected pageContent?: PageContent;

  protected tags?: Tag[];
  protected templates?: Template[];

  protected loader = new LoadingManager();
  protected modalVisible: boolean;
  protected mode: 'add' | 'edit' = 'add';

  public constructor(
    private pageService: PageService,
    private tagService: TagLibService,
    private translateService: TranslateService,
    private templateLibService: TemplateLibService,
    private preferences: PreferencesService,
    protected muiConfig: MuiConfigService
  ) {}


  public ngOnInit(): void {
    this.initData();
    this.initPage();
  }


  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['pageId'] || changes['contentId'])) {
      this.mode = this.pageId ? 'edit' : 'add';

      if (this.mode === 'edit') {
        this.loadPage(this.pageId, this.contentId);
      }
    }
  }


  /* Initialization */

  private initData(): void {
    this.tagService.loadAll().subscribe(tags => this.tags = tags);
    this.templateLibService.searchTemplates({limit: 999}).subscribe(templates => this.templates = templates.data);
  }

  private initPage(): void {
    this.page = new Page();
    this.page.status = 'draft';
    this.page.settings = {};
    this.page.links = [];
    this.pageContent = {contentType: 'markdown', lang: this.translateService.currentLang};
  }

  private loadPage(id: number, contentId?: number): void {
    this.loader.wrap('init', this.pageService.loadPage(id)).subscribe(p => {
      this.page = p;
      this.page ??= {};
      this.page.settings ??= {};
      this.pageTags = p.tags?.map(t => t.tag.text!) ?? [];
      this.pageContent = contentId ? p.contents?.find(c => c.id === contentId) : undefined;
    });
  }


  /* Save */

  protected save(): void {
    if (!validateForm(this.form)) {
      return;
    }

    const page = this.page;
    page.tags ??= [];
    page.tags = page.tags.filter(t => this.pageTags.includes(t.tag.text!));
    page.spaceId = this.preferences.spaceId;

    this.pageTags?.forEach(t => {
      if (!page.tags.find(pt => pt.tag.text === t)) {
        const newTag = this.tags.find(tag => tag.text == t);
        page.tags.push({tag: newTag ?? {text: t}});
      }
    });

    this.loader.wrap('save', this.pageService.savePage(page, this.pageContent)).subscribe(page => {
      this.saved.emit({page, pageContent: page.contents?.find(c => c.name === this.pageContent.name)});
      this.initData();
    });
  }



  /* External API */

  public open(initials: {links?: Pick<PageLink, 'sourceId' | 'orderNumber'>[]} = {}): void {
    if (!this.pageId) {
      this.initPage();
      this.page.links = initials?.links ?? [];
    }

    this.modalVisible = true;
  }

  public close(): void {
    this.modalVisible = false;
  }


  /* Utils */

  protected get isLoading(): boolean {
    return this.loader.isLoadingExcept('init');
  }
}
