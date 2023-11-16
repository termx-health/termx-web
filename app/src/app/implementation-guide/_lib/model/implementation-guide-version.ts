import {LocalizedName} from '@kodality-web/marina-util';

export class ImplementationGuideVersion {
  public id?: number;
  public implementationGuide?: string;
  public version?: string;
  public status?: string;
  public fhirVersion?: string;
  public githubUrl?: string;
  public emptyGithubUrl?: string;
  public template?: string;
  public packageId?: string;
  public algorithm?: string;
  public date?: Date;
  public dependsOn?: ImplementationGuideVersionDependsOn[];
  public groups?: ImplementationGuideVersionGroup[];
  public resources?: ImplementationGuideVersionResource[];
}

export class ImplementationGuideVersionDependsOn {
  public packageId?: string;
  public version?: string;
  public reason?: string;
}

export class ImplementationGuideVersionGroup {
  public id?: number;
  public name?: string;
  public description?: LocalizedName;
}

export class ImplementationGuideVersionResource {
  public id?: number;
  public type?: string;
  public reference?: string;
  public version?: string;
  public name?: string;
  public group?: ImplementationGuideVersionGroup;
}
