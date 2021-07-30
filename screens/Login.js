import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import firebase from 'firebase';
import * as Google from 'expo-google-app-auth';

export default class Login extends React.Component{

    isUserEquual = (googleUser, firebaseUser) => {
        if(firebaseUser){
            var providerData = firebaseUser.providerData;
            for(var i = 0; i < providerData; i++){
                if(providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID 
                    && providerData[i].uid === googleUser.getBasicProfile().getId()){
                    return true;
                }
            }
        }
        return false
    }

    onSignIn = (googleUser) => {
        var unsubscribe = firebase.auth().onAuthStateChanged((firebaseUser) => {
            unsubscribe()
            if(!this.isUserEquual(googleUser, firebaseUser)){
                var credential = firebase.auth.GoogleAuthProvider.credential(
                    googleUser.idToken,
                    googleUser.accessToken
                )
                firebase.auth().signInWithCredential(credential).then(function(result){
                    if(result.additionalUserInfo.isNewUser){
                        firenase.database.ref('/user/' + result.user.uid).set({
                            gmail: result.user.email,
                            profile_picture: result.additionalUserInfo.profile.picture,
                            locale: result.additionalUserInfo.profile.locale,
                            first_name: result.additionalUserInfo.given_name,
                            last_name: result.additionalUserInfo.family_name,
                            current_theme: 'dark'
                        }).then(function(snapshot){})
                    }
                }).catch((error) => {
                    var errorCode = error.code;
                    var errorMsg = error.message;
                    var email = error.email;
                    var credential = error.credential
                })
            }else{
                console.log('User already signed in firebase')
            }
        })
    }

    signInWithGoogleAsync = async() => {
        try{
            const results = await Google.logInAsync({
                behavior: 'web',
                androidClientId: '16964289930-ilottbaq4f4f93gf2km7h6hvnfkm7i7u.apps.googleusercontent.com',
                iosClientId: '16964289930-n8k8u5dq4sgt69tihfpd921l8mk47t72.apps.googleusercontent.com',
                scopes: ['profile', 'email']
            })
            if(results.type === 'success'){
                this.onSignIn(results)
                return results.accessToken;
            }else{
                return {cancelled : true};
            }
        }catch (e){
            console.log(e.message);
            return{error : true};
        }
    }



    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity style={styles.button} onPress={() => this.signInWithGoogleAsync()}>
                    <Text style={styles.text}>Sign In with google account</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    button:{
        borderWidth: 2,
        backgroundColor: 'pink',
        borderColor: '#000',
        padding: 20
    },
    text:{
        color: '#000',
        fontWeight: 'bold',
        fontSize: 18
    }
})