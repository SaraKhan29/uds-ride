import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { tryAutoLogin } from '../util/auto-login';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  private loggingIn = false;

  constructor(
    private alertCtrl: AlertController,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    this.loggingIn = true;
    const autoLoginSuccess = await tryAutoLogin(this.alertCtrl);
    if (autoLoginSuccess) {
      this.navCtrl.navigateRoot('tabs');
    }
    this.loggingIn = false;
  }
}
