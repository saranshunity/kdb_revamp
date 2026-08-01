# KDB Revamp — Geeta Mahotsav Kurukshetra App

A React Native application built for the **Kurukshetra Development Board (KDB)** to serve pilgrims and visitors attending the **Geeta Mahotsav**, providing event information, navigation, and digital services in a single mobile experience.

---

## ✨ Key Features

- Firebase-backed authentication and real-time data sync (Firestore)
- Push notifications via Firebase Cloud Messaging
- In-app payments via Razorpay
- Location-based navigation with integrated maps
- Camera integration for [document capture / profile photos — confirm use case]
- Firebase Storage for media/file handling



---



## 🛠 Tech Stack


| Layer          | Technology                                           |
| -------------- | ---------------------------------------------------- |
| Framework      | React Native 0.81.4                                  |
| Navigation     | React Navigation                                     |
| Backend / Auth | Firebase (Auth, Firestore, Cloud Messaging, Storage) |
| Payments       | Razorpay                                             |
| Maps           | React Native Maps                                    |
| Language       | JavaScript / TypeScript                              |


---



## 🧩 Technical Challenges Solved

This project involved real native-layer debugging beyond typical CRUD app development:

**iOS — CocoaPods Static Library Conflict**
Firebase's Swift-based pods conflicted with static library linking during `pod install`, a common but non-obvious failure point in RN + Firebase iOS builds. Resolved by enforcing `use_modular_headers!` in the Podfile, ensuring Swift pod modules resolved correctly without breaking the existing static linking setup for other native dependencies.

**Android — Gradle Cache Corruption**
Diagnosed and resolved a corrupted Gradle cache that was silently breaking Android builds — required clearing the cache and re-syncing dependencies rather than a surface-level "clean build" fix.

**React Native 0.81.4 Project Initialization**
Worked through initialization issues specific to RN 0.81.4's updated tooling, ensuring a stable base before layering in native modules (Firebase, Razorpay, Maps).



---



## 🚀 Getting Started



### Prerequisites

- Node.js >= [version]
- React Native CLI
- Xcode (for iOS)
- Android Studio (for Android)
- Firebase project with `google-services.json` / `GoogleService-Info.plist`



### Installation

```bash
git clone git@github.com:saranshunity/kdb_revamp.git
cd kdb_revamp
npm install

# iOS
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```



### Environment Setup

This project requires Firebase and Razorpay credentials. Copy the example config files and add your own:

```bash
cp google-services.json.example google-services.json
cp GoogleService-Info.plist.example GoogleService-Info.plist
```



---



## 📄 License

MIT — see [LICENSE](./LICENSE)

---



## 👤 Author

**Saransh Bansal**
Senior Frontend Engineer — React Native / React
[[LinkedIn](https://www.linkedin.com/in/saransh-bansal-2406a8129/)] · [[Email](saranshunity@gmail.com)]