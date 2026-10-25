const STORAGE_KEYS = {
  checkin: 'mental-checkin-v1',
  daily: 'mental-daily-v1',
  journal: 'mental-journal-v1',
  steadyPlan: 'mental-steady-plan-v1',
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

const PATHWAYS = {
  sleep: {
    tag: 'REST & WIND-DOWN',
    title: 'Take the pressure off sleeping',
    ideas: [
      'Stop trying to force sleep. Resting your body in the dark with your eyes closed still counts.',
      'Put your phone face-down across the room for 15 minutes and let your shoulders drop.',
      'Write down the one thing you’re worried about forgetting tomorrow in your journal so your brain doesn’t have to hold it.',
    ],
  },
  money: {
    tag: 'WORK & MONEY STRAIN',
    title: 'Shrink the window to just today',
    ideas: [
      'You don’t have to solve the whole month tonight. Pick one small admin task—or decide that money tasks wait until tomorrow morning.',
      'Eat something simple and drink water before looking at bills or messages. Everything feels heavier on an empty stomach.',
      'If debt or housing is pressing, free confidential advice lines exist in many countries—you don’t have to figure it out in isolation.',
    ],
  },
  lonely: {
    tag: 'CONNECTION WITHOUT PRESSURE',
    title: 'Low-effort ways to feel less alone',
    ideas: [
      'Send a low-stakes text to one person: “Thinking of you, hope your week is going okay.” No need to explain how you feel unless you want to.',
      'Step into a shared space for 10 minutes—a local shop, park, or café—just to be around everyday life.',
      'Check your rough-day plan for the name of someone you trust, and let them know you could use a quick check-in.',
    ],
  },
  energy: {
    tag: 'LOW ENERGY',
    title: 'Make the first step tiny',
    ideas: [
      'Sit on the edge of the bed or couch and put both feet flat on the floor for 30 seconds. That’s the whole first step.',
      'Splash cool water on your face or put on a clean shirt—no need for a full routine.',
      'Open a curtain or crack a window for two minutes of fresh air and daylight.',
    ],
  },
  overwhelm: {
    tag: 'WHEN EVERYTHING FEELS LIKE A LOT',
    title: 'Slow down the noise',
    ideas: [
      'Try four slow breaths in the Pause tab—longer on the exhale than the inhale.',
      'Dump the loudest thought into the Journal tab so it’s outside your head.',
      'Look around the room and name three solid objects you can see right now.',
    ],
  },
};

const GROUNDING_STEPS = [
  {
    tag: 'STEP 1 OF 3 · SEE',
    title: 'Notice one thing you can see',
    text: 'Look around and pick one ordinary detail—the color of a wall, light on the floor, or an object near you. No need to analyze it.',
  },
  {
    tag: 'STEP 2 OF 3 · FEEL',
    title: 'Notice one thing you can feel',
    text: 'Bring your attention to your feet on the ground, your back against the chair, or the fabric of your sleeves under your fingers.',
  },
  {
    tag: 'STEP 3 OF 3 · HEAR',
    title: 'Listen for one sound nearby',
    text: 'Notice a sound in the room or outside—a fan, distant traffic, wind, or quiet. Let it be there without needing to change anything.',
  },
];

const JOURNAL_PROMPTS = [
  'Right now, I need…',
  'One thing that felt heavy today was…',
  'Something I can give myself permission to leave until tomorrow is…',
  'For the next hour, “enough” looks like…',
  'What I wish someone understood without me having to explain is…',
  'One small thing I got through today was…',
];

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

function updateCheckinFollowup(mood) {
  const followup = document.querySelector('#checkin-followup');
  const tag = document.querySelector('#checkin-followup-tag');
  const text = document.querySelector('#checkin-followup-text');
  if (!followup || !tag || !text) return;

  if (mood !== 'rough' && mood !== 'low') {
    followup.hidden = true;
    return;
  }

  const plan = readStored(STORAGE_KEYS.steadyPlan, { signs: '', helpful: '', person: '', message: '' });
  const helpful = typeof plan?.helpful === 'string' ? plan.helpful.trim() : '';
  const person = typeof plan?.person === 'string' ? plan.person.trim() : '';

  if (helpful || person) {
    tag.textContent = 'FROM YOUR ROUGH-DAY PLAN';
    const parts = [];
    if (helpful) parts.push(`Next small step: ${helpful}`);
    if (person) parts.push(`Person you noted: ${person}`);
    text.textContent = parts.join(' · ');
  } else {
    tag.textContent = 'FOR A HEAVY MOMENT';
    text.textContent = 'Keep the next hour small. You can take a slow breath or jot down a rough-day plan whenever you’re ready.';
  }
  followup.hidden = false;
}

function initializeCheckin() {
  const saved = readStored(STORAGE_KEYS.checkin, null);
  const message = document.querySelector('#checkin-response');
  if (saved?.date === dateKey && moodMessages[saved.mood]) {
    setMood(saved.mood);
    message.textContent = 'You checked in today. You can change it whenever you like.';
    updateCheckinFollowup(saved.mood);
  }

  document.querySelectorAll('[data-mood]').forEach((button) => {
    button.addEventListener('click', () => {
      const mood = button.dataset.mood;
      if (saveStored(STORAGE_KEYS.checkin, { date: dateKey, mood })) {
        setMood(mood);
        message.textContent = moodMessages[mood];
        updateCheckinFollowup(mood);
      }
    });
  });
}

function setMood(mood) {
  document.querySelectorAll('[data-mood]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.mood === mood));
  });
}

