import {Component, forwardRef, Input, OnChanges, SimpleChanges} from '@angular/core';
import {compareNumbers} from '@kodality-web/core-util';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

interface Semver {
  src: string,
  base: string,
  major: number,
  minor: number,
  patch: number,
  extension: string
}

const REGEX = /^(0|[1-9]\d*)\.?(0|[1-9]\d*)?\.?(0|[1-9]\d*)?(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

@Component({
  selector: 'tw-semantic-version-select',
  templateUrl: 'semantic-version-select.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SemanticVersionSelectComponent), multi: true}]
})
export class SemanticVersionSelectComponent implements OnChanges, ControlValueAccessor {
  @Input() public versions: string[];

  protected semver: Semver;
  protected customVersion = true;

  protected version: string;
  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['versions']) {
      this.calc();
    }
  }


  private calc(): void {
    let semver = this.latestVersion(this.versions);
    if (!semver && this.versions && !this.versions?.length) {
      semver = this.latestVersion(['0.0.0']);
    }

    const versions = [
      this.composeVersion(semver, 'major'),
      this.composeVersion(semver, 'minor'),
      this.composeVersion(semver, 'patch')
    ];


    // cannot suggest next semver
    // current version is not among suggested semantic versions
    this.customVersion = !semver || this.version && !versions.some(v => v === this.version);
    this.semver = semver;
  }

  protected setCustom(): void {
    this.semver = undefined;
    this.customVersion = true
  }


  public writeValue(obj: string): void {
    this.version = obj;
    this.calc();
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  protected fireOnChange(): void {
    this.onChange(this.version);
  }


  protected latestVersion = (versions: string[]): Semver => {
    if (!versions) {
      return undefined;
    }

    const semVersions = versions
      .filter(v => REGEX.test(v))
      .filter(Boolean)
      .map(v => {
        const [src, _major, _minor, _patch] = v.match(REGEX);
        const major = Number(_major ?? 0);
        const minor = Number(_minor ?? 0);
        const patch = Number(_patch ?? 0);
        const base = [major, minor, patch].join('.');
        return {src, base, major, minor, patch, extension: src.replace(base, '')};
      })
      .sort((a, b) => {
        // string 1.3.4 > number 134
        const v1 = Number(a.base.replace(/\./gm, ''));
        const v2 = Number(b.base.replace(/\./gm, ''));
        return compareNumbers(v1, v2, false) || compareNumbers(a.src.length, b.src.length, true);
      });

    return semVersions[0];
  };

  protected composeVersion = (semver: Semver, core: 'major' | 'minor' | 'patch'): string => {
    const {major, minor, patch} = semver || {};

    if (core === 'major') {
      return [major + 1, 0, 0].join('.');
    }
    if (core === 'minor') {
      return [major, minor + 1, 0].join('.');
    }
    if (core === 'patch') {
      return [major, minor, patch + 1].join('.');
    }
  };
}
