import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PageService} from '../../services/page.service';
import {collect, isDefined, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {GithubExportable} from '../../../integration/github/github.service';
import {Page, PageContent, PageLink, PageRelation} from 'term-web/thesaurus/_lib';

@Component({
  templateUrl: './thesaurus-page.component.html',
})
export class ThesaurusPageComponent implements OnInit {
  public pageId?: number;
  public pageContent?: PageContent;
  public pageContents: PageContent[] = [];
  public pageLinks: PageLink[] = [];
  public pageRelations?: {[k: string]: PageRelation[]};
  public usages?: PageRelation[];
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
    private pageService: PageService
  ) { }

  public ngOnInit(): void {
    this.route.paramMap.subscribe(routeParam => {
      this.init();

      const slug = routeParam.get("slug");
      if (slug) {
        this.loading['init'] = true;
        this.pageService.searchPages({slug: slug, limit: 1}).subscribe(pages => {
          const page = pages.data[0];
          if (!page) {
            this.router.navigate(['/thesaurus/pages']);
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
    this.pageRelations = collect(page?.relations || [], r => r.type!);
    this.pageLinks = page && page.links || [];
    this.path = [];

    if (page) {
      this.pageService.getPath(page.id!).subscribe(path => this.path = path);
      this.pageService.searchPageRelations({type: 'page', target: page.contents?.map(c => c.slug).join(',')!, limit: 999})
        .subscribe(resp => this.usages = resp.data);
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
    this.pageService.savePageContent(this.contentModalData.content!, this.pageId!)
      .subscribe(content => this.router.navigate(['/thesaurus/pages/', content.slug, 'edit']))
      .add(() => this.loading['save'] = false);
  }

  public openContent(content: PageContent): void {
    if (isDefined(content)) {
      this.router.navigate(['/thesaurus/pages/', content.slug]);
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
  public prepareExport = (): GithubExportable[] => {
    let filename = `${this.pageContent?.slug}.${this.pageContent?.contentType === 'markdown' ? 'md' : 'html'}`;
    return [{content: this.pageContent?.content, filename: filename}];
  };

  public openPageContent(content: PageContent): void {
    this.newPageModalVisible = false;
    this.router.navigate(['/thesaurus/pages/', content.slug, 'edit']);
  }

  public get isLoading(): boolean {
    return Object.keys(this.loading).filter(k => 'init' !== k).some(k => this.loading[k]);
  }

  public openTarget(relation: PageRelation): void {
    if (relation.type === 'cs') {
      this.router.navigate(['/resources/code-systems/', relation.target, 'view']);
    } else if (relation.type === 'vs') {
      this.router.navigate(['/resources/value-sets/', relation.target, 'view']);
    } else if (relation.type === 'ms') {
      this.router.navigate(['/resources/map-sets/', relation.target, 'view']);
    } else if (relation.type === 'concept') {
      const cs = relation.target!.split('|')[0];
      const concept = relation.target!.split('|')[1];
      if (cs !== 'snomed-ct') {
        this.router.navigate(['/resources/code-systems/', cs, 'concepts', concept, 'view']);
      } else {
        this.router.navigate(['/integration/snomed/', concept]);
      }
    } else if (relation.type === 'page') {
      this.router.navigate(['/thesaurus/pages/', relation.target]);
    }
  }

  public openPage(relation: PageRelation): void {
    this.router.navigate(['/thesaurus/pages/', relation.content!.code]);
  }
}
