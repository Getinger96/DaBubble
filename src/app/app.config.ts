import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideFirebaseApp(() => initializeApp({"projectId":"dabubble-b6814","appId":"1:861945353229:web:0f2053b392728ba732b144","storageBucket":"dabubble-b6814.firebasestorage.app","apiKey":"AIzaSyCp6yNSTyFQGZb7u2-X5oRWscDapMT9J6M","authDomain":"dabubble-b6814.firebaseapp.com","messagingSenderId":"861945353229"})), provideFirestore(() => getFirestore()), provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync()]
};
