import { AngularFirestoreCollection, AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Profile {
    id?: string;
    first_name: string;
    last_name: string;
    phone: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    private profileCollection: AngularFirestoreCollection<Profile>;

    private profiles = new Map<string, Profile>();
    private profileUpdates: Observable<Profile[]>;

    constructor(db: AngularFirestore) {
        this.profileCollection = db.collection<Profile>('profiles');

        this.profileUpdates = this.profileCollection.snapshotChanges().pipe(
            map(actions => {
                return actions.map(a => {
                    const data = a.payload.doc.data();
                    const id = a.payload.doc.id;
                    return { id, ...data };
                });
            })
        );

        this.profileUpdates.subscribe(res => {
            for (const profile of res) {
                this.profiles.set(profile.id, profile);
            }
        });
    }

    getProfile(id: string) {
        return this.profiles.get(id);
    }

    getAllProfileUpdates() {
        return this.profileUpdates;
    }

    getProfileUpdates(id: string) {
        return this.profileCollection.doc<Profile>(id).valueChanges();
    }

    updateProfile(profile: Profile, id: string) {
        return this.profileCollection.doc(id).update(profile);
    }

    addProfile(profile: Profile, uid: string) {
        this.profileCollection.doc(uid).set(profile);
        return this.profileCollection.doc(uid);
    }

    removeProfile(id: string) {
        return this.profileCollection.doc(id).delete();
    }
}
