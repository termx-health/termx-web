import {NgModule} from '@angular/core';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {ResourceContactsComponent} from 'term-web/resources/resource/components/resource-contacts.component';
import {ResourceContextComponent} from 'term-web/resources/resource/components/resource-context.component';
import {ResourceFormComponent} from 'term-web/resources/resource/components/resource-form.component';
import {ResourceIdentifiersComponent} from 'term-web/resources/resource/components/resource-identifiers.component';
import {ResourceSideInfoComponent} from 'term-web/resources/resource/components/resource-side-info.component';
import {ResourceVersionFormComponent} from 'term-web/resources/resource/components/resource-version-form.component';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {ResourceTasksWidgetComponent} from 'term-web/resources/resource/components/resource-tasks-widget.component';
import {ResourceRelatedArtifactWidgetComponent} from 'term-web/resources/resource/components/resource-related-artifact-widget.component';
import {ResourceFhirImportModalComponent} from 'term-web/resources/resource/components/resource-fhir-import-modal-component';


@NgModule({
  imports: [
    CoreUiModule,
    ResourcesLibModule
  ],
  exports: [
    ResourceContactsComponent,
    ResourceContextComponent,
    ResourceFormComponent,
    ResourceIdentifiersComponent,
    ResourceSideInfoComponent,
    ResourceVersionFormComponent,
    ResourceTasksWidgetComponent,
    ResourceRelatedArtifactWidgetComponent,
    ResourceFhirImportModalComponent
  ],
  declarations: [
    ResourceContactsComponent,
    ResourceContextComponent,
    ResourceFormComponent,
    ResourceIdentifiersComponent,
    ResourceSideInfoComponent,
    ResourceVersionFormComponent,
    ResourceTasksWidgetComponent,
    ResourceRelatedArtifactWidgetComponent,
    ResourceFhirImportModalComponent
  ]
})
export class ResourceModule {
}
