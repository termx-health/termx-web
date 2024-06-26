import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {DestroyService, LoadingManager} from '@kodality-web/core-util';
import {of} from 'rxjs';
import {CodeSystemFileImportService} from 'term-web/resources/_lib/code-system/services/code-system-file-import.service';
import {CodeSystem, CodeSystemLibService, CodeSystemVersion} from '../../../../resources/_lib';


@Component({
  selector: 'tw-cs-file-import-form',
  templateUrl: 'code-system-file-import-form.component.html',
  providers: [DestroyService, CodeSystemFileImportService]
})
export class CodeSystemFileImportFormComponent {
  public sourceCodeSystem: CodeSystem;

  @Input() public data: {
    // general
    codeSystem: CodeSystem,
    codeSystemVersion?: {
      version?: string;
      status?: string;
      releaseDate?: Date;
      baseCodeSystemVersion?: string;
    },
    generateValueSet?: boolean;
    dryRun?: boolean;
    cleanRun?: boolean
    cleanConceptRun?: boolean
    // source
    source?: {
      type?: string,
      format?: string
      file?: string,
    }
    // properties
    template?: string
  } = {
    codeSystem: {},
    codeSystemVersion: {},
    generateValueSet: false,
    dryRun: true,
    cleanRun: false,
    cleanConceptRun: false,
    source: {
      type: 'link',
      format: 'csv',
      file: undefined
    }
  };

  @Input() public breadcrumbs: string[];

  public loader = new LoadingManager();

  @ViewChild('fileInput') public fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('jsonFileInput') public jsonFileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('form') public form?: NgForm;

  public constructor(
    private codeSystemLibService: CodeSystemLibService
  ) {}

  public createCodeSystem(): void {
    this.sourceCodeSystem = undefined;
    this.data.codeSystem = new CodeSystem();
    this.data.codeSystem['_new'] = true;

    this.createCodeSystemVersion();
  }

  public createCodeSystemVersion(): void {
    this.data.codeSystemVersion = {
      status: 'draft'
    };
    this.data.codeSystemVersion['_new'] = true;
    this.data.cleanRun = false;
    this.data.cleanConceptRun = false;
  }


  protected onCodeSystemSelect(id: string): void {
    const req$ = id ? this.codeSystemLibService.load(id, true) : of(undefined);

    this.loader.wrap('cs', req$).subscribe(cs => {
      this.sourceCodeSystem = cs;
      this.data.codeSystemVersion = {};
      this.data.cleanRun = false;
      this.data.cleanConceptRun = false;

      const draftVersions = cs?.versions?.filter(v => this.filterVersion(v, 'draft'));
      if (!draftVersions?.length) {
        this.createCodeSystemVersion();
      }
    });
  }
  /* Utils */

  protected getVersions = (versions: CodeSystemVersion[]): string[] => {
    return versions?.map(v => v.version);
  };

  protected filterVersion = (v: CodeSystemVersion, status: string): boolean => {
    return v.status === status;
  };

  protected get isNewResource(): boolean {
    return this.data?.codeSystem?.['_new'];
  }

  protected get isNewVersion(): boolean {
    return this.data?.codeSystemVersion?.['_new'];
  }

  public get valid(): boolean {
    return this.form?.valid;
  }

  public cleanSupplementInfo(isSupplement: boolean): void {
    if (isSupplement) {
      return;
    }
    this.data.codeSystem.baseCodeSystem = undefined;
    this.data.codeSystemVersion.baseCodeSystemVersion = undefined;
  }
}
