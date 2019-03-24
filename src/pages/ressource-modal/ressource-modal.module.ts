import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RessourceModalPage } from './ressource-modal';

@NgModule({
  declarations: [
    RessourceModalPage,
  ],
  imports: [
    IonicPageModule.forChild(RessourceModalPage),
  ],
})
export class RessourceModalPageModule {}
