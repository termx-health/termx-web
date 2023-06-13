import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PageService} from '../../services/page.service';
import {collect, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {GithubExportable} from '../../../integration/_lib/github/github.service';
import {Page, PageContent, PageLink, PageRelation, PageTag} from 'term-web/thesaurus/_lib';
import {MuiConfigService} from '@kodality-web/marina-ui';
import {forkJoin} from 'rxjs';

@Component({
  templateUrl: './thesaurus-page.component.html',
  styleUrls: ['thesaurus-page.component.less']
})
export class ThesaurusPageComponent implements OnInit {
  public pageId?: number;
  public pageContent?: PageContent;
  public pageContents: PageContent[] = [];
  public pageLinks: PageLink[] = [];
  public pageRelations?: {[k: string]: PageRelation[]};
  public pageTags?: PageTag[];
  public usages?: PageRelation[];
  public path?: number[];
  public contentModalData: {
    visible?: boolean,
    content?: PageContent
  } = {};

  protected loader = new LoadingManager();

  @ViewChild("contentForm") public contentFrom?: NgForm;

  public constructor(
    private router: Router,
    private route: ActivatedRoute,
    private pageService: PageService,
    protected muiConfig: MuiConfigService
  ) { }

  public ngOnInit(): void {
    this.route.paramMap.subscribe(routeParam => {
      this.init();

      const slug = routeParam.get("slug");
      if (slug) {
        this.loader.wrap('init', this.pageService.searchPages({slug: slug, limit: 1})).subscribe(pages => {
          const page = pages.data[0];
          if (!page) {
            this.router.navigate(['/thesaurus/pages']);
          } else {
            this.init(page, slug);
          }
        });
      }
    });
  }

  private init(page?: Page, slug?: string): void {
    this.pageId = page?.id;
    this.pageContent = page?.contents!.find(c => c.slug === slug);
    this.pageContents = page?.contents || [];
    this.pageRelations = collect(page?.relations || [], r => r.type);
    this.pageLinks = page?.links || [];
    this.pageTags = page?.tags || [];
    this.path = [];

    if (page) {
      forkJoin([
        this.pageService.getPath(page.id),
        this.pageService.searchPageRelations({
          type: 'page', target: page.contents?.map(c => c.slug).join(',')!,
          limit: 999
        })
      ]).subscribe(([path, resp]) => {
        this.path = path;
        this.usages = resp.data;
      });
    }
  }


  public saveContent(): void {
    if (!validateForm(this.contentFrom)) {
      return;
    }
    this.loader.wrap('save', this.pageService.savePageContent(this.contentModalData.content, this.pageId)).subscribe(content => {
      this.router.navigate(['/thesaurus/pages/', content.slug, 'edit']);
    });
  }


  public openContentModal(lang: string): void {
    this.contentModalData = {
      visible: true,
      content: {lang: lang, contentType: 'markdown'}
    };
  }

  public editPageContent(content: PageContent): void {
    this.router.navigate(['/thesaurus/pages/', content.slug, 'edit']);
  }


  public filterContents = (contents: PageContent[], lang: string): PageContent[] => {
    return contents.filter(c => c.lang !== lang);
  };

  public filterLanguages = (supportedLangs: string[], currentLang: string, contents: PageContent[]): string[] => {
    return supportedLangs.filter(l => l !== currentLang && !contents.find(c => c.lang === l));
  };

  public prepareExport = (): GithubExportable[] => {
    let filename = `${this.pageContent?.slug}.${this.pageContent?.contentType === 'markdown' ? 'md' : 'html'}`;
    return [{content: this.pageContent?.content, filename: filename}];
  };


  public viewTarget(relation: PageRelation): void {
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

  public viewPage(relation: PageRelation): void {
    this.router.navigate(['/thesaurus/pages/', relation.content!.code]);
  }

  public viewPageContent(content: PageContent): void {
    if (isDefined(content)) {
      this.router.navigate(['/thesaurus/pages/', content.slug]);
    }
  }

  public get isLoading(): boolean {
    return this.loader.isLoadingExcept('init');
  }
}
