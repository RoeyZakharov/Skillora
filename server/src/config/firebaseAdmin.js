import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";

const firebaseAdminApp =
    getApps().length === 0
        ? initializeApp({
              credential: applicationDefault(),
          })
        : getApps()[0];

export default firebaseAdminApp;