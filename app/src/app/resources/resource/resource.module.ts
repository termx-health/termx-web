import {NgModule} from '@angular/core';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {ResourceConfigurationAttributesComponent} from 'term-web/resources/resource/components/resource-configuration-attributes.component';
import {ResourceContactsComponent} from 'term-web/resources/resource/components/resource-contacts.component';
import {ResourceContextComponent} from 'term-web/resources/resource/components/resource-context.component';
import {ResourceFhirImportModalComponent} from 'term-web/resources/resource/components/resource-fhir-import-modal-component';
import {ResourceFormComponent} from 'term-web/resources/resource/components/resource-form.component';
import {ResourceIdentifiersComponent} from 'term-web/resources/resource/components/resource-identifiers.component';
import {ResourceRelatedArtifactWidgetComponent} from 'term-web/resources/resource/components/resource-related-artifact-widget.component';
import {ResourceReleaseModalComponent} from 'term-web/resources/resource/components/resource-release-modal-component';
import {ResourceSideInfoComponent} from 'term-web/resources/resource/components/resource-side-info.component';
import {ResourceTaskModalComponent} from 'term-web/resources/resource/components/resource-task-modal-component';
import {ResourceTasksWidgetComponent} from 'term-web/resources/resource/components/resource-tasks-widget.component';
import {ResourceVersionFormComponent} from 'term-web/resources/resource/components/resource-version-form.component';
import {TaskLibModule} from 'term-web/task/_lib';
import {UserLibModule} from 'term-web/user/_lib';
import {WikiLibModule} from 'term-web/wiki/_lib';
import {CoreUiModule} from '../../core/ui/core-ui.module';


@NgModule({
  imports: [
    CoreUiModule,
    ResourcesLibModule,
    TaskLibModule,
    WikiLibModule,
    UserLibModule
  ],
  exports: [
    ResourceContactsComponent,
    ResourceContextComponent,
    ResourceFormComponent,
    ResourceIdentifiersComponent,
    ResourceConfigurationAttributesComponent,
    ResourceSideInfoComponent,
    ResourceVersionFormComponent,
    ResourceTasksWidgetComponent,
    ResourceRelatedArtifactWidgetComponent,
    ResourceFhirImportModalComponent,
    ResourceTaskModalComponent,
    ResourceReleaseModalComponent
  ],
  declarations: [
    ResourceContactsComponent,
    ResourceContextComponent,
    ResourceFormComponent,
    ResourceIdentifiersComponent,
    ResourceConfigurationAttributesComponent,
    ResourceSideInfoComponent,
    ResourceVersionFormComponent,
    ResourceTasksWidgetComponent,
    ResourceRelatedArtifactWidgetComponent,
    ResourceFhirImportModalComponent,
    ResourceTaskModalComponent,
    ResourceReleaseModalComponent
  ]
})
export class ResourceModule {
}