function initializePathways() {
  const pills = [...document.querySelectorAll('[data-pathway]')];
  const detail = document.querySelector('#pathway-detail');
  const tag = document.querySelector('#pathway-tag');
  const title = document.querySelector('#pathway-title');
  const idea = document.querySelector('#pathway-idea');
  const nextBtn = document.querySelector('#pathway-next');
  const closeBtn = document.querySelector('#pathway-close');
  let activeKey = null;
  let ideaIndex = 0;

  function render() {
    pills.forEach((pill) => {
      const selected = pill.dataset.pathway === activeKey;
      pill.classList.toggle('is-active', selected);
      pill.setAttribute('aria-pressed', String(selected));
    });
    if (!activeKey || !PATHWAYS[activeKey]) {
      detail.hidden = true;
      return;
    }
    const item = PATHWAYS[activeKey];
    tag.textContent = item.tag;
    title.textContent = item.title;
    idea.textContent = item.ideas[ideaIndex % item.ideas.length];
    detail.hidden = false;
  }

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const key = pill.dataset.pathway;
      if (activeKey === key) {
        activeKey = null;
      } else {
        activeKey = key;
        ideaIndex = 0;
      }
      render();
    });
  });

  nextBtn?.addEventListener('click', () => {
    if (!activeKey || !PATHWAYS[activeKey]) return;
    ideaIndex = (ideaIndex + 1) % PATHWAYS[activeKey].ideas.length;
    render();
  });

  closeBtn?.addEventListener('click', () => {
    activeKey = null;
    render();
  });
}

