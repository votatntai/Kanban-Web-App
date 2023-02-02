import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation/confirmation.service';
import { ScrumboardService } from 'app/modules/admin/apps/scrumboard/scrumboard.service';
import { DateTime } from 'luxon';
import { debounceTime, fromEvent, Subject, takeUntil } from 'rxjs';
import { Issue, Label, LogWork, Member, Priority, Project } from './../../kanban.model';
import { LogWorkComponent } from './log-work/log-work.component';

@Component({
    selector: 'scrumboard-card-details',
    templateUrl: './details.component.html',
    styleUrls: ['details.component.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScrumboardCardDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('labelInput') labelInput: ElementRef<HTMLInputElement>;
    user: any;
    project: Project;
    issue: Issue;
    cardForm: UntypedFormGroup;
    priorities: Priority[] = [];
    members: Member[] = [];
    isStatusChanged: boolean = false;
    isDone: boolean = false;
    filteredTags: Label[];
    tags: Label[];
    tagsEditMode: boolean = false;
    commentForm: UntypedFormGroup;
    webLinkToggle: boolean = false;
    childIssueToggle: boolean = false;
    weblinkForm: UntypedFormGroup;
    urlPattern = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
    spentTime: number = null;
    remainingTime: number = 0;
    calculateTime: string = '0';
    timeRemaining: string = '0';
    childIssueForm: UntypedFormGroup;

    // Private
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<ScrumboardCardDetailsComponent>,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
        private _dialog: MatDialog,
        private _router: Router,
        private _fuseConfirmationService: FuseConfirmationService,
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

        // Get the project
        this._scrumboardService.project$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((board) => {

                // Board data
                this.project = board;

                // Get the labels
                this.tags = this.filteredTags = board.labels;
            });

        // Get the card details
        this._scrumboardService.issue$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((card) => {
                this.issue = card;
                this.calculateTimeTracking();
            });

        // Prepare the card form
        this.cardForm = this._formBuilder.group({
            id: [''],
            name: ['', Validators.required],
            description: [''],
            labels: [[]],
            estimateTime: [null, [Validators.min(0), Validators.max(72)]],
            priorityId: [null],
            statusId: [null],
            assigneeId: [null],
            dueDate: [null]
        });

        // Prepare the comment form
        this.commentForm = this._formBuilder.group({
            userId: [this.user.id, Validators.required],
            issueId: [this.issue.id, Validators.required],
            content: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(256)]]
        });

        // Prepare the web link form
        this.weblinkForm = this._formBuilder.group({
            url: ['', [Validators.required, Validators.pattern(this.urlPattern)]],
            issueId: [this.issue.id, Validators.required],
            description: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(256)]]
        });

        // Prepare the child issue form
        this.initialChildIssueForm();

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

        // Mark for check
        this._changeDetectorRef.markForCheck();

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
     * Toggle the tags edit mode
     */
    toggleTagsEditMode(): void {
        this.tagsEditMode = !this.tagsEditMode;
    }

    toggleWebLinkCreateMode() {
        this.webLinkToggle = !this.webLinkToggle;
    }

    toggleChildIssueCreateMode() {
        this.childIssueToggle = !this.childIssueToggle;
    }

    initialChildIssueForm() {
        this.childIssueForm = this._formBuilder.group({
            name: ['', Validators.required],
            description: [''],
            priorityId: [this.issue.priorityId, Validators.required],
            statusId: [this.issue.statusId, Validators.required],
            parentId: [this.issue.id, Validators.required],
            projectId: [this.issue.projectId, Validators.required]
        });
    }

    /**
 * Filter tags
 *
 * @param event
 */
    filterTags(event): void {
        // Get the value
        const value = event.target.value.toLowerCase();

        // Filter the tags
        this.filteredTags = this.tags.filter(tag => tag.name.toLowerCase().includes(value));
    }

    isTagChecked(tag: Label): boolean {
        return this.issue.labels.some(label => label.id === tag.id);
    }

    /**
 * Filter tags input key down event
 *
 * @param event
 */
    filterTagsInputKeyDown(event): void {
        // Return if the pressed key is not 'Enter'
        if (event.key !== 'Enter') {
            return;
        }

        // If there is no tag available...
        if (this.filteredTags.length === 0) {
            // Create the tag
            this.createTag(event.target.value);

            // Clear the input
            event.target.value = '';

            // Return
            return;
        }

        // If there is a tag...
        const tag = this.filteredTags[0];
        const isTagApplied = this.issue.labels.find(label => label.id === tag.id);

        // If the found tag is already applied to the product...
        if (isTagApplied) {
            // Remove the tag from the product
            this.removeTagFromProduct(tag);
        }
        else {
            // Otherwise add the tag to the product
            this.addTagToProduct(tag);
        }
    }

    /**
     * Create a new tag
     *
     * @param title
     */
    createTag(title: string): void {
        const tag: Label = {
            id: null,
            name: title,
            projectId: this.project.id
        };

        // Create tag on the server
        this._scrumboardService.createLabel(tag)
            .subscribe((response) => {

                // Add the tag to the product
                this.addTagToProduct(response);
            });

    }

    /**
     * Update the tag title
     *
     * @param tag
     * @param event
     */
    updateTagTitle(tag: Label, event): void {
        fromEvent(event.target, 'input').pipe(debounceTime(1000)).subscribe(() => {

            // Update the title on the tag
            tag.name = event.target.value;

            // Update the tag on the server
            this._scrumboardService.updateLabel(tag.id, tag).subscribe(() => {

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        })

    }

    /**
     * Delete the tag
     *
     * @param tag
     */
    deleteTag(tag: Label): void {
        // Delete the tag from the server
        this._scrumboardService.deleteLabel(tag.id).subscribe(() => {

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Add tag to the product
     *
     * @param tag
     */
    addTagToProduct(tag: Label): void {
        // Add the tag
        this.issue.labels.unshift(tag);

        // Update the selected product form
        this.cardForm.get('labels').patchValue(this.issue.labels);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Remove tag from the product
     *
     * @param tag
     */
    removeTagFromProduct(tag: Label): void {
        // Remove the tag
        this.issue.labels.splice(this.issue.labels.findIndex(item => item.id === tag.id), 1);

        // Update the selected product form
        this.cardForm.get('tags').patchValue(this.issue.labels);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }


    /**
     * Should the create tag button be visible
     *
     * @param inputValue
     */
    shouldShowCreateTagButton(inputValue: string): boolean {
        return !!!(inputValue === '' || this.tags.findIndex(tag => tag.name.toLowerCase() === inputValue.toLowerCase()) > -1);
    }

    /**
     * Return whether the card has the given label
     *
     * @param label
     */
    hasLabel(label: Label): boolean {
        return !!this.issue.labels.find(cardLabel => cardLabel.id === label.id);
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

    removeIssue() {
        var config = {
            title: `Remove "` + this.issue.name + `"`,
            message: `You're about to permanently delete this issue, its comments and attachments, and all of its data. 
            If you're not sure, you can resolve or close this issue instead.`
        }
        this._fuseConfirmationService.open(config).afterClosed().subscribe(result => {
            if (result === 'confirmed') {
                this._scrumboardService.deleteCard(this.issue.id).subscribe(result => {
                    if (result) {
                        this.matDialogRef.close();
                    }
                })
            }
        })
    }

    postComment() {
        if (this.commentForm.valid) {
            this._scrumboardService.postComment(this.commentForm.value).subscribe(result => {
                if (result) {
                    this.commentForm.reset();
                }
                this._changeDetectorRef.markForCheck();
            })
        }
    }

    deleteComment(id: string) {
        this._fuseConfirmationService.open().afterClosed().subscribe(result => {
            if (result === 'confirmed') {
                this._scrumboardService.deleteComment(id).subscribe(() => {
                    this._changeDetectorRef.markForCheck();
                })
            }
        })
    }

    createWebLink() {
        if (this.weblinkForm.valid) {
            this._scrumboardService.createWebLink(this.weblinkForm.value).subscribe(result => {
                if (result) {
                    this.weblinkForm.reset();
                    this.weblinkForm.controls['issueId'].setValue(this.issue.id);
                    this.webLinkToggle = false;
                }
                this._changeDetectorRef.markForCheck();
            })
        }
    }

    deleteWebLink(id: string) {
        this._fuseConfirmationService.open().afterClosed().subscribe(result => {
            if (result === 'confirmed') {
                this._scrumboardService.deleteWebLink(id).subscribe(() => {
                    this._changeDetectorRef.markForCheck();
                })
            }
        })
    }

    openLogWorkDialog(logWork?: LogWork) {
        this._dialog.open(LogWorkComponent, {
            width: '480px',
            data: {
                issue: this.issue,
                logWork: logWork
            }
        })
    }

    deleteLogWork(id: string) {
        this._fuseConfirmationService.open().afterClosed().subscribe(result => {
            if (result === 'confirmed') {
                this._scrumboardService.deleteLogWork(id).subscribe(() => {
                    this._changeDetectorRef.markForCheck();
                })
            }
        })
    }

    calculateTimeTracking() {
        var totalTime = this.issue.estimateTime;
        var spentTime = 0;

        // Calculate total spent time of issue log work
        this.issue.logWorks.forEach(logWork => {
            spentTime += logWork.spentTime;
        });
        this.spentTime = spentTime;

        if (totalTime) {

            // Calculate ratio when spent time less than estimate time
            if (spentTime <= totalTime) {
                let ratio = spentTime / totalTime * 100;
                ratio < 0 ? ratio = 0 : ratio > 100 ? ratio = 100 : 0;
                this.calculateTime = ratio + '%';
            }

            // Calculate ratio when spent time more than estimate time
            else {
                let ratio = totalTime / spentTime * 100;
                this.calculateTime = ratio + '%';
            }

        } else if (spentTime > 0) {
            this.calculateTime = '100%';
        } else {
            this.calculateTime = '0';
        }

        // Calculate remaining time
        let remaining = 0;
        spentTime <= totalTime ? remaining = totalTime - spentTime : remaining = 0;
        this.remainingTime = remaining;

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    createChildIssue() {
        if (this.childIssueForm.valid) {
            this._scrumboardService.createChildIssue(this.childIssueForm.value).subscribe(result => {
                console.log(result);
                this.childIssueForm.reset();
                this.childIssueToggle = false;
                this.initialChildIssueForm();
                this._changeDetectorRef.markForCheck();
            })
        }
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
