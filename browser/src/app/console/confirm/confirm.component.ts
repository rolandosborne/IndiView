import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'console-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements OnInit {

  public msg: string = "";

  constructor(
      private dialog: MatDialogRef<ConfirmComponent>,
      @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    this.msg = data;
  }

  ngOnInit() {
  }

  onConfirm() {
    this.dialog.close('yes');
  }

  onCancel() {
    this.dialog.close('no');
  }

}

