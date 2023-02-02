import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgModule } from '@angular/core';
import { MatLuxonDateModule, MAT_LUXON_DATE_FORMATS } from '@angular/material-luxon-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { DateAgoPipe } from '@fuse/pipes/time/time-ago.pipe';
import { ScrumboardBoardAddCardComponent } from 'app/modules/admin/apps/scrumboard/board/add-card/add-card.component';
import { ScrumboardBoardAddListComponent } from 'app/modules/admin/apps/scrumboard/board/add-list/add-list.component';
import { ScrumboardBoardComponent } from 'app/modules/admin/apps/scrumboard/board/board.component';
import { ScrumboardBoardsComponent } from 'app/modules/admin/apps/scrumboard/boards/boards.component';
import { ScrumboardCardComponent } from 'app/modules/admin/apps/scrumboard/card/card.component';
import { ScrumboardCardDetailsComponent } from 'app/modules/admin/apps/scrumboard/card/details/details.component';
import { ScrumboardComponent } from 'app/modules/admin/apps/scrumboard/scrumboard.component';
import { scrumboardRoutes } from 'app/modules/admin/apps/scrumboard/scrumboard.routing';
import { SharedModule } from 'app/shared/shared.module';
import { AddMemberComponent } from './board/add-member/add-member.component';
import { RemoveStatusDialogComponent } from './board/remove-status-dialog/remove-status-dialog.component';
import { CreateBoardComponent } from './boards/create-board/create-board.comonent';
import { LogWorkComponent } from './card/details/log-work/log-work.component';
import { SettingComponent } from './card/settings/setting.component';

@NgModule({
    declarations: [
        ScrumboardComponent,
        ScrumboardBoardsComponent,
        ScrumboardBoardComponent,
        ScrumboardBoardAddCardComponent,
        ScrumboardBoardAddListComponent,
        ScrumboardCardComponent,
        ScrumboardCardDetailsComponent,
        RemoveStatusDialogComponent,
        CreateBoardComponent,
        AddMemberComponent,
        LogWorkComponent,
        SettingComponent,
        DateAgoPipe
    ],
    imports: [
        RouterModule.forChild(scrumboardRoutes),
        DragDropModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatSelectModule,
        MatOptionModule,
        MatTooltipModule,
        MatTabsModule,
        MatInputModule,
        MatLuxonDateModule,
        MatMenuModule,
        MatProgressBarModule,
        SharedModule,
    ],
    providers: [
        {
            provide: MAT_DATE_FORMATS,
            useValue: MAT_LUXON_DATE_FORMATS
        }
    ]
})
export class ScrumboardModule {
}
