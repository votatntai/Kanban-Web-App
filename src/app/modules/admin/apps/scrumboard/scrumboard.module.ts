import { CreateBoardComponent } from './boards/create-board/create-board.comonent';
import { RemoveStatusDialogComponent } from './board/remove-status-dialog/remove-status-dialog.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatOptionModule, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatLuxonDateModule, MAT_LUXON_DATE_FORMATS } from '@angular/material-luxon-adapter';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SharedModule } from 'app/shared/shared.module';
import { ScrumboardComponent } from 'app/modules/admin/apps/scrumboard/scrumboard.component';
import { ScrumboardBoardsComponent } from 'app/modules/admin/apps/scrumboard/boards/boards.component';
import { ScrumboardBoardComponent } from 'app/modules/admin/apps/scrumboard/board/board.component';
import { ScrumboardBoardAddCardComponent } from 'app/modules/admin/apps/scrumboard/board/add-card/add-card.component';
import { ScrumboardBoardAddListComponent } from 'app/modules/admin/apps/scrumboard/board/add-list/add-list.component';
import { ScrumboardCardComponent } from 'app/modules/admin/apps/scrumboard/card/card.component';
import { ScrumboardCardDetailsComponent } from 'app/modules/admin/apps/scrumboard/card/details/details.component';
import { scrumboardRoutes } from 'app/modules/admin/apps/scrumboard/scrumboard.routing';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DateAgoPipe } from '@fuse/pipes/time/time-ago.pipe';

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
