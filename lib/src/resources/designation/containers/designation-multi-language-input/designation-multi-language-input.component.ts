import {Component, forwardRef, Input, OnChanges, ViewChild} from '@angular/core';
import {NgChanges} from '@kodality-health/marina-ui';
import {AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, NgForm, ValidationErrors, Validator} from '@angular/forms';
import {BooleanInput, CoreI18nService, isDefined, markAsDirty, validateForm} from '@kodality-web/core-util';


export interface ValueWithExtras {
  value: string;
  preferred: boolean;
  status: string;
}

export interface MultiLanguageInputValue {
  [key: string]: ValueWithExtras;
}

export interface MultiLanguageInputLanguage {
  code: string;
  names?: MultiLanguageInputValue;
}

@Component({
  selector: 'twl-designation-multi-language-input',
  templateUrl: './designation-multi-language-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DesignationMultiLanguageInputComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DesignationMultiLanguageInputComponent),
      multi: true
    }
  ]
})
export class DesignationMultiLanguageInputComponent implements ControlValueAccessor, Validator, OnChanges {
  @Input() public languages?: MultiLanguageInputLanguage[];
  @Input() public requiredLanguages?: string[];
  @Input() @BooleanInput() public disabled: string | boolean = false;

  public val: MultiLanguageInputValue = {};
  public onChange: (_: MultiLanguageInputValue | null) => void = () => undefined;
  public onTouch: (_: MultiLanguageInputValue) => void = () => undefined;

  @ViewChild('form') public form?: NgForm;

  public constructor(
    private i18nService: CoreI18nService,
  ) { }


  public ngOnChanges(changes: NgChanges<DesignationMultiLanguageInputComponent>): void {
    const {requiredLanguages} = changes;
    if (requiredLanguages) {
      this.requiredLangs?.forEach(lang => this.addLanguage(lang));
    }
  }

  public validate(control: AbstractControl): ValidationErrors | null {
    if (control.dirty) {
      markAsDirty(this.form);
    }
    const validator = control.validator && control.validator({} as AbstractControl);
    if (validator && validator['required'] && !validateForm(this.form)) {
      return {required: true};
    } else {
      return null;
    }
  }

  public writeValue(obj?: MultiLanguageInputValue): void {
    this.val = {...obj};
    this.requiredLangs?.forEach(lang => this.addLanguage(lang, this.val[lang]?.value));
  }

  public fireOnChange(): void {
    if (Object.getOwnPropertyNames(this.val).length === 0) {
      this.onChange(null);
    } else {
      this.onChange(this.val);
    }
  }

  public registerOnChange(fn: (_: MultiLanguageInputValue | null) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: (_: MultiLanguageInputValue) => void): void {
    this.onTouch = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  public addLanguage(lang: string, value?: string): void {
    this.val[lang] = {
      value: value || "",
      preferred: false,
      status: 'draft'
    };
    this.val = {...this.val};
    this.fireOnChange();
  }

  public removeLanguage(lang: string): void {
    delete this.val[lang];
    this.val = {...this.val};
    this.fireOnChange();
  }


  public requiredFirst = (langs: string[], requiredLangs: string[]): string[] => {
    return langs.sort(a => requiredLangs?.includes(a) ? -1 : 1);
  };

  public isRequired = (lang: string, requiredLangs: string[]): boolean => {
    return isDefined(requiredLangs) && requiredLangs.includes(lang);
  };

  public isFree = (lang: MultiLanguageInputLanguage, val: MultiLanguageInputValue): boolean => {
    return isDefined(val) && !(lang.code in val);
  };

  public langName = (lang: string, langs: MultiLanguageInputLanguage[], locale: string): string => {
    return langs?.find(l => l.code === lang)?.names?.[locale].value || lang;
  };

  public get currentLang(): string {
    return this.i18nService.currentLang!;
  }

  public get langs(): MultiLanguageInputLanguage[] | undefined {
    return this.languages;
  }

  public get requiredLangs(): string[] | undefined {
    return this.requiredLanguages;
  }
}
