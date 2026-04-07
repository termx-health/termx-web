import {CodeSystemVersionReference} from 'term-web/resources/_lib/code-system/model/code-system-version';

export interface CodeSystemArtifactImpact {
  artifactType?: string;
  artifactId?: string;
  artifactVersion?: string;
  dynamic?: boolean;
  affected?: boolean;
  reason?: string;
  snapshotCreatedAt?: Date | string;
  resolvedCodeSystemVersion?: CodeSystemVersionReference;
  currentCodeSystemVersion?: CodeSystemVersionReference;
}
