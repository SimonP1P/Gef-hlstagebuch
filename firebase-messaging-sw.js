/* Läuft im Hintergrund, auch wenn kein Tab offen ist.
   Muss im selben Verzeichnis wie index.html liegen (Wurzel der Seite). */

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

/* Gleiche Config wie in index.html */
firebase.initializeApp({
  apiKey: "AIzaSyABvdXuONBS12xZr2X3Jkk7GPzoetRkuOY",
  authDomain: "verliebtheit-tracker-17906.firebaseapp.com",
  projectId: "verliebtheit-tracker-17906",
  storageBucket: "verliebtheit-tracker-17906.firebasestorage.app",
  messagingSenderId: "978284822820",
  appId: "1:978284822820:web:f50c55144f055f5f3133b1"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Gefühlstagebuch';
  const options = {
    body: payload.notification?.body || 'Zeit für deinen Check-in.',
    icon: 'icon-192.png',
    badge: 'icon-192.png'
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('./'));
});
