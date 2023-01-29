import { Issue, Label, Project, Status, Priority, Member } from './../../kanban.model';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { debounceTime, Subject, takeUntil, tap } from 'rxjs';
import { DateTime } from 'luxon';
import { ScrumboardService } from 'app/modules/admin/apps/scrumboard/scrumboard.service';

@Component({
    selector: 'scrumboard-card-details',
    templateUrl: './details.component.html',
    styleUrls: ['details.component.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScrumboardCardDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('labelInput') labelInput: ElementRef<HTMLInputElement>;
    project: Project;
    issue: Issue;
    cardForm: UntypedFormGroup;
    labels: Label[] = [];
    priorities: Priority[] = [];
    members: Member[] = [];
    filteredLabels: Label[];
    isStatusChanged: boolean = false;
    isDone: boolean = false;

    // Private
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<ScrumboardCardDetailsComponent>,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
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

        // Get the project
        this._scrumboardService.project$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((board) => {

                // Board data
                this.project = board;

                // Get the labels
                this.labels = this.filteredLabels = board.labels;
            });

        // Get the card details
        this._scrumboardService.issue$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((card) => {
                this.issue = card;
            });

        // Prepare the card form
        this.cardForm = this._formBuilder.group({
            id: [''],
            name: ['', Validators.required],
            description: [''],
            labels: [[]],
            estimateTime: [null, [Validators.min(0), Validators.max(8)]],
            priorityId: [null],
            statusId: [null],
            assigneeId: [null],
            dueDate: [null]
        });

        // Fill the form
        this.cardForm.setValue({
            id: this.issue.id,
            name: this.issue.name,
            description: this.issue.description,
            labels: this.issue.labels,
            estimateTime: this.issue.estimateTime,
            priorityId: this.issue.priorityId,
            statusId: this.issue.statusId,
            assigneeId: this.issue.assignee?.id || null,
            dueDate: this.issue.dueDate
        });

        // Update card when there is a value change on the card form
        this.cardForm.valueChanges
            .pipe(
                debounceTime(1000),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe((value) => {
                if (this.cardForm.valid) {
                    // Update the card on the server
                    this._scrumboardService.updateCard(value.id, value).subscribe(result => {
                        // Update the card position if status changed 
                        if (this.isStatusChanged) {
                            this._scrumboardService.getProject(this.project.id).subscribe(() => {
                                this.isStatusChanged = false;
                            });
                        }
                        // Update the card object
                        this.issue = result;
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });
                }

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
     * Return whether the card has the given label
     *
     * @param label
     */
    hasLabel(label: Label): boolean {
        return !!this.issue.labels.find(cardLabel => cardLabel.id === label.id);
    }

    /**
     * Filter labels
     *
     * @param event
     */
    filterLabels(event): void {
        // Get the value
        const value = event.target.value.toLowerCase();

        // Filter the labels
        this.filteredLabels = this.labels.filter(label => label.name.toLowerCase().includes(value));
    }

    /**
     * Filter labels input key down event
     *
     * @param event
     */
    filterLabelsInputKeyDown(event): void {
        // Return if the pressed key is not 'Enter'
        if (event.key !== 'Enter') {
            return;
        }

        // If there is no label available...
        if (this.filteredLabels.length === 0) {
            // Return
            return;
        }

        // If there is a label...
        const label = this.filteredLabels[0];
        const isLabelApplied = this.issue.labels.find(cardLabel => cardLabel.id === label.id);

        // If the found label is already applied to the card...
        if (isLabelApplied) {
            // Remove the label from the card
            this.removeLabelFromCard(label);
        }
        else {
            // Otherwise add the label to the card
            this.addLabelToCard(label);
        }
    }

    /**
     * Toggle card label
     *
     * @param label
     * @param change
     */
    toggleProductTag(label: Label, change: MatCheckboxChange): void {
        if (change.checked) {
            this.addLabelToCard(label);
        }
        else {
            this.removeLabelFromCard(label);
        }
    }

    /**
     * Add label to the card
     *
     * @param label
     */
    addLabelToCard(label: Label): void {
        // Add the label
        this.issue.labels.unshift(label);

        // Update the card form data
        this.cardForm.get('labels').patchValue(this.issue.labels);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Remove label from the card
     *
     * @param label
     */
    removeLabelFromCard(label: Label): void {
        // Remove the label
        this.issue.labels.splice(this.issue.labels.findIndex(cardLabel => cardLabel.id === label.id), 1);

        // Update the card form data
        this.cardForm.get('labels').patchValue(this.issue.labels);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Check if the given date is overdue
     */
    isOverdue(date: string): boolean {
        return DateTime.fromISO(date).startOf('day') < DateTime.now().startOf('day');
    }

    /**
 * Change issue status
 */
    statusChanged(event: any) {
        this.isStatusChanged = true;
        this.cardForm.controls['statusId'].setValue(event.value);
    }

    /**
* Change issue assignee
*/
    assigneeChanged(event: any) {
        if (event.value == 'null') {
            event.value = null;
        }
        this.cardForm.controls['assigneeId'].setValue(event.value);
    }

    /**
* Change issue priority
*/
    priorityChanged(event: any) {
        this.cardForm.controls['priorityId'].setValue(event.value);
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
     * Read the given file for demonstration purposes
     *
     * @param file
     */
    private _readAsDataURL(file: File): Promise<any> {
        // Return a new promise
        return new Promise((resolve, reject) => {

            // Create a new reader
            const reader = new FileReader();

            // Resolve the promise on success
            reader.onload = (): void => {
                resolve(reader.result);
            };

            // Reject the promise on error
            reader.onerror = (e): void => {
                reject(e);
            };

            // Read the file as the
            reader.readAsDataURL(file);
        });
    }
}
