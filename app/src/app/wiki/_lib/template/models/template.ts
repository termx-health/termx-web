import {LocalizedName} from '@kodality-web/marina-util';
import {TemplateContent} from 'term-web/wiki/_lib/template/models/template-content';

export class Template {
  public id?: number;
  public code?: string;
  public names?: LocalizedName;
  public contentType?: string;
  public contents?: TemplateContent[];
}
