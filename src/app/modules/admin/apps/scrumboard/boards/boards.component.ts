import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { CreateBoardComponent } from './create-board/create-board.comonent';
import { Project } from './../kanban.model';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { DateTime } from 'luxon';
import { Board } from 'app/modules/admin/apps/scrumboard/scrumboard.models';
import { ScrumboardService } from 'app/modules/admin/apps/scrumboard/scrumboard.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'scrumboard-boards',
    templateUrl: './boards.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScrumboardBoardsComponent implements OnInit, OnDestroy {
    boards: Board[];
    projects: Project[];

    // Private
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _scrumboardService: ScrumboardService,
        private _dialog: MatDialog,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the boards
        this._scrumboardService.boards$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((boards: Board[]) => {
                this.boards = boards;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get project
        this._scrumboardService.projects$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((projects: Project[]) => {
                this.projects = projects;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    openCreateProjectDialog() {
        this._dialog.open(CreateBoardComponent, {
            width: '720px'
        }).afterClosed().subscribe();
    }
    /**
     * Format the given ISO_8601 date as a relative date
     *
     * @param date
     */
    formatDateAsRelative(date: string): string {
        return DateTime.fromISO(date).toRelative();
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
