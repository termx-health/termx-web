import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BooleanInput, DestroyService, group, isDefined } from '@kodality-web/core-util';
import { TransformationDefinition, TransformationDefinitionLibService, TransformationDefinitionQueryParams } from 'term-web/modeler/_lib/index';
import { catchError, finalize, forkJoin, map, Observable, of, Subject, takeUntil } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { NzSelectItemInterface } from 'ng-zorro-antd/select/select.types';
import { ArrayUtil } from 'term-web/core/utils/array-util';

@Component({
	selector: 'tw-transformation-definition-search',
	templateUrl: './transformation-definition-search.component.html',
	styleUrls: ['./transformation-definition-search.component.less'],
	providers: [
		{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TransformationDefinitionSearchComponent), multi: true },
		DestroyService
	]
})
export class TransformationDefinitionSearchComponent implements OnInit, ControlValueAccessor {

	@Input() @BooleanInput() public disabled: string | boolean = false;
	@Input() @BooleanInput() public valuePrimitive: string | boolean = false;
	@Input() @BooleanInput() public autoUnselect: string | boolean = false;
	@Input() @BooleanInput() public multiple: string | boolean;
	@Input() public filter?: (resource: TransformationDefinition) => boolean;
	@Input() public placeholder = 'marina.ui.inputs.search.placeholder';

	@Output() public twSelect = new EventEmitter<any>();

	public data: { [id: number]: TransformationDefinition } = {};
	public value?: number | number[];
	public searchUpdate = new Subject<string>();
	private loading: { [key: string]: boolean } = {};

	public onChange = (x: any) => x;
	public onTouched = (x: any) => x;

	public constructor(
		private transformationDefinitionService: TransformationDefinitionLibService,
		private destroy$: DestroyService
	) {
	}

	public ngOnInit(): void {
		this.searchUpdate.pipe(
			debounceTime(250),
			distinctUntilChanged(),
			switchMap(text => this.searchTransformationDefinition(text)),
		).subscribe(data => this.data = data);
	}

	public onSearch(text: string): void {
		this.searchUpdate.next(text);
	}

	public writeValue(obj: TransformationDefinition | TransformationDefinition[] | number | number[]): void {
		if (Array.isArray(obj)) {
			this.value = obj.map(p => typeof p === 'object' ? p?.id : p);
			this.loadTransformationDefinition(this.value);
		} else {
			this.value = typeof obj === 'object' ? obj?.id : obj;
			this.loadTransformationDefinition([this.value]);
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

	private searchTransformationDefinition(text: string): Observable<{ [id: number]: TransformationDefinition }> {
		if (!text || text.length < 1) {
			return of(this.data);
		}

		const q = new TransformationDefinitionQueryParams();
		q.nameContains = text;
		q.limit = 10_000;

		this.loading['search'] = true;
		return this.transformationDefinitionService.search(q).pipe(
			takeUntil(this.destroy$),
			map(ca => group(ca.data, c => c.id!)),
			catchError(() => of(this.data)),
			finalize(() => this.loading['search'] = false)
		);
	}

	private loadTransformationDefinition(ids?: number[]): void {
		if (isDefined(ids) && ids.length > 0) {
			this.loading['load'] = true;

			const batches = ArrayUtil.batchArray(ids, 100);
			const requests = batches.map(batch =>
				this.transformationDefinitionService.search({ ids: batch.join(',') })
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
