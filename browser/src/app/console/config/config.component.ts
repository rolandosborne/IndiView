import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConfig } from '../appConfig';
import { ConsoleService } from '../console.service';
import { ConfirmComponent } from '../confirm/confirm.component';

@Component({
  selector: 'console-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {

  private token: string = null;
  public configSet: boolean = false;
  public config: AppConfig = { consoleToken: "", appNode: "", appToken: "", appRegistry: "", appHandle: "" };

  constructor(private consoleService: ConsoleService,
      private dialog: MatDialog,
      private dialogRef: MatDialogRef<ConfigComponent>,
      @Inject(MAT_DIALOG_DATA) private data: any) { 
    this.token = data;
  }

  ngOnInit(): void {
    this.consoleService.getConfig(this.token).then(c => {
      this.config = c;
      this.configSet = true;
    }).catch(err => {
      console.log(err);
      window.alert("failed to get config");
    });
  }

  public onClose() {
    this.dialogRef.close("close");
  }
  
  public onSave() {
    let msg: string = "Are you sure you want to update the config?";
    let ref: MatDialogRef<ConfirmComponent> = this.dialog.open(ConfirmComponent,
        { position: { left: 'calc(50% - 250px)' }, width: '500px', data: msg });
    ref.afterClosed().subscribe(res => {
      if(res == "yes") {
        this.consoleService.setConfig(this.token, this.config).then(() => {
          this.dialogRef.close("close");
        }).catch(err => {
          console.log(err);
          window.alert("failed to set config");
        });
      }
    });
  }
}
