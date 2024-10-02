import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BooleanInput, DestroyService, group, isDefined } from '@kodality-web/core-util';
import { StructureDefinition, StructureDefinitionLibService, StructureDefinitionSearchParams } from 'term-web/modeler/_lib';
import { catchError, finalize, forkJoin, map, Observable, of, Subject, takeUntil } from 'rxjs';
import { NzSelectItemInterface } from 'ng-zorro-antd/select/select.types';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ArrayUtil } from 'term-web/core/utils/array-util';

@Component({
	selector: 'tw-structure-definition-search',
	templateUrl: './structure-definition-search.component.html',
	styleUrls: ['./structure-definition-search.component.less'],
	providers: [
		{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StructureDefinitionSearchComponent), multi: true },
		DestroyService
	]
})
export class StructureDefinitionSearchComponent implements OnInit, ControlValueAccessor {

	@Input() @BooleanInput() public disabled: string | boolean = false;
	@Input() @BooleanInput() public valuePrimitive: string | boolean = false;
	@Input() @BooleanInput() public autoUnselect: string | boolean = false;
	@Input() @BooleanInput() public multiple: string | boolean;
	@Input() public filter?: (resource: StructureDefinition) => boolean;
	@Input() public placeholder = 'marina.ui.inputs.search.placeholder';

	@Output() public twSelect = new EventEmitter<any>();

	public data: { [id: number]: StructureDefinition } = {};
	public value?: number | number[];
	public searchUpdate = new Subject<string>();
	private loading: { [key: string]: boolean } = {};

	public onChange = (x: any) => x;
	public onTouched = (x: any) => x;

	public constructor(
		private structureDefinitionService: StructureDefinitionLibService,
		private destroy$: DestroyService
	) {
	}

	public ngOnInit(): void {
		this.searchUpdate.pipe(
			debounceTime(250),
			distinctUntilChanged(),
			switchMap(text => this.searchStructureDefinition(text)),
		).subscribe(data => this.data = data);
	}

	public onSearch(text: string): void {
		this.searchUpdate.next(text);
	}

	public writeValue(obj: StructureDefinition | StructureDefinition[] | number | number[]): void {
		if (Array.isArray(obj)) {
			this.value = obj.map(p => typeof p === 'object' ? p?.id : p);
			this.loadStructureDefinition(this.value);
		} else {
			this.value = typeof obj === 'object' ? obj?.id : obj;
			this.loadStructureDefinition([this.value]);
		}
	}

	public registerOnChange(fn: any): void {
		this.onChange = fn;
	}

	public registerOnTouched(fn: any): void {
		this.onTouched = fn;
	}

	public fireOnChange(): void {
		this.twSelect.emit(Array.isArray(this.value) ? this.value.map(id => this.data?.[id]) : this.data?.[this.value]);
		if (this.valuePrimitive) {
			this.onChange(this.value);
		} else {
			const v = Array.isArray(this.value) ? this.value.map(id => this.data?.[id]) : this.data?.[this.value];
			this.onChange(v);
		}
	}

	public filterOption = (_input: string, { nzValue }: NzSelectItemInterface): boolean => {
		return !this.filter || this.filter(this.data[nzValue]);
	};

	public get isLoading(): boolean {
		return Object.values(this.loading).some(Boolean);
	}

	private searchStructureDefinition(text: string): Observable<{ [id: number]: StructureDefinition }> {
		if (!text || text.length < 1) {
			return of(this.data);
		}

		const q = new StructureDefinitionSearchParams();
		q.textContains = text;
		q.limit = 10_000;

		this.loading['search'] = true;
		return this.structureDefinitionService.search(q).pipe(
			takeUntil(this.destroy$),
			map(ca => group(ca.data, c => c.id!)),
			catchError(() => of(this.data)),
			finalize(() => this.loading['search'] = false)
		);
	}

	private loadStructureDefinition(ids?: number[]): void {
		if (isDefined(ids) && ids.length > 0) {
			this.loading['load'] = true;

			const batches = ArrayUtil.batchArray(ids, 100);
			const requests = batches.map(batch =>
				this.structureDefinitionService.search({ ids: batch.join(',') })
					.pipe(takeUntil(this.destroy$))
			);
			forkJoin(requests).subscribe(responses => {
				responses.forEach(resp =>
					this.data = {
						...(this.data || {}),
						...group(resp.data, c => c.id)
					});
			}).add(() => this.loading['load'] = false);
		}
	}
}
