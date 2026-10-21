# MEN-TAL

MEN-TAL is a quiet, mobile-friendly wellbeing web app for men going through a hard time. It offers a daily mood check-in, manageable self-care ideas, a gentle breathing exercise, a private on-device journal, and links to human support.

## Run it

This is a static web app with no build step, accounts, paid APIs, or third-party runtime dependencies. Open `index.html` in a browser, or serve the project from a local/static web server. On iPhone or Android, use the browser's **Add to Home Screen** / **Install app** action to use it like an app, without app-store fees or a separate mobile codebase. Install and offline caching require HTTPS or localhost.

The provided brand artwork has been cut out to transparent PNG files: `logo.png` is the complete lockup, `logo-mark.png` is the heart mark used in the app, and `icon-192.png` / `icon-512.png` are install icons.

## Android app

The Expo app lives in `mobile/`; the static website remains at the repository root. The app works offline for its core exercises and stores check-ins, daily-plan progress, and journal notes on the device. It has no account or backend.

From the `mobile` directory:

```sh
npm install
npm run typecheck
npx expo install --check
npx expo start
```

Open the development build with Expo Go where supported, or connect an Android device/emulator. To verify a release-style Android bundle locally, run `npx expo export --platform android`.

### EAS and Google Play

You need your own Expo account and Google Play developer account; neither is included in this repository. Before the first build:

1. In `mobile/app.json`, change `com.mentaltogether.mental` to a globally unique Android package name you control. Treat it as permanent once the app is published. Confirm the iOS bundle identifier too if you plan to release on iOS.
2. From `mobile`, authenticate and initialize the EAS project with `npx eas-cli@latest login` and `npx eas-cli@latest init`. This associates the app with your Expo account and writes the project ID into the app configuration.
3. Build an installable preview APK with `npx eas-cli@latest build --platform android --profile preview`. Build the Play Store Android App Bundle with `npx eas-cli@latest build --platform android --profile production`.
4. Test the preview on real devices, prepare a public privacy-policy URL, complete Google Play's current app-content, health-app, and Data safety declarations, and upload the production `.aab` in Play Console. Do not submit until those declarations accurately describe the app and its external links.

The EAS production profile increments the Android version code remotely. The `submit.production` profile is only a starting configuration; Play Console credentials and first-release setup are still required. An Expo account/project ID and a package name you control have not been configured in this repository.

## Privacy

On Android and iOS, check-ins, daily-plan progress, and journal notes are stored on-device using the platform's protected storage (Android Keystore or iOS Keychain); MEN-TAL has no account or app backend. Secure storage is not a promise that data is impossible to access: protect your device, and note that iOS Keychain data can persist after uninstall. On the web, data stays in that browser's local storage and may be visible to someone with access to the browser profile. Clear the journal or browser storage to remove it. Avoid entering sensitive notes on a shared device.

The optional support-country lookup sends the device's IP address directly to ipwho.is when the person taps **Find my country**. The app does not save the result; helpline directories and any configured creator payment page are separate third-party services opened by choice. The core check-ins, journal, and wellbeing exercises do not require a network connection.

Before a store release, publish a privacy policy that describes these practices and verify Expo/Google Play's then-current disclosures and data-safety requirements. Do not promise a level of security or privacy beyond what the platform and your release configuration provide.

## Care and crisis support

MEN-TAL offers general wellbeing ideas, not diagnosis, treatment, or crisis care. Self-care is not a replacement for support from a qualified health professional. In immediate danger, contact your local emergency number or go to the nearest emergency department. To find a crisis or emotional support line by country, visit [Find A Helpline](https://findahelpline.com/).

The support page can estimate a country from the visitor's IP address using ipwho.is, but only after the visitor chooses **Find my country**. This is an approximate country-level lookup, not GPS. The visitor's IP address is sent directly to ipwho.is for that request; the app requests only the country and two-letter country code and does not save the result. If the lookup fails or the visitor declines, they can choose their country on Find A Helpline. [ipwho.is documents](https://ipwhois.io/documentation) a free endpoint limited to 1,000 requests per day per domain; confirm the provider's current terms before launch.

The app's low-pressure choices reflect public mental wellbeing guidance: connection, manageable physical activity, small achievable steps, attention to the present, and everyday basics. Everyone's circumstances are different, and no one action is a cure.

## Evidence and further reading

- [NHS: 5 steps to mental wellbeing](https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/five-steps-to-mental-wellbeing/) — connecting with people, moving, learning, giving, and paying attention to the present.
- [NHS Every Mind Matters: mental wellbeing tips](https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/) — practical ideas and routes to further support.
- [World Health Organization: Mental health — strengthening our response](https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response) — mental health is shaped by individual, social, and environmental factors; community support and affordable care matter.
- [Find A Helpline](https://findahelpline.com/) — a directory of crisis and emotional support services across countries.

## Optional contributions

**No money is collected until you connect your own creator payment page.** MEN-TAL cannot receive or route donations on your behalf. To enable optional tips:

1. Create a creator page with a payment service such as Ko-fi or Buy Me a Coffee, and set up its payout details directly with that service.
2. Copy your public HTTPS creator-page URL.
3. In `site-config.js`, set `donationUrl` to that URL (for example, `donationUrl: 'https://ko-fi.com/yourpage'`).
4. Deploy the updated static site and make a small test from the payment provider's preview/test tools if available.

The mobile app has a separate, blank `donationUrl` in `mobile/src/config.ts`; it also collects nothing until you set your own public creator-page URL. The support page displays the destination's domain. A supporter pays the creator account connected to that page, under the payment provider's own terms and fees; MEN-TAL does not handle payment details. Never put secret API keys or payout credentials in either app. **Before enabling a payment link in an Android app distributed through Google Play, check the current Play payments policy and permitted programs for your app and region**; the rules can restrict external payment links. Check provider fees and local tax requirements too. Keep crisis and essential wellbeing resources free, and make giving entirely optional.

The app is intentionally static and free to host on a static web host. It has no subscriptions, advertising, or data-dependent AI features. Never make clinical or safety claims without qualified review.
