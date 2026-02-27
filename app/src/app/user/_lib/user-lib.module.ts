import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MarinaUiModule} from '@kodality-web/marina-ui';
import {UserSelectComponent} from 'term-web/user/_lib/components/user-select.component';
import {CoreUiModule} from 'term-web/core/ui/core-ui.module';
import {UserLibService} from 'term-web/user/_lib/services/user-lib.service';

@NgModule({
    imports: [
        CommonModule,
        MarinaUiModule,
        CoreUiModule,
        FormsModule,
        UserSelectComponent
    ],
    providers: [UserLibService],
    exports: [
        UserSelectComponent
    ]
})
export class UserLibModule {
}
