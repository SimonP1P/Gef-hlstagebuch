/* Wird von der GitHub Action per Zeitplan ausgeführt.
   Prüft: liegt der letzte Eintrag mehr als REMINDER_HOURS Stunden zurück?
   Wenn ja: schickt eine Push-Notification an alle gespeicherten Tokens. */

const admin = require('firebase-admin');

const REMINDER_HOURS = 6; // ab wann erinnert werden soll

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function main(){
  const tokensSnap = await db.collection('fcmTokens').get();
  if(tokensSnap.empty){
    console.log('Keine registrierten Geräte.');
    return;
  }

  for(const doc of tokensSnap.docs){
    const { token, uid } = doc.data();
    if(!token || !uid) continue;

    const entriesSnap = await db.collection('entries')
      .where('uid', '==', uid)
      .get();

    let lastMs = 0;
    entriesSnap.forEach(e => {
      const ts = e.data().timestamp;
      if(ts && typeof ts.toMillis === 'function'){
        lastMs = Math.max(lastMs, ts.toMillis());
      }
    });

    const hoursSince = lastMs ? (Date.now() - lastMs) / 3.6e6 : Infinity;
    console.log(`uid ${uid}: letzter Eintrag vor ${hoursSince.toFixed(1)}h`);

    if(hoursSince < REMINDER_HOURS){
      console.log('  -> noch kein Reminder nötig.');
      continue;
    }

    try{
      await admin.messaging().send({
        token,
        notification: {
          title: 'Gefühlstagebuch',
          body: 'Zeit für deinen nächsten Check-in ✍️'
        },
        webpush: { fcmOptions: { link: process.env.SITE_URL || '/' } }
      });
      console.log('  -> Push gesendet.');
    } catch(err){
      console.error('  -> Fehler beim Senden:', err.message);
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