function initializeDailyPlan() {
  const saved = readStored(STORAGE_KEYS.daily, {});
  const isToday = saved.date === dateKey;
  const todayTasks = isToday && saved.tasks ? saved.tasks : {};
  const todayBasics = isToday && saved.basics ? saved.basics : {};

  function persistDaily() {
    const tasks = Object.fromEntries(
      [...document.querySelectorAll('[data-daily]')].map((item) => [item.dataset.daily, item.checked]),
    );
    const basics = Object.fromEntries(
      [...document.querySelectorAll('[data-task]')].map((button) => [button.dataset.task, button.classList.contains('is-done')]),
    );
    return saveStored(STORAGE_KEYS.daily, { date: dateKey, tasks, basics });
  }

  document.querySelectorAll('[data-daily]').forEach((checkbox) => {
    checkbox.checked = Boolean(todayTasks[checkbox.dataset.daily]);
    checkbox.addEventListener('change', () => {
      if (persistDaily()) updateDailyCount();
    });
  });
  updateDailyCount();

  document.querySelectorAll('[data-task]').forEach((button) => {
    const done = Boolean(todayBasics[button.dataset.task]);
    if (done) {
      button.classList.add('is-done');
      button.setAttribute('aria-pressed', 'true');
      button.textContent = 'Done for now ✓';
    }
    button.addEventListener('click', () => {
      const nextDone = !button.classList.contains('is-done');
      button.classList.toggle('is-done', nextDone);
      button.setAttribute('aria-pressed', String(nextDone));
      button.innerHTML = nextDone ? 'Done for now ✓' : 'I did this <span aria-hidden="true">→</span>';
      if (persistDaily() && nextDone) {
        showToast('That counts. Take a moment to give yourself credit.');
      }
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
  const counter = document.querySelector('#journal-counter');
  const promptText = document.querySelector('#journal-prompt-text');
  const usePromptBtn = document.querySelector('#use-journal-prompt');
  const nextPromptBtn = document.querySelector('#next-journal-prompt');
  let promptIndex = 0;

  function updateCounter() {
    if (counter) counter.textContent = `${entry.value.length}/3000`;
  }

  entry.value = readStored(STORAGE_KEYS.journal, '');
  updateCounter();

  document.querySelector('#save-journal').addEventListener('click', () => {
    if (saveStored(STORAGE_KEYS.journal, entry.value)) {
      status.textContent = 'Stored in this browser only. Not uploaded.';
      showToast('Your note is saved in this browser only.');
    }
  });
  document.querySelector('#clear-journal').addEventListener('click', () => {
    entry.value = '';
    updateCounter();
    if (saveStored(STORAGE_KEYS.journal, '')) {
      status.textContent = 'Your note has been cleared from this device.';
      showToast('Your note has been cleared.');
    }
  });
  entry.addEventListener('input', () => {
    updateCounter();
    status.textContent = 'Local to this browser. Remember to save if you want to keep it.';
  });

  nextPromptBtn?.addEventListener('click', () => {
    promptIndex = (promptIndex + 1) % JOURNAL_PROMPTS.length;
    if (promptText) promptText.textContent = `“${JOURNAL_PROMPTS[promptIndex]}”`;
  });

  usePromptBtn?.addEventListener('click', () => {
    const starter = JOURNAL_PROMPTS[promptIndex % JOURNAL_PROMPTS.length];
    const nextValue = entry.value.trim() ? `${entry.value.trimEnd()}\n\n${starter} ` : `${starter} `;
    if (nextValue.length <= 3000) {
      entry.value = nextValue;
      updateCounter();
      entry.focus();
      status.textContent = 'Prompt added. Save when you’re ready.';
    }
  });
}

function initializeSteadyPlan() {
  const fields = ['signs', 'helpful', 'person', 'message'];
  const plan = readStored(STORAGE_KEYS.steadyPlan, { signs: '', helpful: '', person: '', message: '' });
  const valid = plan && fields.every((field) => typeof plan[field] === 'string' && plan[field].length <= 100);
  const status = document.querySelector('#steady-plan-status');
  const copyBtn = document.querySelector('#copy-steady-message');
  const inputs = Object.fromEntries(fields.map((field) => [field, document.querySelector(`#steady-${field}`)]));

  function updateCounters() {
    fields.forEach((field) => {
      const counter = document.querySelector(`[data-counter-for="steady-${field}"]`);
      if (counter && inputs[field]) {
        counter.textContent = `${inputs[field].value.length}/100`;
      }
    });
    if (copyBtn && inputs.message) {
      copyBtn.hidden = !inputs.message.value.trim();
    }
  }

  if (valid) {
    fields.forEach((field) => { inputs[field].value = plan[field]; });
  } else {
    console.error('The saved steadying plan could not be validated.');
    status.textContent = 'Saved plan could not be read. You can clear it and start again.';
  }
  updateCounters();

  document.querySelectorAll('[data-starter-message]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const starter = chip.dataset.starterMessage || '';
      inputs.message.value = starter.slice(0, 100);
      updateCounters();
      status.textContent = 'Starter added. Edit it however you like and save when ready.';
    });
  });

  copyBtn?.addEventListener('click', async () => {
    const text = inputs.message.value.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = 'Message copied. Paste it into a text or chat whenever you’re ready.';
      showToast('Message copied to clipboard.');
    } catch (error) {
      console.error('Could not copy rough-day message.', error);
      inputs.message.select();
      showToast('Select and copy the message text above.');
    }
  });

  document.querySelector('#save-steady-plan').addEventListener('click', () => {
    const nextPlan = Object.fromEntries(fields.map((field) => [field, inputs[field].value]));
    if (saveStored(STORAGE_KEYS.steadyPlan, nextPlan)) {
      status.textContent = 'Your plan is saved in this browser only. It is not uploaded.';
      showToast('Your rough-day plan is saved on this device.');
      const savedMood = readStored(STORAGE_KEYS.checkin, null);
      if (savedMood?.date === dateKey) updateCheckinFollowup(savedMood.mood);
    }
  });
  document.querySelector('#clear-steady-plan').addEventListener('click', () => {
    const emptyPlan = { signs: '', helpful: '', person: '', message: '' };
    if (saveStored(STORAGE_KEYS.steadyPlan, emptyPlan)) {
      fields.forEach((field) => { inputs[field].value = ''; });
      updateCounters();
      status.textContent = 'Your plan has been cleared from this browser.';
      showToast('Your plan has been cleared.');
      const savedMood = readStored(STORAGE_KEYS.checkin, null);
      if (savedMood?.date === dateKey) updateCheckinFollowup(savedMood.mood);
    }
  });
  fields.forEach((field) => {
    inputs[field].addEventListener('input', () => {
      updateCounters();
      status.textContent = 'Only in this browser. Save when you’re ready.';
    });
  });
}

