# VELOCE — Luxury & Performance Footwear Platform

![VELOCE Banner](https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&q=80)

**VELOCE** is a full-stack luxury e-commerce and mobile platform engineered for high-performance footwear. Handcrafted with modern architectural patterns, the platform combines a high-fashion storefront, comprehensive admin content management, real-time live synchronization, cryptographic email OTP verification, and native Capacitor mobile apps for iOS and Android.

---

## 💎 Features & Architecture

### 1. Storefront Experience
- **Cinematic Dynamic Hero Slider**: Database-driven slider with touch swipe gestures, desktop arrow controls, pagination dots, and pause-on-hover autoplay.
- **Curated Footwear Collections**: Men's, Women's, and Editorial footwear with supercritical nitrogen foam and carbon plate specifications.
- **Interactive Lookbook Gallery**: High-fashion photography with category filtering, lightbox zoom, and direct model CTA links.
- **Deals & Flash Drops**: Real-time promotional countdown with live discount computation.
- **Smart Page Loader**: 180ms delay threshold prevents unnecessary flashes during fast transitions while providing branded animated loading feedback during slower requests.

### 2. Complete Authentication & Security
- **Dual Authentication**:
  - Traditional Email + Password with `bcryptjs` hashing.
  - **Google OAuth with 6-Digit Email OTP Gate**: Cryptographic server-side 6-digit verification code dispatched via Resend before issuing session tokens.
- **Forgot Password Recovery**: Secure 3-step OTP recovery flow with anti-enumeration protection.
- **Session Security**: HTTP-only JWT cookies via `jose` with server-side role-based access control.

### 3. Admin Content Management & Real-Time Sync
- **Hero / Banners Manager (`/admin/hero`)**: Manage slides, headings, subtitles, CTA links, and positions.
- **Lookbook Gallery Manager (`/admin/gallery`)**: Upload, preview, replace, reorder, and toggle active images with confirmation safeguards.
- **Promotional Deals & Notification Hub (`/admin/deals`)**: Launch campaigns with non-blocking in-app alerts and luxury Resend deal emails.
- **Real-Time Sync Engine**: Server-Sent Events (SSE) stream (`/api/sync/events`) automatically invalidates cache and pushes live updates to all active browser tabs without full page reloads.

### 4. Native Mobile Architecture (Capacitor 6)
- Pre-configured for **Android (APK & AAB)** and **iOS (Xcode / IPA)**.
- Unified backend API connectivity, offline fallbacks, and safe-area notch adaptation.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.7 |
| **Styling** | Tailwind CSS with Dark / Light Mode |
| **Animations** | Framer Motion & CSS Shimmer |
| **Database & ORM** | Prisma ORM with SQLite / PostgreSQL |
| **Authentication** | Jose (JWT), BcryptJS, Google OAuth 2.0 |
| **Email Service** | Resend API with Luxury Dark HTML Templates |
| **Mobile Platforms** | Capacitor 6 (Android & iOS) |

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and configure your credentials:
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-super-secure-jwt-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Resend Email Integration
RESEND_API_KEY="re_your_resend_key"
EMAIL_FROM="VELOCE <concierge@veloce-shoes.com>"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Database Migration & Seed
```bash
npx prisma db push
npx prisma generate
npm run seed
```

### 4. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Mobile App Builds (Android & iOS)

### Android Build
1. Synchronize web assets with Capacitor:
   ```bash
   npx cap sync android
   ```
2. Build Debug APK:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
   Artifact output: `android/app/build/outputs/apk/debug/app-debug.apk`

3. Build Release Android App Bundle (AAB) for Google Play:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

### iOS Build (Requires macOS & Xcode)
1. Synchronize iOS project:
   ```bash
   npx cap sync ios
   ```
2. Open in Xcode:
   ```bash
   npx cap open ios
   ```
3. In Xcode, configure your Apple Developer Team, signing certificates, and select **Product > Archive** to export the IPA for TestFlight / App Store.

---

## 📄 License
Proprietary © 2026 VELOCE Footwear Inc. All rights reserved.
