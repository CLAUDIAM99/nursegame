/* ========== TURNO DI TERAPIA - Game Logic ========== */

// === Data: Patients (modular) ===
const PATIENTS = [
  {
    id: 'P001',
    name: 'Maria Rossi',
    age: 72,
    room: 101,
    avatarColor: '#5ba3a3',
    avatarEmoji: '👩‍🦳',
    trait: 'Paziente e collaborativa',
    clinicalNote: 'Ipertensione controllata. Monitorare pressione pre-somministrazione.',
    medication: 'Ramaril 10mg - 1 compressa al mattino',
    barcodeId: 'BRC-MR-101-A7',
    correctAction: 'somministra',
    identifiers: [
      { label: 'Nome e cognome', value: 'Maria Rossi', key: 'name' },
      { label: 'Data di nascita', value: '12/03/1952', key: 'dob' }
    ],
    dialogues: [
      'Buongiorno, ero in attesa. Grazie di essere passata.',
      'Prendo sempre le medicine con un po\' d\'acqua.',
      'Come va oggi? Io mi sento abbastanza bene.'
    ]
  },
  {
    id: 'P002',
    name: 'Giuseppe Bianchi',
    age: 58,
    room: 102,
    avatarColor: '#7ebdbd',
    avatarEmoji: '👨',
    trait: 'A volte ansioso',
    clinicalNote: 'Allergia documentata a penicillina. Verificare sempre la scheda allergie.',
    medication: 'Paracetamolo 500mg - 2 compresse se febbre',
    barcodeId: 'BRC-GB-102-B3',
    correctAction: 'chiama',
    identifiers: [
      { label: 'Nome e cognome', value: 'Giuseppe Bianchi', key: 'name' },
      { label: 'Numero stanza', value: '102', key: 'room' }
    ],
    dialogues: [
      'Spero non ci siano problemi con i farmaci...',
      'Ho avuto reazioni in passato, preferisco stare attento.',
      'Mi può rassicurare su cosa sto prendendo?'
    ]
  },
  {
    id: 'P003',
    name: 'Anna Verdi',
    age: 45,
    room: 103,
    avatarColor: '#e07a6e',
    avatarEmoji: '👩',
    trait: 'Indipendente e curiosa',
    clinicalNote: 'Pressione sistolica rilevata 90 mmHg questa mattina. Valutare somministrazione.',
    medication: 'Enalapril 5mg - 1 compressa',
    barcodeId: 'BRC-AV-103-C9',
    correctAction: 'rimanda',
    identifiers: [
      { label: 'Codice fiscale (ultimi 4)', value: 'VRDA85', key: 'cf' },
      { label: 'Stanza', value: '103', key: 'room' }
    ],
    dialogues: [
      'Oggi non mi sento molto in forma, ma va bene.',
      'Volevo chiedere: posso mangiare prima di prendere la pastiglia?',
      'Mi sono pesata stamattina, è tutto ok?'
    ]
  },
  {
    id: 'P004',
    name: 'Luigi Neri',
    age: 81,
    room: 104,
    avatarColor: '#a8c5d9',
    avatarEmoji: '👴',
    trait: 'Burbero ma di cuore',
    clinicalNote: 'Rifiuto occasionale della terapia. Pazienza e dialogo consigliati.',
    medication: 'Aspirina 100mg - 1 compressa antiaggregante',
    barcodeId: 'BRC-LN-104-D2',
    correctAction: 'somministra',
    identifiers: [
      { label: 'Cognome', value: 'Neri', key: 'surname' },
      { label: 'Anno di nascita', value: '1943', key: 'year' }
    ],
    dialogues: [
      'Ancora queste pastiglie... Ma va bene, le prendo.',
      'Non mi piace essere un peso per nessuno.',
      'Le infermiere qui sono brave. Lo dico davvero.'
    ]
  }
];

