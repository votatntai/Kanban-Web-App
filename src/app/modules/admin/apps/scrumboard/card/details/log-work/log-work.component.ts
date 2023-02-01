import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ScrumboardService } from '../../../scrumboard.service';
import { Issue } from './../../../kanban.model';

@Component({
    selector: 'app-log-work',
    templateUrl: 'log-work.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class LogWorkComponent implements OnInit {

    logWorkForm: UntypedFormGroup;
    issue: Issue;
    user: any;
    spentTime: number = null;
    remainingTime: number = 0;
    calculateTime: string = '0';
    timeRemaining: string = '0';

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<LogWorkComponent>,
        private _formBuilder: UntypedFormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _scrumboardService: ScrumboardService,
    ) { }

    ngOnInit() {

        // Get user from local storage
        this.user = JSON.parse(localStorage.getItem('user'));

        // Initial issue from dialog data
        this.issue = this.data.issue;

        // Initial log work form
        this.logWorkForm = this._formBuilder.group({
            userId: [this.user.id, Validators.required],
            issueId: [this.issue.id, Validators.required],
            spentTime: [null, [Validators.required, Validators.min(1), Validators.max(72)]],
            remainingTime: [{ value: '', disabled: true }, Validators.required],
            description: [null, [Validators.minLength(8), Validators.maxLength(256)]]
        });

        // Call calculate time function
        this.calculateTimeTracking();

        // Subscribe spent time input value change
        this.spentTimeValueChange();
    }

    createLogWork() {
        if (this.logWorkForm.valid) {
            this._scrumboardService.createLogWork(this.logWorkForm.value).subscribe(result => {
                this._changeDetectorRef.markForCheck();
                if (result) {
                    this.dialogRef.close();
                }
            })
        }
    }

    private spentTimeValueChange() {
        this.logWorkForm.get('spentTime').valueChanges.subscribe(result => {
            if (result == null) {
                result = 0;
            }
            if (result >= 0) {
                this.calculateTimeTracking(result);
            }
        })
    }

    private calculateTimeTracking(time?: number) {
        var totalTime = this.issue.estimateTime || 0;
        var spentTime = time || 0;

        // Calculate total spent time of issue log work
        this.issue.logWorks.forEach(logWork => {
            spentTime += logWork.spentTime;
        });
        this.spentTime = spentTime;

        if (totalTime != 0) {
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
        } else if (time && time > 0) {
            this.calculateTime = '100%';
        } else {
            this.calculateTime = '0';
        }

        // Calculate remaining time
        let remaining = 0;
        spentTime <= totalTime ? remaining = totalTime - spentTime : remaining = 0;
        this.remainingTime = remaining;
        this.logWorkForm.controls['remainingTime'].setValue(remaining);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
}