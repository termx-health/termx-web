import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {validateForm} from '@kodality-web/core-util';
import {Page, PageContent, PageLink, Tag, TagLibService, Template, TemplateLibService} from 'lib/src/thesaurus';
import {PageService} from '../../services/page.service';

@Component({
  selector: 'twa-thesaurus-page-modal',
  templateUrl: 'thesaurus-page-modal.component.html',
})
export class ThesaurusPageModalComponent implements OnInit, OnChanges {
  public page?: Page;
  public content?: PageContent;

  public tags?: Tag[];
  public templates?: Template[];
  public pageTags?: string[];

  @Input() public pageId: number | undefined;
  @Input() public contentId: number | undefined;
  @Input() public parentPageId: number | undefined;
  @Input() public modalVisible = false;
  @Output() public saved: EventEmitter<PageContent> = new EventEmitter();
  @Output() public closed: EventEmitter<void> = new EventEmitter();

  @ViewChild("form") public form?: NgForm;

  public loading: {[k: string]: boolean} = {};
  public mode: 'add' | 'edit' = 'add';

  public constructor(
    private pageService: PageService,
    private tagService: TagLibService,
    private templateLibService: TemplateLibService
  ) {}

  public ngOnInit(): void {
    this.page = new Page();
    this.page.status = 'draft';
    this.page.links = [];
    this.content = {contentType: 'markdown'};

    this.initData();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['pageId'] && this.pageId) {
      this.mode = 'edit';
      this.loadPage(this.pageId!);
    }
    if (changes['parentPageId'] && this.parentPageId) {
      this.page!.links = [{sourceId: this.parentPageId, orderNumber: 1}];
    }
  }

  private loadPage(id: number): void {
    this.loading['init'] = true;
    this.pageService.loadPage(id).subscribe(p => {
      this.page = p;
      this.pageTags = p.tags?.map(t => t.tag!.text!) || [];
      this.content = this.contentId ? p.contents?.find(c => c.id === this.contentId) : undefined;
    }).add(() => this.loading['init'] = false);
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading['save'] = true;
    this.prepare(this.page!);
    this.pageService.savePage(this.page!, this.content!)
      .subscribe(page => {
        this.saved.emit(page.contents?.find(c => c.name === this.content!.name));
        this.initData();
      })
      .add(() => this.loading['save'] = false);
  }

  private prepare(page: Page): void {
    page.tags = page.tags || [];
    page.tags = page.tags.filter(t => this.pageTags!.includes(t.tag!.text!));
    this.pageTags!.forEach(t => {
      if (!page.tags!.find(pt => pt.tag!.text === t)) {
        const newTag = this.tags!.find(tag => tag.text == t);
        page.tags!.push({tag: newTag ? newTag : {text: t}});
      }
    });
  }

  private initData(): void {
    this.loadTags();
    this.loadTemplates();
  }

  private loadTags(): void {
    this.tagService.loadAll().subscribe(tags => this.tags = tags);
  }

  private loadTemplates(): void {
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

  public get isLoading(): boolean {
    return Object.keys(this.loading).filter(k => 'init' !== k).some(k => this.loading[k]);
  }
}
