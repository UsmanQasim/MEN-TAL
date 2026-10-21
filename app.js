const STORAGE_KEYS = {
  checkin: 'mental-checkin-v1',
  daily: 'mental-daily-v1',
  journal: 'mental-journal-v1',
};

const dateKey = (() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
})();
const moodMessages = {
  rough: 'Thanks for being honest. You don’t have to carry this alone.',
  low: 'It’s okay to feel low. Let’s keep the next step gentle.',
  okay: 'Getting by is enough for right now. One thing at a time.',
  good: 'Glad there’s a little light today. You deserve the easier moments too.',
};

function readStored(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Could not read ${key} from local storage.`, error);
    return fallback;
  }
}

function saveStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Could not save ${key} to local storage.`, error);
    showToast('This browser could not save that just now. Check your device storage settings.');
    return false;
  }
}

const toast = document.querySelector('#toast');
let toastTimeout;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('is-visible'), 3000);
}

function updateDate() {
  const today = document.querySelector('#today-label');
  const formatted = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
  today.textContent = formatted;
}

function navigate(page, { updateHistory = true } = {}) {
  const section = document.querySelector(`[data-section="${page}"]`);
  if (!section) return;

  document.querySelectorAll('[data-section]').forEach((item) => {
    item.hidden = item !== section;
    item.classList.toggle('is-current', item === section);
  });
  document.querySelectorAll('[data-page]').forEach((link) => {
    const active = link.dataset.page === page;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  if (updateHistory && location.hash !== `#${page}`) history.pushState(null, '', `#${page}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initializeNavigation() {
  document.querySelectorAll('[data-page]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      navigate(link.dataset.page);
    });
  });
  document.querySelectorAll('[data-open-support]').forEach((button) => {
    button.addEventListener('click', () => navigate('support'));
  });
  window.addEventListener('popstate', () => navigate(location.hash.slice(1) || 'home', { updateHistory: false }));
  const page = location.hash.slice(1);
  if (page) navigate(page);
}

function initializeCheckin() {
  const saved = readStored(STORAGE_KEYS.checkin, null);
  const message = document.querySelector('#checkin-response');
  if (saved?.date === dateKey && moodMessages[saved.mood]) {
    setMood(saved.mood, false);
    message.textContent = 'You checked in today. You can change it whenever you like.';
  }

  document.querySelectorAll('[data-mood]').forEach((button) => {
    button.addEventListener('click', () => {
      const mood = button.dataset.mood;
      if (saveStored(STORAGE_KEYS.checkin, { date: dateKey, mood })) {
        setMood(mood, false);
        message.textContent = moodMessages[mood];
      }
    });
  });
}

function setMood(mood) {
  document.querySelectorAll('[data-mood]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.mood === mood));
  });
}

function initializeDailyPlan() {
  const saved = readStored(STORAGE_KEYS.daily, {});
  const today = saved.date === dateKey ? saved.tasks : {};

  document.querySelectorAll('[data-daily]').forEach((checkbox) => {
    checkbox.checked = Boolean(today[checkbox.dataset.daily]);
    checkbox.addEventListener('change', () => {
      const tasks = Object.fromEntries([...document.querySelectorAll('[data-daily]')].map((item) => [item.dataset.daily, item.checked]));
      if (saveStored(STORAGE_KEYS.daily, { date: dateKey, tasks })) updateDailyCount();
    });
  });
  updateDailyCount();

  document.querySelectorAll('[data-task]').forEach((button) => {
    button.addEventListener('click', () => {
      button.classList.add('is-done');
      button.textContent = 'Done for now ✓';
      showToast('That counts. Take a moment to give yourself credit.');
    });
  });
}

function updateDailyCount() {
  const boxes = [...document.querySelectorAll('[data-daily]')];
  const done = boxes.filter((checkbox) => checkbox.checked).length;
  document.querySelector('#daily-counter').textContent = `${done} of ${boxes.length}`;
}

function initializeJournal() {
  const entry = document.querySelector('#journal-entry');
  const status = document.querySelector('#journal-status');
  entry.value = readStored(STORAGE_KEYS.journal, '');

  document.querySelector('#save-journal').addEventListener('click', () => {
    if (saveStored(STORAGE_KEYS.journal, entry.value)) {
      status.textContent = 'Stored in this browser only. Not uploaded.';
      showToast('Your note is saved in this browser only.');
    }
  });
  document.querySelector('#clear-journal').addEventListener('click', () => {
    entry.value = '';
    if (saveStored(STORAGE_KEYS.journal, '')) {
      status.textContent = 'Your note has been cleared from this device.';
      showToast('Your note has been cleared.');
    }
  });
  entry.addEventListener('input', () => {
    status.textContent = 'Local to this browser. Remember to save if you want to keep it.';
  });
}

function initializeBreathing() {
  const button = document.querySelector('#breath-button');
  const skip = document.querySelector('#breath-skip');
  const visual = document.querySelector('#breathing-visual');
  const instruction = document.querySelector('#breath-instruction');
  const count = document.querySelector('#breath-count');
  const caption = document.querySelector('#breathing-caption');
  const phases = [
    { label: 'Breathe in', duration: 4, className: 'is-inhale' },
    { label: 'Breathe out', duration: 6, className: 'is-exhale' },
  ];
  let timer;
  let elapsed = 0;
  let phaseIndex = 0;
  let remaining = phases[0].duration;

  function stopBreathing(finished = false) {
    clearInterval(timer);
    timer = null;
    visual.classList.remove('is-inhale', 'is-exhale');
    instruction.textContent = finished ? 'Well done.' : 'Ready?';
    count.textContent = finished ? 'A minute just for you' : 'Breathe at your own pace';
    caption.textContent = finished ? 'Take this feeling with you, or stay here a little longer.' : 'Find a comfortable position. You can stop at any time.';
    button.textContent = 'Begin a gentle minute';
    skip.textContent = 'I’d rather try something else';
  }

  button.addEventListener('click', () => {
    if (timer) {
      stopBreathing();
      return;
    }
    elapsed = 0;
    phaseIndex = 0;
    remaining = phases[phaseIndex].duration;
    button.textContent = 'Pause this exercise';
    skip.textContent = 'Stop';

    const tick = () => {
      const phase = phases[phaseIndex];
      visual.classList.remove('is-inhale', 'is-exhale');
      visual.classList.add(phase.className);
      instruction.textContent = phase.label;
      count.textContent = `${remaining} seconds`;
      caption.textContent = 'No need to force your breath. Keep it comfortable.';
      elapsed += 1;
      remaining -= 1;

      if (elapsed >= 60) {
        stopBreathing(true);
      } else if (remaining === 0) {
        phaseIndex = (phaseIndex + 1) % phases.length;
        remaining = phases[phaseIndex].duration;
      }
    };
    tick();
    timer = setInterval(tick, 1000);
  });
  skip.addEventListener('click', () => {
    if (timer) stopBreathing();
    else {
      document.querySelector('.grounding-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.querySelector('.grounding-card h2').focus({ preventScroll: true });
    }
  });
}

function initializeLocationSupport() {
  const button = document.querySelector('#detect-country');
  const status = document.querySelector('#location-status');
  const error = document.querySelector('#location-error');
  const result = document.querySelector('#country-result');
  const resultLabel = document.querySelector('#country-result-label');
  const countryLink = document.querySelector('#country-helpline-link');

  button.addEventListener('click', async () => {
    button.disabled = true;
    error.hidden = true;
    result.hidden = true;
    status.textContent = 'Estimating your country… This can take a few seconds.';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch('https://ipwho.is/?fields=success,country,country_code', {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Country lookup returned HTTP ${response.status}.`);

      const location = await response.json();
      const countryCode = typeof location.country_code === 'string' ? location.country_code.toUpperCase() : '';
      if (location.success !== true || !/^[A-Z]{2}$/.test(countryCode) || typeof location.country !== 'string') {
        throw new Error('The country lookup did not return a usable country.');
      }

      resultLabel.textContent = `Approximate location: ${location.country}.`;
      countryLink.href = `https://findahelpline.com/countries/${countryCode}`;
      result.hidden = false;
      status.textContent = 'Here are support services listed for that country. If this estimate is wrong, choose your country manually.';
    } catch (lookupError) {
      console.error('Could not estimate country for helpline suggestions.', lookupError);
      status.textContent = '';
      error.textContent = 'We couldn’t estimate your country. You can still choose it directly in the helpline directory.';
      error.hidden = false;
    } finally {
      clearTimeout(timeout);
      button.disabled = false;
    }
  });
}

