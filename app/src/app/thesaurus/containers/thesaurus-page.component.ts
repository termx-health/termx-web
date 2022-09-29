import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Page, PageContent} from 'terminology-lib/thesaurus';
import {ThesaurusService} from '../services/thesaurus.service';
import {isDefined, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';

@Component({
  templateUrl: './thesaurus-page.component.html',
})
export class ThesaurusPageComponent implements OnInit {
  public pageId?: number;
  public pageContent?: PageContent;
  public pageContents: PageContent[] = [];
  public path?: number[];
  public loading: {[k: string]: boolean} = {};
  public modalData: {
    visible?: boolean,
    content?: PageContent
  } = {};
  @ViewChild("form") public form?: NgForm;

  public constructor(
    private router: Router,
    private route: ActivatedRoute,
    private thesaurusService: ThesaurusService
  ) { }

  public ngOnInit(): void {
    this.route.paramMap.subscribe(routeParam => {
      this.init();

      const slug = routeParam.get("slug");
      if (slug) {
        this.loading['init'] = true;
        this.thesaurusService.searchPages({slug: slug, limit: 1}).subscribe(pages => {
          const page = pages.data[0];
          if (!page) {
            this.router.navigate(['/thesaurus']);
          } else {
            this.init(page, slug);
          }
        }).add(() => this.loading['init'] = false);
      }
    });
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading['save'] = true;
    this.thesaurusService.savePageContent(this.modalData.content!, this.pageId!)
      .subscribe(content => this.router.navigate(['/thesaurus/', content.slug, 'edit']))
      .add(() => this.loading['save'] = false);
  }

  public openModal(): void {
    this.modalData = {
      visible: true,
      content: new PageContent()
    };
  }

  public get isLoading(): boolean {
    return Object.keys(this.loading).filter(k => 'init' !== k).some(k => this.loading[k]);
  }

  public openContent(content: PageContent): void {
    if (isDefined(content)) {
      this.router.navigate(['/thesaurus/', content.slug]);
    }
  }

  private init(page?: Page, slug?: string): void {
    this.pageId = page && page.id || undefined;
    this.pageContent = page && page.contents!.find(c => c.slug === slug) || undefined;
    this.pageContents = page && page.contents || [];
    this.path = [];

    if (page) {
      this.thesaurusService.getPath(page.id!).subscribe(path => this.path = path);
    }
  }
}