// === Data: Dynamic Events ===
const DYNAMIC_EVENTS = [
  {
    id: 'not_in_room',
    type: 'danger',
    title: 'Paziente non in stanza',
    text: 'Il paziente della stanza 102 non è nel letto. Cercare in bagno o in corridoio prima di somministrare.',
    icon: '🚶'
  },
  {
    id: 'allergy_warning',
    type: 'danger',
    title: 'Avviso allergie',
    text: 'Controllare la scheda allergie del paziente Bianchi: allergia documentata a penicillina.',
    icon: '⚠️'
  },
  {
    id: 'bp_low',
    type: 'warning',
    title: 'Pressione bassa',
    text: 'Paziente stanza 103: pressione sistolica 90 mmHg. Valutare con medico prima di somministrare Enalapril.',
    icon: '❤️‍🩹'
  },
  {
    id: 'refuses',
    type: 'warning',
    title: 'Rifiuto terapia',
    text: 'Paziente Neri può rifiutare la terapia. Procedere con tatto e documentare eventuale rifiuto.',
    icon: '🤔'
  },
  {
    id: 'urgent_rx',
    type: 'info',
    title: 'Nuova prescrizione urgente',
    text: 'Il medico ha lasciato una nuova prescrizione al banco. Ritirare e verificare prima di somministrare.',
    icon: '📋'
  },
  {
    id: 'confusion',
    type: 'warning',
    title: 'Possibile confusione',
    text: 'Attenzione: due pazienti con nomi simili nel reparto. Verificare sempre braccialetto identificativo.',
    icon: '🔍'
  }
];

// === Data: Head Nurse Messages ===
const HEAD_NURSE_MESSAGES = {
  start: 'Benvenuta al turno! Controlla ogni paziente con attenzione e verifica sempre i braccialetti.',
  after_first: 'Ottimo inizio! Ricorda: due identificatori per ogni paziente.',
  mid_shift: 'Sei a metà turno. Continuare con la stessa cura.',
  near_end: 'Ultimi pazienti! Mantieni la concentrazione.',
  event: 'Evento in reparto: leggi attentamente e adatta il tuo piano.',
  correct: 'Perfetto! Procedura corretta.',
  error: 'Attenzione: verifica la documentazione e le prescrizioni.'
};

// === State ===
let gameState = {
  mode: 'calm', // calm | challenge
  scores: { safety: 0, speed: 0, trust: 0 },
  medsCorrect: 0,
  nearMisses: 0,
  errors: 0,
  currentPatient: null,
  currentStep: 0,
  verifiedIdentifiers: 0,
  safetyChecked: false,
  timerInterval: null,
  elapsedSeconds: 0,
  patientStartTimes: {},
  completedPatients: 0,
  activeEvents: []
};

// === DOM References ===
const screens = {
  start: document.getElementById('start-screen'),
  game: document.getElementById('game-screen'),
  end: document.getElementById('end-screen')
};

const modals = {
  patient: document.getElementById('patient-modal'),
  scan: document.getElementById('scan-modal'),
  decision: document.getElementById('decision-modal')
};

// === Helpers ===
function showScreen(screenId) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

function showModal(modal, show = true) {
  modal.classList.toggle('active', show);
}

function showFeedback(message, type) {
  const toast = document.getElementById('feedback-toast');
  toast.className = `feedback-toast ${type}`;
  toast.querySelector('.feedback-icon').textContent = type === 'success' ? '✓' : type === 'warning' ? '!' : '✕';
  toast.querySelector('.feedback-text').textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2500);
}

function updateHNMessage(msg) {
  const el = document.getElementById('hn-message');
  if (el) el.textContent = msg;
}

function randomDialogue(patient) {
  const arr = patient.dialogues || [];
  return arr[Math.floor(Math.random() * arr.length)] || '...';
}

// === Timer ===
function startTimer() {
  gameState.elapsedSeconds = 0;
  const el = document.getElementById('timer-display');
  el.className = 'timer';
  gameState.timerInterval = setInterval(() => {
    gameState.elapsedSeconds++;
    const m = Math.floor(gameState.elapsedSeconds / 60);
    const s = gameState.elapsedSeconds % 60;
    el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    if (gameState.mode === 'challenge') {
      if (gameState.elapsedSeconds > 300) el.classList.add('danger');
      else if (gameState.elapsedSeconds > 240) el.classList.add('warning');
    }
  }, 1000);
}

function stopTimer() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;
  }
}

