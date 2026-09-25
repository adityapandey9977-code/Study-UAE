import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import util from "./Util";

class fbase{
    constructor(){
        this.config = {
            apiKey: "AIzaSyDC1F664wtv4uOk5Ni4oanBdhPSM2TCOH4",
            authDomain: "agna-care.firebaseapp.com",
            databaseURL: "https://agna-care.firebaseio.com",
            projectId: "agna-care",
            storageBucket: "agna-care.appspot.com",
            messagingSenderId: "1019873367818",
            appId: "1:1019873367818:web:202f80d790a550e6e2ccf3",
            measurementId: "G-GKKBFGJL6M"
        };
        if(!firebase.apps.length){
            firebase.initializeApp(this.config);
        }
        this.auth=firebase.auth;
        this.db=firebase.database();
    }

    signup=(email, password)=>{
        return this.auth().createUserWithEmailAndPassword(email, password);
    }
    signin=(email, password)=>{
        return this.auth().signInWithEmailAndPassword(email, password);
    }

    onNewMsg=(ref, callback, limit)=>{
        limit=limit || 1;
        let dbref=this.db.ref(ref);
        dbref.limitToLast(limit).on("value", snapshot=>{
            let msgs=[];
            snapshot.forEach((snap)=>{
                msgs.push(snap.val());
            });
            if(callback){
                callback(msgs);
            }
        });
        return dbref;
    }
    allMsg=(ref, callback, limit)=>{
        limit=limit || 1000;
        let dbref=this.db.ref(ref);
        dbref.limitToLast(limit).once("value", snapshot=>{
            let msgs=[];
            snapshot.forEach((snap)=>{
                msgs.push(snap.val());
            });
            if(callback){
                callback(msgs);
            }
        });
        return dbref;
    }

    sendMsg=(ref, msg, errCallback)=>{
        try {
            this.db.ref(ref).push(msg);
        }catch(error){
            if(errCallback){
                errCallback(error);
            }
        }
    }

    offRefValue=(ref)=>{
        if(!ref){
            return;
        }
        try{
            ref.off("value");
        }catch(e){

        }
    }

    offRef=(ref)=>{
        try{
            this.db.ref(ref).off();
        }catch(e){
        }
    }

    offDb=()=>{
        try{
            this.db.off();
        }catch(e){

        }
    }

    defaultSignIn=async()=>{
        if(!this.isLogged()){
            util.showLoader();
            await this.signin("testagna@agnacare.com", "123456");
            window.sessionStorage['fbaseLogged']='Y';
            util.hideLoader();
        }
    }

    isLogged=()=>{
        let fbaseLogged=window.sessionStorage['fbaseLogged'] || '';
        return fbaseLogged==='Y'?1:0;
    }
}

export default new fbase();