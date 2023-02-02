import { AddMemberComponent } from './add-member/add-member.component';
import { RemoveStatusDialogComponent } from './remove-status-dialog/remove-status-dialog.component';
import { DialogRef } from '@angular/cdk/dialog';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Board, List } from 'app/modules/admin/apps/scrumboard/scrumboard.models';
import { ScrumboardService } from 'app/modules/admin/apps/scrumboard/scrumboard.service';
import { DateTime } from 'luxon';
import { Subject, takeUntil } from 'rxjs';
import { Project } from '../kanban.model';
import { Issue, Status } from './../kanban.model';
import { SettingComponent } from '../card/settings/setting.component';

@Component({
    selector: 'scrumboard-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScrumboardBoardComponent implements OnInit, OnDestroy {
    board: Board;
    project: Project;
    listTitleForm: UntypedFormGroup;
    filterMode: 'Default' | 'Subtask' = 'Default';
    user: any;
    isOwner: boolean = false;

    // Private
    private readonly _positionStep: number = 65536;
    private readonly _maxListCount: number = 200;
    private readonly _maxPosition: number = this._positionStep * 500;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _dialog: MatDialog,
        private _scrumboardService: ScrumboardService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        //Get user from local storage 
        this.user = JSON.parse(localStorage.getItem('user'));

        // Initialize the list title form
        this.listTitleForm = this._formBuilder.group({
            title: ['']
        });

        // Get the board
        this._scrumboardService.board$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((board: Board) => {
                this.board = { ...board };

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the project
        this._scrumboardService.project$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((project: Project) => {
                this.project = { ...project };

                // Check if user is project owner
                if (this.project.leader.id === this.user.id) {
                    this.isOwner = true;
                } else {
                    this.isOwner = false;
                }

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

    /**
     * Focus on the given element to start editing the list title
     *
     * @param listTitleInput
     */
    renameList(listTitleInput: HTMLElement): void {
        // Use timeout so it can wait for menu to close
        setTimeout(() => {
            listTitleInput.focus();
        });
    }

    /**
     * Add new list
     *
     * @param title
     */
    addList(title: string): void {
        // Limit the max list count
        if (this.project.statuses.length >= this._maxListCount) {
            return;
        }

        // Create a new list model
        const list = new Status({
            projectId: this.project.id,
            isFirst: false,
            isLast: false,
            position: this.project.statuses.length ? this.project.statuses[this.project.statuses.length - 1].position + this._positionStep : this._positionStep,
            name: title
        });

        // Save the list
        this._scrumboardService.createList(list).subscribe();
    }

    /**
     * Update the list title
     *
     * @param event
     * @param list
     */
    updateListTitle(event: any, list: Status): void {
        // Get the target element
        const element: HTMLInputElement = event.target;

        // Get the new title
        const newTitle = element.value;

        // If the title is empty...
        if (!newTitle || newTitle.trim() === '') {
            // Reset to original title and return
            element.value = list.name;
            return;
        }

        // Update the list title and element value
        list.name = element.value = newTitle.trim();

        // Update the list
        this._scrumboardService.updateList(list).subscribe();
    }

    /**
     * Delete the list
     *
     * @param id
     */
    deleteList(status): void {
        // Open the confirmation dialog
        // const confirmation = this._fuseConfirmationService.open({
        //     title: 'Delete list',
        //     message: 'Are you sure you want to delete this list and its cards? This action cannot be undone!',
        //     actions: {
        //         confirm: {
        //             label: 'Delete'
        //         }
        //     }
        // });
        var list = this.project.statuses.find(list => list.id === status.id);
        var hasItem = false;
        if (list) {
            hasItem = list.issues.length > 0;
        }
        this._dialog.open(RemoveStatusDialogComponent, {
            data: {
                status: status,
                project: this.project,
                hasItem: hasItem
            }
        }).afterClosed().subscribe(result => {
            if (result) {
                this._scrumboardService.deleteList(status.id, result.id).subscribe();
            }
        });

        // Subscribe to the confirmation dialog closed action
        // confirmation.afterClosed().subscribe((result) => {

        //     // If the confirm button pressed...
        //     if (result === 'confirmed') {

        //         // Delete the list
        //         this._scrumboardService.deleteList(id).subscribe();
        //     }
        // });
    }

    filterSubTask(issues: Issue[], isChild: boolean) {
        return issues.filter(issue => issue.isChild === isChild);
    }

    openAddMemberDialog() {
        this._dialog.open(AddMemberComponent, {
            width: '720px',
            data: {
                project: this.project
            }
        }).afterClosed().subscribe();
    }

    openSettingDialog() {
        this._dialog.open(SettingComponent, {
            width: '480px',
            data: {
                project: this.project
            }
        }).afterClosed().subscribe();
    }

    /**
     * Add new card
     */
    addCard(list: Status, title: string): void {
        // Create a new card model
        const card = new Issue({
            projectId: this.project.id,
            statusId: list.id,
            isChild: false,
            position: list.issues.length ? list.issues[list.issues.length - 1].position + this._positionStep : this._positionStep,
            name: title,
        });

        // Save the card
        this._scrumboardService.createCard(card).subscribe();
    }

    /**
 * Add new sub card
 */
    addSubCard(list: Status, title: string): void {
        // Create a new sub card model
        const card = new Issue({
            projectId: this.project.id,
            statusId: list.id,
            isChild: true,
            position: list.issues.length ? list.issues[list.issues.length - 1].position + this._positionStep : this._positionStep,
            name: title,
        });

        // Save the card
        this._scrumboardService.createSubCard(card).subscribe();
    }

    /**
     * List dropped
     *
     * @param event
     */
    listDropped(event: CdkDragDrop<List[]>): void {
        // Move the item
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

        // Calculate the positions
        const updated = this._calculatePositions(event);

        // Update the lists
        this._scrumboardService.updateLists(updated).subscribe();
    }

    /**
     * Card dropped
     *
     * @param event
     */
    cardDropped(event: CdkDragDrop<Issue[]>): void {
        // Move or transfer the item
        if (event.previousContainer === event.container) {

            // Move the item
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        }
        else {

            let status = this.project.statuses.find(status => status.id === event.container.id);

            if (!status.limit || event.container.data.length < status.limit) {

                // Transfer the item
                transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

                // Update the card's list it
                event.container.data[event.currentIndex].statusId = event.container.id;
            }
        }

        // Calculate the positions
        const updated = this._calculatePositions(event);

        // Update the cards
        this._scrumboardService.updateCards(updated).subscribe();
    }

    /**
     * Check if the given ISO_8601 date string is overdue
     *
     * @param date
     */
    isOverdue(date: string): boolean {
        return DateTime.fromISO(date).startOf('day') < DateTime.now().startOf('day');
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

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Calculate and set item positions
     * from given CdkDragDrop event
     *
     * @param event
     * @private
     */
    private _calculatePositions(event: CdkDragDrop<any[]>): any[] {
        // Get the items
        let items = event.container.data;
        const currentItem = items[event.currentIndex];
        const prevItem = items[event.currentIndex - 1] || null;
        const nextItem = items[event.currentIndex + 1] || null;

        // If the item moved to the top...
        if (!prevItem) {
            // If the item moved to an empty container
            if (!nextItem) {
                currentItem.position = this._positionStep;
            }
            else {
                currentItem.position = nextItem.position / 2;
            }
        }
        // If the item moved to the bottom...
        else if (!nextItem) {
            currentItem.position = prevItem.position + this._positionStep;
        }
        // If the item moved in between other items...
        else {
            currentItem.position = (prevItem.position + nextItem.position) / 2;
        }

        // Check if all item positions need to be updated
        if (!Number.isInteger(currentItem.position) || currentItem.position >= this._maxPosition) {
            // Re-calculate all orders
            items = items.map((value, index) => {
                value.position = (index + 1) * this._positionStep;
                return value;
            });

            // Return items
            return items;
        }

        // Return currentItem
        return [currentItem];
    }
}
