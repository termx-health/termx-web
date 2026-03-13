import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {HttpContext} from '@angular/common/http';
import { ApplyPipe, BooleanInput, copyDeep, LoadingManager, validateForm, FilterPipe } from '@kodality-web/core-util';
import {catchError, of, throwError} from 'rxjs';
import {MuiSkipErrorHandler} from 'term-web/core/marina/http-error-handler';
import {DefinedProperty, PropertyRule, MapSetProperty} from 'term-web/resources/_lib';
import {DefinedPropertyLibService} from 'term-web/resources/_lib/defined-property/services/defined-property-lib.service';
import {MapSetService} from 'term-web/resources/map-set/services/map-set-service';
import { MuiCardModule, MuiDropdownModule, MuiEditableTableModule, MuiCheckboxModule, MuiCoreModule, MuiTableModule, MuiFormModule, MuiInputModule, MuiMultiLanguageInputModule, MuiNumberInputModule, MuiDividerModule, MuiIconModule } from '@kodality-web/marina-ui';
import { AsyncPipe } from '@angular/common';
import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { CodeSystemSearchComponent } from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import { ValueSetSearchComponent } from 'term-web/resources/_lib/value-set/containers/value-set-search.component';
import { TranslatePipe } from '@ngx-translate/core';
import { MarinaUtilModule } from '@kodality-web/marina-util';
import { LocalizedConceptNamePipe } from 'term-web/resources/_lib/code-system/pipe/localized-concept-name-pipe';

@Component({
    selector: 'tw-ms-properties',
    templateUrl: './map-set-properties.component.html',
    imports: [
        MuiCardModule,
        MuiDropdownModule,
        AddButtonComponent,
        FormsModule,
        MuiEditableTableModule,
        MuiCheckboxModule,
        MuiCoreModule,
        MuiTableModule,
        MuiFormModule,
        MuiInputModule,
        MuiMultiLanguageInputModule,
        ValueSetConceptSelectComponent,
        MuiNumberInputModule,
        MuiDividerModule,
        MuiIconModule,
        CodeSystemSearchComponent,
        ValueSetSearchComponent,
        AsyncPipe,
        TranslatePipe,
        MarinaUtilModule,
        ApplyPipe,
        FilterPipe,
        LocalizedConceptNamePipe,
    ],
})
export class MapSetPropertiesComponent implements OnInit, OnChanges {
  private mapSetService = inject(MapSetService);
  private definedEntityPropertyService = inject(DefinedPropertyLibService);

  @Input() public mapSetId?: string | null;
  @Input() public properties: MapSetProperty[] = [];
  @Input() @BooleanInput() public viewMode: boolean | string = false;

  protected propertyRowInstance: MapSetProperty = {rule: {filters: []}, status: 'active'};
  protected expandedPropertyKey?: string;
  protected loader = new LoadingManager();

  @ViewChild("form") public form?: NgForm;

  protected definedEntityProperties: DefinedProperty[];

  public ngOnInit(): void {
    this.definedEntityPropertyService.search({limit: -1}, new HttpContext().set(MuiSkipErrorHandler, true)).pipe(catchError((err) => err?.status === 403 ? of({data: []}) : throwError(() => err))).subscribe(r => this.definedEntityProperties = r.data);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['properties'] && this.properties) {
      this.properties.forEach(p => {
        p.rule ??= new PropertyRule();
        p.rule.filters ??= [];
      });
    }
  }

  public getProperties(): MapSetProperty[] {
    return this.properties;
  }

  public valid(): boolean {
    return validateForm(this.form);
  }

  public deletePropertyUsages(propertyId: number): void {
    this.loader.wrap('load', this.mapSetService.deletePropertyUsages(this.mapSetId, propertyId)).subscribe();
  }

  protected filterDefinedProperties = (p: DefinedProperty): boolean => {
    return p.kind === 'property';
  };

  public addDefinedProperty(dp: DefinedProperty): void {
    const p: MapSetProperty = copyDeep(dp);
    p.definedEntityPropertyId = p.id;
    p.id = undefined;
    p.status = 'active';

    if (!this.properties.find(d => d.name === dp.name)) {
      this.properties = [...this.properties, p];
    }
  }

  protected getPropertyKey = (p: MapSetProperty): string => {
    return p?.id ? `id:${p.id}` : `name:${p?.name || ''}`;
  };

  protected togglePropertyExpand(p: MapSetProperty, event?: any): void {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    const key = this.getPropertyKey(p);
    this.expandedPropertyKey = this.expandedPropertyKey === key ? undefined : key;
  }
}
