import {CommonModule} from '@angular/common';
import {Component, inject} from '@angular/core';
import {CorePipesModule} from '@kodality-web/core-util';
import {MuiFormModule, MuiListModule} from '@kodality-web/marina-ui';
import {environment} from 'environments/environment';
import {InfoService} from './info.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MuiFormModule,
    MuiListModule,
    CorePipesModule
  ],
  template: `
      <m-form-row>
          <div *m-form-col class="tw-flex-container" style="gap: 2rem">
              <h1 style="margin-top: 2.5rem">
                  <div>{{ env.appVersion }}</div>
                  <div class="m-subtitle small">{{ version | async }}</div>
              </h1>

              <section>
                  <h4 class="small">
                      Web
                  </h4>

                  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: 0.5rem ">
                      <div class="cardy m-rounded">
                          <div class="small">Default language</div>
                          <div class="m-text-secondary small">{{ env.defaultLanguage }}</div>
                      </div>

                      <div class="cardy m-rounded">
                          <div class="small">UI languages</div>
                          <div class="m-text-secondary small">{{ env.uiLanguages | join: ', ' }}</div>
                      </div>
                  </div>
              </section>

              <section>
                  <h4 class="small">
                      Modules
                  </h4>

                  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: 0.5rem ">
                      <ng-container *ngFor="let module of modules | async">
                          <div class="cardy m-rounded">
                              {{ module }}
                          </div>
                      </ng-container>
                  </div>
              </section>

              <section>
                  <h4 class="small">
                      Configured
                  </h4>

                  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: 0.5rem ">
                      <div class="cardy m-rounded" *ngIf="env.swaggerUrl">
                          <div class="small">Swagger</div>
                          <a class="m-text-secondary small" [href]="env.swaggerUrl">{{ env.swaggerUrl }}</a>
                      </div>

                      <div class="cardy m-rounded" *ngIf="env.chefUrl">
                          <div class="small">Chef</div>
                          <a class="m-text-secondary small" [href]="env.chefUrl">{{ env.chefUrl }}</a>
                      </div>

                      <div class="cardy m-rounded" *ngIf="env.chefFhirVersion">
                          <div class="small">Chef FHIR Version</div>
                          <div class="m-text-secondary small">{{ env.chefFhirVersion }}</div>
                      </div>

                      <div class="cardy m-rounded" *ngIf="env.fmlEditor">
                          <div class="small">FML</div>
                          <a class="m-text-secondary small" [href]="env.fmlEditor">{{ env.fmlEditor }}</a>
                      </div>

                      <div class="cardy m-rounded" *ngIf="env.plantUmlUrl">
                          <div class="small">PlantUML</div>
                          <a class="m-text-secondary small" [href]="env.plantUmlUrl">{{ env.plantUmlUrl }}</a>
                      </div>

                      <div class="cardy m-rounded" *ngIf="env.snowstormUrl">
                          <div class="small">Snowstorm</div>
                          <a class="m-text-secondary small" [href]="env.snowstormUrl">{{ env.snowstormUrl }}</a>
                      </div>
                  </div>
              </section>
          </div>
      </m-form-row>
  `,
  styles: [`
    .small {
      font-size: 0.9rem;
      word-break: break-all;
    }

    .cardy {
      background: var(--color-background-component);
      padding:  0.8rem 1rem
    }
  `]
})
export default class InfoComponent {
  protected service = inject(InfoService);
  protected env = environment;

  protected version = this.service.version();
  protected modules = this.service.modules();
}
