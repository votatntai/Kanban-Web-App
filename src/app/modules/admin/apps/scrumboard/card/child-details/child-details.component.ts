import { FuseConfirmationService } from './../../../../../../../@fuse/services/confirmation/confirmation.service';
import { Label, Project } from './../../kanban.model';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ScrumboardService } from '../../scrumboard.service';
import { debounceTime, fromEvent, Subject, takeUntil } from 'rxjs';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
    selector: 'app-child-details',
    templateUrl: 'child-details.component.html',
    styleUrls: ['child-details.component.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ChildDetailsComponent implements OnInit {
    @ViewChild('labelInput') labelInput: ElementRef<HTMLInputElement>;

    user: any;
    child: any;
    project: Project;
    filteredTags: Label[];
    tags: Label[];
    childIssueForm: UntypedFormGroup;
    tagsEditMode: boolean = false;
    commentForm: UntypedFormGroup;

    // Private
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _fuseConfirmationService: FuseConfirmationService,
        public dialogRef: MatDialogRef<ChildDetailsComponent>,
        private _formBuilder: UntypedFormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _scrumboardService: ScrumboardService,
    ) { }

    ngOnInit() {

        //Get user from local storage
        this.user = JSON.parse(localStorage.getItem('user'));

        // Get child issue from dialog data
        this.child = this.data.child;

        // Get the project
        this._scrumboardService.project$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((board) => {

                // Board data
                this.project = board;

                // Get the labels
                this.tags = this.filteredTags = board.labels;
            });

        // Prepare the child issue form
        this.childIssueForm = this._formBuilder.group({
            id: [''],
            name: ['', Validators.required],
            description: [''],
            labels: [[]],
            priorityId: [null],
            statusId: [null],
            reporterId: [null],
            assigneeId: [null],
        });

        // Prepare the comment form
        this.initialCommentForm();

        // Fill the form
        this.childIssueForm.setValue({
            id: this.child.id,
            name: this.child.name,
            description: this.child.description,
            labels: this.child.labels,
            priorityId: this.child.priority.id,
            statusId: this.child.status.id,
            reporterId: this.child.reporter.id,
            assigneeId: this.child.assignee?.id || null,
        });

        // Update card when there is a value change on the card form
        this.childIssueForm.valueChanges
            .pipe(
                debounceTime(1000),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe((value) => {
                if (this.childIssueForm.valid) {
                    // Update the card on the server
                    this._scrumboardService.updateChildIssue(value.id, value).subscribe(result => {
                        // Update the card object
                        this.child = result;
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });
                }

            });
    }

    initialCommentForm() {
        this.commentForm = this._formBuilder.group({
            userId: [this.user.id, Validators.required],
            issueId: [this.child.id, Validators.required],
            content: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(256)]]
        });
    }

    /**
 * Toggle the tags edit mode
 */
    toggleTagsEditMode(): void {
        this.tagsEditMode = !this.tagsEditMode;
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
        return this.child.labels.some(label => label.id === tag.id);
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
        const isTagApplied = this.child.labels.find(label => label.id === tag.id);

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
        this.child.labels.unshift(tag);

        // Update the selected product form
        this.childIssueForm.get('labels').patchValue(this.child.labels);

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
        this.child.labels.splice(this.child.labels.findIndex(item => item.id === tag.id), 1);

        // Update the selected product form
        this.childIssueForm.get('tags').patchValue(this.child.labels);

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
        return !!this.child.labels.find(cardLabel => cardLabel.id === label.id);
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
        this.child.labels.unshift(label);

        // Update the card form data
        this.childIssueForm.get('labels').patchValue(this.child.labels);

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
        this.child.labels.splice(this.child.labels.findIndex(cardLabel => cardLabel.id === label.id), 1);

        // Update the card form data
        this.childIssueForm.get('labels').patchValue(this.child.labels);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
* Change issue status
*/
    statusChanged(event: any) {
        this.childIssueForm.controls['statusId'].setValue(event.value);
    }

    /**
* Change issue assignee
*/
    assigneeChanged(event: any) {
        if (event.value == 'null') {
            event.value = null;
        }
        this.childIssueForm.controls['assigneeId'].setValue(event.value);
    }

    /**
* Change issue priority
*/
    priorityChanged(event: any) {
        this.childIssueForm.controls['priorityId'].setValue(event.value);
    }
    /**
* Change issue priority
*/
    reporterChanged(event: any) {
        this.childIssueForm.controls['reporterId'].setValue(event.value);
    }

    postComment() {
        if (this.commentForm.valid) {
            this._scrumboardService.postCommentForChild(this.commentForm.value).subscribe(result => {
                if (result) {
                    this.commentForm.reset();
                    this.initialCommentForm();
                }
                this._changeDetectorRef.markForCheck();
            })
        }
    }

    deleteComment(id: string) {
        this._fuseConfirmationService.open().afterClosed().subscribe(result => {
            if (result === 'confirmed') {
                this._scrumboardService.deleteChildComment(id, this.child).subscribe(() => {
                    this._changeDetectorRef.markForCheck();
                })
            }
        })
    }

    removeChildIssue(id: string) {
        this._fuseConfirmationService.open().afterClosed().subscribe(result => {
            if (result === 'confirmed') {
                this._scrumboardService.deleteChildIssue(id).subscribe(result => {
                    this.dialogRef.close();
                    this._changeDetectorRef.markForCheck();
                })
            }
        })
    }

}