// === Score Update ===
function updateScoreDisplay() {
  document.getElementById('score-safety').querySelector('strong').textContent = gameState.scores.safety;
  document.getElementById('score-speed').querySelector('strong').textContent = gameState.scores.speed;
  document.getElementById('score-trust').querySelector('strong').textContent = gameState.scores.trust;
  document.getElementById('meds-done').textContent = gameState.medsCorrect;
}

// === Dynamic Events ===
function triggerRandomEvent() {
  if (gameState.activeEvents.length >= 2) return;
  const ev = DYNAMIC_EVENTS[Math.floor(Math.random() * DYNAMIC_EVENTS.length)];
  if (gameState.activeEvents.some(e => e.id === ev.id)) return;
  gameState.activeEvents.push(ev);
  updateHNMessage(HEAD_NURSE_MESSAGES.event);
  renderEvent(ev);
}

function renderEvent(ev) {
  const container = document.getElementById('dynamic-events');
  const div = document.createElement('div');
  div.className = `event-banner ${ev.type}`;
  div.dataset.id = ev.id;
  div.innerHTML = `<span class="event-icon">${ev.icon}</span><span class="event-text"><strong>${ev.title}</strong><br>${ev.text}</span>`;
  container.appendChild(div);
  setTimeout(() => {
    div.remove();
    gameState.activeEvents = gameState.activeEvents.filter(e => e.id !== ev.id);
  }, 8000);
}

// === Patients Grid ===
function renderPatients() {
  const grid = document.getElementById('patients-grid');
  grid.innerHTML = '';
  PATIENTS.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'patient-card';
    card.dataset.id = p.id;
    card.innerHTML = `
      <div class="patient-header">
        <div class="patient-avatar" style="background:${p.avatarColor}40;color:${p.avatarColor}">${p.avatarEmoji}</div>
        <div class="patient-info">
          <div class="patient-name">${p.name}</div>
          <div class="patient-meta">Stanza ${p.room} • ${p.age} anni</div>
        </div>
      </div>
      <div class="patient-footer">
        <div class="patient-trait">${p.trait}</div>
      </div>
    `;
    card.addEventListener('click', () => openPatientCard(p));
    grid.appendChild(card);
  });
}

function markPatientCompleted(id) {
  const card = document.querySelector(`.patient-card[data-id="${id}"]`);
  if (card) card.classList.add('completed');
}

// === Patient Card Modal ===
function openPatientCard(patient) {
  gameState.currentPatient = { ...patient };
  gameState.verifiedIdentifiers = 0;
  gameState.safetyChecked = false;
  gameState.patientStartTimes[patient.id] = gameState.patientStartTimes[patient.id] || Date.now();

  const content = document.getElementById('patient-card-content');
  content.innerHTML = `
    <div class="patient-detail-header">
      <div class="patient-detail-avatar" style="background:${patient.avatarColor}40;color:${patient.avatarColor}">${patient.avatarEmoji}</div>
      <div>
        <div class="patient-detail-name">${patient.name}</div>
        <div class="patient-detail-meta">Stanza ${patient.room} • ${patient.age} anni</div>
      </div>
    </div>
    <p class="patient-dialogue" style="font-style:italic;color:var(--color-teal);margin-bottom:1rem">"${randomDialogue(patient)}"</p>
    <p class="section-title">Note cliniche</p>
    <div class="patient-clinical">${patient.clinicalNote}</div>
    <p class="section-title">Farmaco prescritto</p>
    <div class="patient-medication">${patient.medication}</div>
    <p class="section-title">Verifica identità (2 identificatori)</p>
    <div class="identifiers">
      ${patient.identifiers.map((id, i) => `
        <div class="identifier-row" data-idx="${i}" data-key="${id.key}">
          <span>${id.label}: <strong>${id.value}</strong></span>
        </div>
      `).join('')}
    </div>
    <p class="section-title">Condizione di sicurezza</p>
    <div class="checkbox-group" id="safety-checkbox">
      <input type="checkbox" id="safety-check">
      <label for="safety-check">Ho verificato che non ci siano controindicazioni o allergie per questo farmaco</label>
    </div>
    <button class="btn-open-patient" id="btn-open-decision" disabled>Procedi alla decisione</button>
  `;

  const identifierRows = content.querySelectorAll('.identifier-row');
  identifierRows.forEach(row => {
    row.addEventListener('click', () => verifyIdentifier(row));
  });

  const checkbox = content.querySelector('#safety-checkbox');
  content.querySelector('#safety-check').addEventListener('change', function() {
    gameState.safetyChecked = this.checked;
    checkbox.classList.toggle('checked', this.checked);
    updateProceedButton();
  });

  content.querySelector('#btn-open-decision').addEventListener('click', () => {
    if (gameState.verifiedIdentifiers >= 2 && gameState.safetyChecked) {
      showModal(modals.patient, false);
      openScanModal('bracelet');
    } else {
      showFeedback('Verifica prima 2 identificatori e la condizione di sicurezza.', 'warning');
    }
  });

  showModal(modals.patient, true);
}

