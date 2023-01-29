import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ScrumboardService } from '../../scrumboard.service';

@Component({
    selector: 'app-setting',
    templateUrl: 'setting.component.html'
})

export class SettingComponent implements OnInit {
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
        private _scrumboardService: ScrumboardService,
        public matDialogRef: MatDialogRef<SettingComponent>,
    ) { }

    ngOnInit() { }
}