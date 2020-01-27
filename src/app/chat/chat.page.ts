import { Component, OnInit } from '@angular/core';
import { ChatService, ChatMessage } from '../services/chat.service';
import firebase = require('firebase');
import { ProfileService, Profile } from '../services/profile.service';
import { NavController, AlertController } from '@ionic/angular';
import { checkLoggedIn } from '../util/auto-login';
import { DataService } from '../services/data.service';
import { Ride } from '../services/ride.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.page.html',
    styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
    public messages: ChatMessage[];
    public messagesLoaded = false;

    public user = firebase.auth().currentUser;

    public messageDraft: string;
    public ride: Ride;

    constructor(
        private profileService: ProfileService,
        private chatService: ChatService,
        private dataService: DataService,
        private alertCtrl: AlertController,
        private navCtrl: NavController
    ) { }

    async ngOnInit() {
        if (!await checkLoggedIn(this.alertCtrl, this.navCtrl)) {
            return;
        }

        this.user = firebase.auth().currentUser;
        this.ride = this.dataService.getData('chat');
        console.log('chat.ride', this.ride);

        this.messages = this.chatService.getChatMessages(this.ride.id);
        this.messagesLoaded = true;

        this.chatService.getChatMessageUpdates(this.ride.id).subscribe(res => {
            this.messages = res;
            this.messagesLoaded = true;
        });
    }

    async sendMessage() {
        await this.chatService.sendMessage({
            author: this.user.uid,
            content: this.messageDraft,
            ride: this.ride.id,
            date: new Date()
        });

        this.messageDraft = '';
    }

    async deleteMessage(message: ChatMessage) {
        const confirmDialog = await this.alertCtrl.create({
            header: 'Confirm deletion',
            message: 'Do you really want to delete this message?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        return;
                    }
                },
                {
                    text: 'Delete',
                    handler: async () => {
                        const alert = await this.alertCtrl.create({
                            header: 'Message deleted',
                            message: 'This message has been successfully deleted.',
                            buttons: ['Okay']
                        });

                        try {
                            await this.chatService.deleteMessage(message.id);
                        } catch (err) {
                            alert.setAttribute('header', 'Error');
                            alert.setAttribute('message', err.message);
                        }

                        alert.present();
                        await alert.onDidDismiss();
                    }
                }
            ]
        });
        confirmDialog.present();
    }
}
