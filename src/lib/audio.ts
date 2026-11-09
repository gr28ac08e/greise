let activeButton: HTMLButtonElement | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeAudio: HTMLAudioElement | null = null;

function setState(button: HTMLButtonElement, state: 'idle' | 'loading' | 'playing' | 'paused') {
  button.dataset.state = state;
  button.setAttribute('aria-pressed', state === 'playing' || state === 'paused' ? 'true' : 'false');
  const label = button.querySelector<HTMLElement>('.audio-label');
  const text = state === 'loading' ? 'Préparation…' : state === 'paused' ? 'Reprendre' : state === 'playing' ? 'Pause' : 'Écouter';
  if (label) label.textContent = text;
  button.setAttribute('aria-label', `${text} l’article à voix haute`);
}

function stopActive(except?: HTMLButtonElement) {
  if (activeButton && activeButton !== except) setState(activeButton, 'idle');
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  if (activeAudio) { activeAudio.pause(); activeAudio.currentTime = 0; }
  activeButton = null;
  activeUtterance = null;
  activeAudio = null;
}

function speak(button: HTMLButtonElement) {
  if (!('speechSynthesis' in window)) {
    setState(button, 'idle');
    const label = button.querySelector<HTMLElement>('.audio-label');
    if (label) label.textContent = 'Audio indisponible';
    return;
  }
  const text = button.dataset.audioText || '';
  if (!text.trim()) { setState(button, 'idle'); return; }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'fr-FR';
  utterance.rate = 0.98;
  utterance.pitch = 1;
  const frenchVoice = window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith('fr'));
  if (frenchVoice) utterance.voice = frenchVoice;
  utterance.onstart = () => setState(button, 'playing');
  utterance.onend = () => { setState(button, 'idle'); if (activeButton === button) activeButton = null; activeUtterance = null; };
  utterance.onerror = () => { setState(button, 'idle'); if (activeButton === button) activeButton = null; activeUtterance = null; };
  activeButton = button;
  activeUtterance = utterance;
  setState(button, 'loading');
  window.speechSynthesis.speak(utterance);
}

function toggle(button: HTMLButtonElement) {
  if (activeButton === button && activeAudio) {
    if (activeAudio.paused) { void activeAudio.play().then(() => setState(button, 'playing')).catch(() => speak(button)); }
    else { activeAudio.pause(); setState(button, 'paused'); }
    return;
  }
  if (activeButton === button && activeUtterance && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
    if (window.speechSynthesis.paused) { window.speechSynthesis.resume(); setState(button, 'playing'); }
    else { window.speechSynthesis.pause(); setState(button, 'paused'); }
    return;
  }
  stopActive(button);
  const audio = button.closest('.audio-control')?.querySelector<HTMLAudioElement>('audio');
  if (audio) {
    activeButton = button;
    activeAudio = audio;
    setState(button, 'loading');
    audio.onended = () => { setState(button, 'idle'); activeButton = null; activeAudio = null; };
    audio.ontimeupdate = () => {
      const progress = button.querySelector<HTMLElement>('.audio-progress > span');
      if (progress && audio.duration) progress.style.width = `${Math.min(100, audio.currentTime / audio.duration * 100)}%`;
    };
    audio.onerror = () => { activeAudio = null; speak(button); };
    void audio.play().then(() => setState(button, 'playing')).catch(() => speak(button));
    return;
  }
  speak(button);
}

export function initAudioPlayers() {
  document.querySelectorAll<HTMLButtonElement>('[data-audio]').forEach((button) => {
    if (button.dataset.audioBound === 'true') return;
    button.dataset.audioBound = 'true';
    button.addEventListener('click', () => toggle(button));
  });
}
