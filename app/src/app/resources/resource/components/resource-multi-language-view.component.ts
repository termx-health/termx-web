import {Component, Input} from '@angular/core';
import {CoreI18nService, ApplyPipe} from '@termx-health/core-util';
import {MuiConfigService} from '@termx-health/ui';

@Component({
  selector: 'tw-resource-multi-language-view',
  templateUrl: 'resource-multi-language-view.component.html',
  imports: [ApplyPipe]
})
export class ResourceMultiLanguageViewComponent {
  @Input() public value?: {[lang: string]: string};

  public constructor(
    private i18nService: CoreI18nService,
    private configService: MuiConfigService
  ) {}

  protected hasValue = (value?: {[lang: string]: string}): boolean => {
    if (!value) {
      return false;
    }
    return Object.values(value).some(v => !!v?.trim());
  };

  protected entries = (value?: {[lang: string]: string}): [string, string][] => {
    return Object.entries(value || {}).filter(([_, text]) => !!text?.trim());
  };

  protected langName = (lang: string): string => {
    const currentLang = this.i18nService?.currentLang;
    const langs = this.configService.getConfigFor('multiLanguageInput')?.languages;
    return langs?.find(l => l.code === lang)?.names?.[currentLang] || lang;
  };
}
