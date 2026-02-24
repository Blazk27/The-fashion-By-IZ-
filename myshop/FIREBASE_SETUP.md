# 🔥 Firebase Setup Guide — The Fashion Shop

## Step 1 — Create Firebase Account
1. Go to **https://firebase.google.com**
2. Click **"Get started"**
3. Sign in with your Google account (Gmail)

## Step 2 — Create a New Project
1. Click **"Add project"**
2. Name it: **thefashion** (or anything)
3. Disable Google Analytics (not needed) → click **Continue**
4. Wait for project to create → click **Continue**

## Step 3 — Create Firestore Database
1. In the left sidebar click **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** → click **Next**
4. Pick region: **asia-southeast1 (Singapore)** → click **Enable**
5. Wait for it to finish

## Step 4 — Get Your Config Keys
1. Click the **gear icon ⚙️** (top left) → **Project settings**
2. Scroll down to **"Your apps"**
3. Click the **</>** (web) icon
4. App nickname: **thefashion-web** → click **Register app**
5. You will see a code block like this:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "thefashion-xxxxx.firebaseapp.com",
  projectId: "thefashion-xxxxx",
  storageBucket: "thefashion-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

**Copy all 6 values!**

## Step 5 — Paste Keys Into Your App
Open the file: **src/lib/firebase.ts**

Replace each "REPLACE_WITH_YOUR_..." value with your real values:

```ts
const firebaseConfig = {
  apiKey: "AIzaSy...",           ← paste your apiKey
  authDomain: "...",             ← paste your authDomain
  projectId: "...",              ← paste your projectId
  storageBucket: "...",          ← paste your storageBucket
  messagingSenderId: "...",      ← paste your messagingSenderId
  appId: "..."                   ← paste your appId
};
```

## Step 6 — Set Firestore Rules (Allow Read/Write)
1. In Firebase console → **Firestore Database** → **Rules** tab
2. Replace all the text with this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{doc} {
      allow read: if true;
      allow write: if true;
    }
    match /orders/{doc} {
      allow read, write: if true;
    }
    match /config/{doc} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

3. Click **Publish**

## Step 7 — Deploy to Vercel
1. Upload the updated project files to your GitHub repo
2. Vercel will auto-deploy
3. Open your site — everything will be live! ✅

## ✅ Done!
- Products save to Firebase → visible on ALL phones instantly
- Settings save to Firebase → all devices see updates
- Orders save to Firebase → admin can see all orders
