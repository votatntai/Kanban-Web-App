import { ScrumboardService } from './../../scrumboard.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-create-board',
    templateUrl: 'create-board.component.html'
})

export class CreateBoardComponent implements OnInit {
    projectForm: UntypedFormGroup;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
        private _scrumboardService: ScrumboardService,
        public matDialogRef: MatDialogRef<CreateBoardComponent>,
    ) { }

    ngOnInit() {

        // Init project form
        this.projectForm = this._formBuilder.group({
            name: [null, Validators.required],
            description: [null]
        });

    }

    createProject() {
        this._scrumboardService.createProject(this.projectForm.value).subscribe(result => {
            if (result) {
                this.matDialogRef.close();
            }
        });
    }


}