function verifyIdentifier(row) {
  if (row.classList.contains('verified')) return;
  row.classList.add('verified');
  gameState.verifiedIdentifiers++;
  gameState.scores.safety += 5;
  gameState.scores.trust += 2;
  updateScoreDisplay();
  updateProceedButton();
}

function updateProceedButton() {
  const btn = document.querySelector('#btn-open-decision');
  if (btn) btn.disabled = !(gameState.verifiedIdentifiers >= 2 && gameState.safetyChecked);
}

// === Barcode Scan ===
function openScanModal(type) {
  const isBracelet = type === 'bracelet';
  document.getElementById('scan-title').textContent = isBracelet ? 'Scansione braccialetto paziente' : 'Scansione confezione farmaco';
  const code = gameState.currentPatient ? (isBracelet ? gameState.currentPatient.barcodeId : `MED-${gameState.currentPatient.id}-A1`) : '---';
  document.getElementById('barcode-display').textContent = code;
  document.getElementById('btn-scan').textContent = 'Scansiona';
  document.getElementById('btn-scan').dataset.nextType = isBracelet ? 'medication' : 'decision';
  showModal(modals.scan, true);
}

function doScan() {
  const btn = document.getElementById('btn-scan');
  const nextType = btn.dataset.nextType;
  btn.textContent = '✓ Scansionato';
  btn.disabled = true;
  gameState.scores.safety += 3;
  updateScoreDisplay();
  showFeedback('Scansione completata correttamente.', 'success');
  setTimeout(() => {
    showModal(modals.scan, false);
    btn.disabled = false;
    if (nextType === 'medication') {
      openScanModal('medication');
    } else {
      openDecisionModal();
    }
  }, 800);
}

// === Decision Modal ===
function openDecisionModal() {
  const p = gameState.currentPatient;
  document.getElementById('decision-patient-name').textContent = `${p.name} - ${p.medication}`;
  modals.decision.querySelectorAll('.btn-decision').forEach(btn => {
    btn.onclick = () => handleDecision(btn.dataset.action);
  });
  showModal(modals.decision, true);
}

function handleDecision(action) {
  const patient = gameState.currentPatient;
  const correct = patient.correctAction;
  const isCorrect = action === correct;

  // Speed bonus (challenge mode)
  const startTime = gameState.patientStartTimes[patient.id];
  const duration = (Date.now() - startTime) / 1000;
  if (gameState.mode === 'challenge' && duration < 60) {
    gameState.scores.speed += 5;
  } else if (gameState.mode === 'calm') {
    gameState.scores.speed += 2;
  }

  if (isCorrect) {
    gameState.medsCorrect++;
    gameState.scores.safety += 10;
    gameState.scores.trust += 5;
    showFeedback(`Scelta corretta per ${patient.name}. Ottimo lavoro!`, 'success');
    updateHNMessage(HEAD_NURSE_MESSAGES.correct);
  } else {
    gameState.errors++;
    if (action === 'chiama' && correct !== 'chiama') {
      gameState.nearMisses++;
      showFeedback('Attenzione: in questo caso non era necessario chiamare il medico. Verifica la scheda.', 'warning');
    } else if (action === 'somministra' && (correct === 'rimanda' || correct === 'chiama')) {
      showFeedback(`Errore: per ${patient.name} la scelta corretta era "${correct === 'chiama' ? 'Chiama medico' : 'Rimanda'}". Rivedi la scheda.`, 'danger');
    } else {
      showFeedback(`Scelta non ottimale per questo paziente.`, 'warning');
      gameState.nearMisses++;
    }
    updateHNMessage(HEAD_NURSE_MESSAGES.error);
  }

  updateScoreDisplay();
  markPatientCompleted(patient.id);
  gameState.completedPatients++;

  showModal(modals.decision, false);
  gameState.currentPatient = null;

  // HN message by progress
  if (gameState.completedPatients === 1) updateHNMessage(HEAD_NURSE_MESSAGES.after_first);
  else if (gameState.completedPatients === 2) updateHNMessage(HEAD_NURSE_MESSAGES.mid_shift);
  else if (gameState.completedPatients >= 3) updateHNMessage(HEAD_NURSE_MESSAGES.near_end);

  if (gameState.completedPatients >= 4) {
    setTimeout(endShift, 1200);
  }
}

