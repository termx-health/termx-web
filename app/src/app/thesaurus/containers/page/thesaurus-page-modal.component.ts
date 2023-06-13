import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {LoadingManager, validateForm} from '@kodality-web/core-util';
import {Page, PageContent, PageLink, Tag, TagLibService, Template, TemplateLibService} from 'term-web/thesaurus/_lib';
import {PageService} from '../../services/page.service';
import {TranslateService} from '@ngx-translate/core';
import {MuiConfigService} from '@kodality-web/marina-ui';

@Component({
  selector: 'tw-thesaurus-page-modal',
  templateUrl: 'thesaurus-page-modal.component.html',
})
export class ThesaurusPageModalComponent implements OnInit, OnChanges {
  public page?: Page;
  public pageTags?: string[];
  public content?: PageContent;

  protected tags?: Tag[];
  protected templates?: Template[];

  @Input() public pageId: number | undefined;
  @Input() public contentId: number | undefined;
  @Input() public parentPageId: number | undefined;
  @Input() public modalVisible = false;

  @Output() public saved = new EventEmitter<{page: Page, pageContent: PageContent}>();
  @Output() public closed = new EventEmitter<void>();

  @ViewChild("form") public form?: NgForm;

  public loader = new LoadingManager();
  public mode: 'add' | 'edit' = 'add';

  public constructor(
    private pageService: PageService,
    private tagService: TagLibService,
    private translateService: TranslateService,
    private templateLibService: TemplateLibService,
    protected muiConfig: MuiConfigService
  ) {}


  public ngOnInit(): void {
    this.initData();
    this.initPage();
  }


  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['pageId'] && this.pageId) {
      this.mode = 'edit';
      this.loadPage(this.pageId, this.contentId);
    }
    if (changes['parentPageId'] && this.parentPageId) {
      this.page!.links = [{sourceId: this.parentPageId, orderNumber: 1}];
    }
  }

  private loadPage(id: number, contentId: number): void {
    this.loader.wrap('init', this.pageService.loadPage(id)).subscribe(p => {
      this.page = p;
      this.pageTags = p.tags?.map(t => t.tag.text!) ?? [];
      this.content = contentId ? p.contents?.find(c => c.id === contentId) : undefined;
    });
  }


  private prepare(page: Page): void {
    page.tags ??= [];
    page.tags = page.tags.filter(t => this.pageTags.includes(t.tag.text!));

    this.pageTags?.forEach(t => {
      if (!page.tags.find(pt => pt.tag!.text === t)) {
        const newTag = this.tags.find(tag => tag.text == t);
        page.tags!.push({tag: newTag ?? {text: t}});
      }
    });
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }

    this.prepare(this.page!);
    this.loader.wrap('save', this.pageService.savePage(this.page, this.content)).subscribe(page => {
      this.saved.emit({page, pageContent: page.contents?.find(c => c.name === this.content!.name)});
      this.initData();
    });
  }


  private initPage(): void {
    this.page = new Page();
    this.page.status = 'draft';
    this.page.links = [];
    this.content = {contentType: 'markdown', lang: this.translateService.currentLang};
  }

  private initData(): void {
    this.tagService.loadAll().subscribe(tags => this.tags = tags);
    this.templateLibService.searchTemplates({limit: 999}).subscribe(templates => this.templates = templates.data);
  }


  public addLink(): void {
    this.page!.links!.push(new PageLink());
    this.page!.links = [...this.page!.links!];
  }

  public deleteLink(index: number): void {
    if (this.page?.links) {
      this.page.links.splice(index, 1);
      this.page.links = [...this.page.links || []];
    }
  }


  public open(initial: {links?: Pick<PageLink, 'sourceId' | 'orderNumber'>[]} = {}): void {
    this.initPage();
    this.page.links = initial?.links ?? [];
    this.modalVisible = true;
  }

  public close(): void {
    this.modalVisible = false;
  }

  public get isLoading(): boolean {
    return this.loader.isLoadingExcept('init');
  }
}
