import {ChefMessage} from './chef-message';

export class FshToFhirResponse {
  public fhir?: any[];
  public errors?: ChefMessage[];
  public warnings?: ChefMessage[];
}
