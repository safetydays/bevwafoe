import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the RessourceModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-ressource-modal',
  templateUrl: 'ressource-modal.html',
})
export class RessourceModalPage {

  list = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
    //Beispiel
    this.list =["Pumpe", "Schlauch", "Schlauch", "Schlauch", "Pumpe 2", "Schlauch", "Schlauch"];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RessourceModalPage');
    //this.list = this.navParams.get('list');
  }

  public closeModal(){
    this.viewCtrl.dismiss();
  }

}
