import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {validateForm} from '@kodality-web/core-util';
import {ActivatedRoute, Router} from '@angular/router';
import {PageContent} from 'terminology-lib/thesaurus';
import {ThesaurusService} from '../services/thesaurus.service';
import {MarkdownService} from 'ngx-markdown';
import TurndownService from 'turndown';


@Component({
  templateUrl: 'thesaurus-page-edit.component.html',
})
export class ThesaurusPageEditComponent implements OnInit {
  public pageId?: number;
  public pageContent?: PageContent;
  public modalVisible?: boolean = false;
  public htmlContent?: string;

  public loading: {[k: string]: boolean} = {};
  @ViewChild("form") public form?: NgForm;

  public constructor(
    private markdownService: MarkdownService,
    private thesaurusService: ThesaurusService,
    private router: Router,
    private route: ActivatedRoute) {}

  public ngOnInit(): void {
    this.route.paramMap.subscribe(routeParam => {
      const slug = routeParam.get('slug');
      if (slug) {
        this.loadContent(slug);
      }
    });
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading['save'] = true;
    this.thesaurusService.savePageContent(this.pageContent!, this.pageId!).subscribe(() => this.closeEditMode()).add(() => this.loading['save'] = false);
  }

  public closeEditMode(): void {
    this.router.navigate(['/thesaurus/', this.route.snapshot.paramMap.get('slug')]);
  }

  public get isLoading(): boolean {
    return Object.keys(this.loading).filter(k => 'init' !== k).some(k => this.loading[k]);
  }

  private loadContent(slug: string): void {
    this.loading['init'] = true;
    this.thesaurusService.searchPageContents({slug: slug, limit: 1}).subscribe(contents => {
      const content = contents.data[0];
      if (!content) {
        this.router.navigate(['/thesaurus']);
      } else {
        this.pageContent = content;
        this.pageId = content.pageId;
        this.htmlContent = this.markdownService.compile(this.pageContent.content!);
      }
    }).add(() => this.loading['init'] = false);
  }

  public openPageContentEdit(content: PageContent): void {
    this.modalVisible = false;
    this.router.navigate(['/thesaurus/', content.slug, 'edit']);
  }

  public changeContent(html: string): void {
    const ts = new TurndownService();
    this.pageContent!.content = ts.turndown(html);
  }

  public changeHtmlContent(md: string): void {
    this.htmlContent = this.markdownService.compile(md);
  }
}