function initializeBreathing() {
  const button = document.querySelector('#breath-button');
  const skip = document.querySelector('#breath-skip');
  const visual = document.querySelector('#breathing-visual');
  const instruction = document.querySelector('#breath-instruction');
  const count = document.querySelector('#breath-count');
  const caption = document.querySelector('#breathing-caption');
  const patternBtns = [...document.querySelectorAll('[data-breath-pattern]')];

  const patterns = {
    gentle: {
      subtitle: '4s in · 6s out',
      phases: [
        { label: 'Breathe in', duration: 4, className: 'is-inhale' },
        { label: 'Breathe out', duration: 6, className: 'is-exhale' },
      ],
    },
    steady: {
      subtitle: '4s in · 4s hold · 4s out',
      phases: [
        { label: 'Breathe in', duration: 4, className: 'is-inhale' },
        { label: 'Hold gently', duration: 4, className: 'is-inhale' },
        { label: 'Breathe out', duration: 4, className: 'is-exhale' },
      ],
    },
  };

  let activePattern = 'gentle';
  let timer;
  let elapsed = 0;
  let phaseIndex = 0;
  let remaining = patterns[activePattern].phases[0].duration;

  function stopBreathing(finished = false) {
    clearInterval(timer);
    timer = null;
    visual.classList.remove('is-inhale', 'is-exhale');
    instruction.textContent = finished ? 'Well done.' : 'Ready?';
    count.textContent = finished ? 'A minute just for you' : patterns[activePattern].subtitle;
    caption.textContent = finished ? 'Take this feeling with you, or stay here a little longer.' : 'Find a comfortable position. You can stop at any time.';
    button.textContent = 'Begin a gentle minute';
    skip.textContent = 'I’d rather try something else';
  }

  patternBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      activePattern = btn.dataset.breathPattern || 'gentle';
      patternBtns.forEach((item) => {
        const active = item === btn;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      stopBreathing(false);
    });
  });

  button.addEventListener('click', () => {
    if (timer) {
      stopBreathing();
      return;
    }
    const phases = patterns[activePattern].phases;
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
      caption.textContent = `No need to force your breath. (${Math.max(0, 60 - elapsed)}s left — stop anytime)`;
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

function initializeGrounding() {
  const startBtn = document.querySelector('#grounding-start');
  const box = document.querySelector('#grounding-step-box');
  const tag = document.querySelector('#grounding-step-tag');
  const title = document.querySelector('#grounding-step-title');
  const text = document.querySelector('#grounding-step-text');
  const nextBtn = document.querySelector('#grounding-next');
  const closeBtn = document.querySelector('#grounding-close');
  let stepIndex = 0;

  function renderStep() {
    if (stepIndex >= GROUNDING_STEPS.length) {
      tag.textContent = 'GROUNDED IN THIS MOMENT';
      title.textContent = 'Take your time from here.';
      text.textContent = 'You paused and noticed where you are. That’s enough for right now.';
      nextBtn.textContent = 'Start again';
      return;
    }
    const step = GROUNDING_STEPS[stepIndex];
    tag.textContent = step.tag;
    title.textContent = step.title;
    text.textContent = step.text;
    nextBtn.textContent = stepIndex === GROUNDING_STEPS.length - 1 ? 'Finish check-in ✓' : 'Next step →';
  }

  startBtn?.addEventListener('click', () => {
    stepIndex = 0;
    startBtn.hidden = true;
    box.hidden = false;
    renderStep();
  });

  nextBtn?.addEventListener('click', () => {
    if (stepIndex >= GROUNDING_STEPS.length) {
      stepIndex = 0;
    } else {
      stepIndex += 1;
    }
    renderStep();
  });

  closeBtn?.addEventListener('click', () => {
    box.hidden = true;
    startBtn.hidden = false;
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

function initializeDataErase() {
  const eraseBtn = document.querySelector('#erase-all-data');
  const cancelBtn = document.querySelector('#cancel-erase-data');
  const status = document.querySelector('#erase-data-status');
  let confirming = false;

  eraseBtn?.addEventListener('click', () => {
    if (!confirming) {
      confirming = true;
      eraseBtn.textContent = 'Confirm erase all data';
      if (cancelBtn) cancelBtn.hidden = false;
      if (status) {
        status.textContent = 'Click “Confirm erase all data” to remove your check-in, daily tasks, journal note, and rough-day plan from this browser.';
      }
      return;
    }

    try {
      Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
      confirming = false;
      eraseBtn.textContent = 'Erase all saved data';
      if (cancelBtn) cancelBtn.hidden = true;
      setMood('');
      document.querySelector('#checkin-response').textContent = '';
      updateCheckinFollowup('');
      document.querySelectorAll('[data-daily]').forEach((box) => { box.checked = false; });
      updateDailyCount();
      document.querySelectorAll('[data-task]').forEach((btn) => {
        btn.classList.remove('is-done');
        btn.setAttribute('aria-pressed', 'false');
        btn.innerHTML = 'I did this <span aria-hidden="true">→</span>';
      });
      const journalEntry = document.querySelector('#journal-entry');
      if (journalEntry) journalEntry.value = '';
      const journalCounter = document.querySelector('#journal-counter');
      if (journalCounter) journalCounter.textContent = '0/3000';
      ['signs', 'helpful', 'person', 'message'].forEach((field) => {
        const input = document.querySelector(`#steady-${field}`);
        if (input) input.value = '';
        const counter = document.querySelector(`[data-counter-for="steady-${field}"]`);
        if (counter) counter.textContent = '0/100';
      });
      const copyBtn = document.querySelector('#copy-steady-message');
      if (copyBtn) copyBtn.hidden = true;
      if (status) status.textContent = 'All saved MEN-TAL entries have been erased from this browser.';
      showToast('All saved entries have been cleared from this browser.');
    } catch (error) {
      console.error('Could not erase saved data from localStorage.', error);
      showToast('Could not erase browser storage right now.');
    }
  });

  cancelBtn?.addEventListener('click', () => {
    confirming = false;
    eraseBtn.textContent = 'Erase all saved data';
    cancelBtn.hidden = true;
    if (status) {
      status.textContent = 'Your check-ins, daily tasks, journal note, and rough-day plan are stored locally in this browser. You can erase all saved entries whenever you like.';
    }
  });
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
initializePathways();
initializeDailyPlan();
initializeJournal();
initializeSteadyPlan();
initializeBreathing();
initializeGrounding();
initializeLocationSupport();
initializeContributions();
initializeDataErase();
initializeInstallation();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch((error) => {
      console.error('MEN-TAL could not enable offline support.', error);
    });
  });
}
