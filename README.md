# MEN-TAL

MEN-TAL is a quiet, mobile-friendly wellbeing web app for men going through a hard time. It offers a daily mood check-in, manageable self-care ideas, a gentle breathing exercise, a private on-device journal, and links to human support.

## Run it

This is a static web app with no build step, accounts, paid APIs, or third-party runtime dependencies. Open `index.html` in a browser, or serve the project from a local/static web server. On iPhone or Android, use the browser's **Add to Home Screen** / **Install app** action to use it like an app, without app-store fees or a separate mobile codebase. Install and offline caching require HTTPS or localhost.

## Privacy

Mood check-ins, daily-plan progress, and journal notes are saved in browser local storage on the current device. They are not sent to a server. Anyone with access to the same browser profile may be able to see them; clear the journal or browser storage to remove them. Do not use a shared device for sensitive notes.

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

The support page displays the destination's domain. A supporter pays the creator account connected to that page, under the payment provider's own terms and fees; MEN-TAL does not handle payment details. Never put secret API keys or payout credentials in this static app. Keep all crisis and essential wellbeing resources free, make giving entirely optional, and check the provider's fees and local tax rules.

The app is intentionally static and free to host on a static web host. It has no subscriptions, advertising, or data-dependent AI features. Never make clinical or safety claims without qualified review.
