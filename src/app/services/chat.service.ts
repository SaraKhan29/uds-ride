import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Profile, ProfileService } from './profile.service';

export interface ChatMessageData {
    content: string;
    author: string;
    ride: string;
    date: Date;
}

export class ChatMessage {
    public author: Profile;

    public content: string;
    public ride: string;
    public date: Date;
    public id: string;

    constructor(id: string, private data: ChatMessageData, chatService: ChatService, profileService: ProfileService) {
        this.content = this.data.content;
        this.ride = this.data.ride;
        this.date = this.data.date;
        this.id = id;

        chatService.getMessage(id).subscribe((message: ChatMessageData) => {
            this.data = message;
            this.content = data.content;
            this.ride = data.ride;
            this.date = data.date;
        });

        this.author = profileService.getProfile(data.author);

        profileService.getProfileUpdates(data.author).subscribe(profile => {
            this.author = profile;
        });
    }
}

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private chatMessageCollection: AngularFirestoreCollection<ChatMessageData>;

    private chatMessageUpdates: Observable<ChatMessage[]>;
    private chatMessages: ChatMessage[] = [];

    constructor(db: AngularFirestore, profileService: ProfileService) {
        this.chatMessageCollection = db.collection<ChatMessageData>('chat_messages');

        this.chatMessageUpdates = this.chatMessageCollection.snapshotChanges().pipe(
            map(actions => {
                return actions.map(a => {
                    const data = a.payload.doc.data();
                    const id = a.payload.doc.id;
                    return new ChatMessage(id, data, this, profileService);
                });
            })
        );

        this.chatMessageUpdates.subscribe(res => {
            this.chatMessages = res;
        });
    }

    getChatMessages(ride: string): ChatMessage[] {
        return this.chatMessages.filter(message => {
            return message.ride === ride;
        }).sort((a, b) => {
            return a.date < b.date ? -1 : 1;
        });
    }

    getChatMessageUpdates(ride: string) {
        return this.chatMessageUpdates.pipe(
            map(messages => {
                return messages.filter(message => {
                    return message.ride === ride;
                }).sort((a, b) => {
                    return a.date < b.date ? -1 : 1;
                });
            })
        );
    }

    getMessage(id: string) {
        return this.chatMessageCollection.doc<ChatMessageData>(id).valueChanges();
    }

    sendMessage(message: ChatMessageData) {
        return this.chatMessageCollection.add(message);
    }

    deleteMessage(id: string) {
        return this.chatMessageCollection.doc(id).delete();
    }
}
