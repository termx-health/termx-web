export class Package {
  public id?: number;
  public code?: string;
  public status?: string;
  public git?: string;

  public spaceId?: number;
}

export class PackageVersion {
  public id?: number;
  public version?: string;
  public description?: string;

  public packageId?: number;

  public resources?: PackageResource[];
}

export class PackageResource {
  public id?: number;
  public resourceType?: string;
  public resourceId?: string;
  public terminologyServer?: string;

  public versionId?: number;
}
