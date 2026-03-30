import {LocalizedName} from '@termx-health/util';
import {ReleaseResource} from 'term-web/sys/_lib/release/model/release-resource';

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