// === End Shift ===
function endShift() {
  stopTimer();
  const total = gameState.scores.safety + gameState.scores.speed + gameState.scores.trust;
  document.getElementById('end-total-score').textContent = total;
  document.getElementById('end-meds-correct').textContent = gameState.medsCorrect;
  document.getElementById('end-near-misses').textContent = gameState.nearMisses;
  document.getElementById('end-errors').textContent = gameState.errors;

  const evalText = getEvaluationText(total, gameState.medsCorrect, gameState.errors, gameState.nearMisses);
  document.getElementById('end-evaluation-text').textContent = evalText;

  showScreen('end-screen');
}

function getEvaluationText(total, correct, errors, nearMisses) {
  if (errors === 0 && correct === 4) {
    return 'Turno eccellente! Hai somministrato tutti i farmaci in sicurezza, verificato le identità e gestito gli eventi con professionalità. Il reparto è in buone mani.';
  }
  if (errors <= 1 && nearMisses > 0) {
    return 'Buon turno. Hai evitato diversi potenziali errori grazie alla tua attenzione. Continua a verificare sempre le schede e le allergie.';
  }
  if (errors >= 2) {
    return 'Turno impegnativo. Ci sono stati alcuni errori: ricordati di verificare sempre due identificatori, controllare le allergie e le note cliniche prima di somministrare. La sicurezza del paziente viene prima di tutto.';
  }
  return 'Turno completato. Hai gestito la maggior parte delle situazioni correttamente. Continua a migliorare verificando le procedure di sicurezza.';
}

// === Init ===
function initGame() {
  gameState = {
    mode: document.querySelector('.mode-btn.active')?.dataset.mode || 'calm',
    scores: { safety: 0, speed: 0, trust: 0 },
    medsCorrect: 0,
    nearMisses: 0,
    errors: 0,
    currentPatient: null,
    verifiedIdentifiers: 0,
    safetyChecked: false,
    timerInterval: null,
    elapsedSeconds: 0,
    patientStartTimes: {},
    completedPatients: 0,
    activeEvents: []
  };

  updateScoreDisplay();
  renderPatients();
  updateHNMessage(HEAD_NURSE_MESSAGES.start);
  startTimer();

  // Random events
  setTimeout(triggerRandomEvent, 8000);
  setTimeout(triggerRandomEvent, 20000);

  showScreen('game-screen');
}

// === Event Listeners ===
document.getElementById('btn-start').addEventListener('click', initGame);

document.getElementById('btn-calm').addEventListener('click', () => {
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('btn-calm').classList.add('active');
});

document.getElementById('btn-challenge').addEventListener('click', () => {
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('btn-challenge').classList.add('active');
});

document.getElementById('modal-close').addEventListener('click', () => showModal(modals.patient, false));
document.getElementById('scan-close').addEventListener('click', () => showModal(modals.scan, false));

document.getElementById('btn-scan').addEventListener('click', doScan);

modals.patient.querySelector('.modal-backdrop').addEventListener('click', () => showModal(modals.patient, false));
modals.scan.querySelector('.modal-backdrop').addEventListener('click', () => showModal(modals.scan, false));
modals.decision.querySelector('.modal-backdrop').addEventListener('click', () => {});

document.getElementById('btn-restart').addEventListener('click', () => {
  showScreen('start-screen');
});
