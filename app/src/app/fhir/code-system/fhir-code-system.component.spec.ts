import {TestBed} from '@angular/core/testing';
import {FhirCodeSystemComponent} from './fhir-code-system.component';

describe('FhirCodeSystemComponent', () => {
    let component: FhirCodeSystemComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ FhirCodeSystemComponent ]
        });

        component = TestBed.createComponent(FhirCodeSystemComponent).componentInstance;
    });

    it('should correctly filter concepts recursively', () => {
        const testConcepts = [
            {
                code: 'A00',
                display: 'Cholera',
                definition: 'An infectious disease',
                concept: [
                    { code: 'A00.1', display: 'Cholera due to Vibrio cholerae', definition: 'Caused by V. cholerae' }
                ]
            },
            {
                code: 'B00',
                display: 'Herpesviral infections',
                definition: 'Viral infections'
            }
        ];

        const results = component['filter'](testConcepts, 'A00');

        expect(results).toEqual([
            {
                code: 'A00',
                display: 'Cholera',
                definition: 'An infectious disease',
                concept: [
                    { code: 'A00.1', display: 'Cholera due to Vibrio cholerae', definition: 'Caused by V. cholerae' }
                ]
            }
        ]);
    });

    it('should return only top-level matching concepts if no children match', () => {
        const testConcepts = [
            {
                code: 'A00',
                display: 'Cholera',
                definition: 'An infectious disease'
            },
            {
                code: 'B00',
                display: 'Herpesviral infections',
                definition: 'Viral infections'
            }
        ];

        const results = component['filter'](testConcepts, 'B00');

        expect(results).toEqual([
            {
                code: 'B00',
                display: 'Herpesviral infections',
                definition: 'Viral infections'
            }
        ]);
    });
});
