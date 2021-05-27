import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { ChartsModule } from 'ng2-charts';
import { ConsoleRoutingModule } from './console-routing.module';
import { ConsoleComponent } from './console.component';
import { ConsoleService } from './console.service';
import { ConfigComponent } from './config/config.component';
import { ConfirmComponent } from './confirm/confirm.component';

@NgModule({
  declarations: [
    ConsoleComponent,
    ConfigComponent,
    ConfirmComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatDialogModule,
    HttpClientModule,
    ConsoleRoutingModule,
    ChartsModule
  ],
  providers: [
    ConsoleService
  ],
  bootstrap: [],
  entryComponents: [
    ConfigComponent,
    ConfirmComponent
  ]
})
export class ConsoleModule { }
