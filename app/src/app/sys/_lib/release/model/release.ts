import {LocalizedName} from '@kodality-web/marina-util';
import {ReleaseResource} from 'term-web/sys/_lib';

export class Release {
  public id?: number;
  public code?: string;
  public names?: LocalizedName;
  public planned?: Date;
  public releaseDate?: Date;
  public status?: string;
  public authors?: string[];
  public resources?: ReleaseResource[];
  public terminologyServer?: string;
}
