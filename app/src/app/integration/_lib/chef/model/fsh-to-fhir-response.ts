import {ChefMessage} from 'term-web/integration/_lib/chef/model/chef-message';

export class FshToFhirResponse {
  public fhir?: any[];
  public errors?: ChefMessage[];
  public warnings?: ChefMessage[];
}