function initializeContributions() {
  const link = document.querySelector('#contribution-link');
  const destination = document.querySelector('#contribution-destination');
  const configuredUrl = window.MENTAL_CONFIG?.donationUrl;

  if (typeof configuredUrl === 'string' && configuredUrl.trim()) {
    try {
      const page = new URL(configuredUrl);
      if (page.protocol !== 'https:') throw new Error('The creator page must use HTTPS.');
      link.href = page.href;
      link.hidden = false;
      destination.textContent = `Tips go directly to the creator account on ${page.hostname}. MEN-TAL does not collect or store payment details.`;
      return;
    } catch (error) {
      console.error('The contribution page URL in site-config.js is invalid.', error);
      destination.textContent = 'The configured contribution page is not a valid HTTPS link. No payments are being collected.';
      return;
    }
  }

  destination.textContent = 'No payment page is connected yet, so this app currently collects no donations. Create a creator account and add its public HTTPS page in site-config.js; until then, no money goes anywhere.';
}

let installPrompt = null;

function initializeInstallation() {
  const installButtons = document.querySelectorAll('[data-install-app]');
  const installed = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  if (installed) {
    document.querySelector('#install-help').textContent = 'MEN-TAL is installed on this device. Open it from your home screen whenever you need it.';
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt = event;
  });

  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    showToast('MEN-TAL is ready on your home screen.');
  });

  installButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      if (installed) {
        showToast('MEN-TAL is already on your home screen.');
        return;
      }
      if (!installPrompt) {
        const isAppleMobile = /iphone|ipad|ipod/i.test(navigator.userAgent);
        showToast(isAppleMobile
          ? 'On iPhone or iPad: tap Share, then “Add to Home Screen”.'
          : 'Open your browser menu and choose “Install app” or “Add to Home screen”.');
        return;
      }

      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') showToast('MEN-TAL is being added to your home screen.');
      installPrompt = null;
    });
  });
}

updateDate();
initializeNavigation();
initializeCheckin();
initializeDailyPlan();
initializeJournal();
initializeBreathing();
initializeLocationSupport();
initializeContributions();
initializeInstallation();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch((error) => {
      console.error('MEN-TAL could not enable offline support.', error);
    });
  });
}
