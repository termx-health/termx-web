import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {validateForm} from '@kodality-web/core-util';
import {Page, PageContent, PageRelation} from 'terminology-lib/thesaurus';
import {ThesaurusService} from '../services/thesaurus.service';

@Component({
  selector: 'twa-thesaurus-page-modal',
  templateUrl: 'thesaurus-page-modal.component.html',
})
export class ThesaurusPageModalComponent implements OnInit, OnChanges {
  public page?: Page;
  public content?: PageContent;

  @Input() public pageId: number | undefined;
  @Input() public contentId: number | undefined;
  @Input() public modalVisible = false;
  @Output() public saved: EventEmitter<PageContent> = new EventEmitter();
  @Output() public closed: EventEmitter<void> = new EventEmitter();

  @ViewChild("form") public form?: NgForm;

  public loading: {[k: string]: boolean} = {};
  public mode: 'add' | 'edit' = 'add';

  public constructor(private thesaurusService: ThesaurusService) {}

  public ngOnInit(): void {
    this.page = new Page();
    this.page.status = 'draft';
    this.page.relations = [];
    this.content = new PageContent();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['pageId'] && this.pageId) {
      this.mode = 'edit';
      this.loadPage(this.pageId!);
    }
  }

  private loadPage(id: number): void {
    this.loading['init'] = true;
    this.thesaurusService.loadPage(id).subscribe(p => {
      this.page = p;
      this.content = this.contentId ? p.contents?.find(c => c.id === this.contentId) : undefined;
    }).add(() => this.loading['init'] = false);
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading['save'] = true;
    this.thesaurusService.savePage(this.page!, this.content!)
      .subscribe(page => this.saved.emit(page.contents?.find(c => c.name === this.content!.name)))
      .add(() => this.loading['save'] = false);
  }

  public addRelation(): void {
    this.page!.relations!.push(new PageRelation());
    this.page!.relations = [...this.page!.relations!];
  }

  public deleteRelation(index: number): void {
    if (this.page?.relations) {
      this.page.relations.splice(index, 1);
      this.page.relations = [...this.page.relations || []];
    }
  }

  public get isLoading(): boolean {
    return Object.keys(this.loading).filter(k => 'init' !== k).some(k => this.loading[k]);
  }
}
