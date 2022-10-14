import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Page, PageContent, PageRelation} from 'terminology-lib/thesaurus';
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
  public pageRelations: PageRelation[] = [];
  public path?: number[];
  public loading: {[k: string]: boolean} = {};
  public newPageModalVisible: boolean = false;
  public contentModalData: {
    visible?: boolean,
    content?: PageContent
  } = {};

  @ViewChild("contentForm") public contentFrom?: NgForm;

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

  private init(page?: Page, slug?: string | null): void {
    this.pageId = page && page.id || undefined;
    this.pageContent = page && page.contents!.find(c => c.slug === slug) || undefined;
    this.pageContents = page && page.contents || [];
    this.pageRelations = page && page.relations || [];
    this.path = [];

    if (page) {
      this.thesaurusService.getPath(page.id!).subscribe(path => this.path = path);
    }
  }

  public openContentModal(lang: string): void {
    this.contentModalData = {
      visible: true,
      content: {lang: lang, contentType: 'markdown'}
    };
  }

  public saveContent(): void {
    if (!validateForm(this.contentFrom)) {
      return;
    }
    this.loading['save'] = true;
    this.thesaurusService.savePageContent(this.contentModalData.content!, this.pageId!)
      .subscribe(content => this.router.navigate(['/thesaurus/', content.slug, 'edit']))
      .add(() => this.loading['save'] = false);
  }

  public openContent(content: PageContent): void {
    if (isDefined(content)) {
      this.router.navigate(['/thesaurus/', content.slug]);
    }
  }

  public flagIcon(lang?: string): string | undefined {
    const getEmoji = (countryCode: string): string => {
      const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    };

    const langCountryMap: {[key: string]: string} = {'en': 'gb', 'et': 'ee'};
    return lang ? getEmoji(langCountryMap[lang] || lang) : undefined;
  }

  public filterContents = (contents: PageContent[], lang: string): PageContent[] => {
    return contents.filter(c => c.lang !== lang);
  };

  public filterLanguages = (langs: string[], lang: string, contents: PageContent[]): string[] => {
    return langs.filter(l => l !== lang && !contents.find(c => c.lang === l));
  };

  public openPageContent(content: PageContent): void {
    this.newPageModalVisible = false;
    this.router.navigate(['/thesaurus/', content.slug, 'edit']);
  }

  public get isLoading(): boolean {
    return Object.keys(this.loading).filter(k => 'init' !== k).some(k => this.loading[k]);
  }
}
