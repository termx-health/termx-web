export interface UcumExportDesignation {
  type?: string;
  language?: string;
  value?: string;
  preferred?: boolean;
  supplement?: boolean;
}

export interface UcumExportUnit {
  code?: string;
  kind?: string;
  property?: string;
  designations?: UcumExportDesignation[];
}

export interface UcumExportResponse {
  supplements?: string[];
  units?: UcumExportUnit[];
}
