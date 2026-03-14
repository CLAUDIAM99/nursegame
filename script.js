const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const endScreen = document.getElementById("endScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const roundLabel = document.getElementById("roundLabel");
const starsLabel = document.getElementById("starsLabel");
const timerLabel = document.getElementById("timerLabel");

const patientAvatar = document.getElementById("patientAvatar");
const patientName = document.getElementById("patientName");
const patientMood = document.getElementById("patientMood");
const patientDialogue = document.getElementById("patientDialogue");

const braceletChoices = document.getElementById("braceletChoices");
const medicineChoices = document.getElementById("medicineChoices");
const selectedMedicine = document.getElementById("selectedMedicine");
const trayDropzone = document.getElementById("trayDropzone");
const deliverBtn = document.getElementById("deliverBtn");
const skipBtn = document.getElementById("skipBtn");
const feedbackBox = document.getElementById("feedbackBox");

const resultTitle = document.getElementById("resultTitle");
const starsBig = document.getElementById("starsBig");
const resultText = document.getElementById("resultText");

const rounds = [
  {
    patient: "Adele",
    mood: "Si sente un po' confusa ma sorride.",
    dialogue: "Ciao tesoro, questa medicina è proprio per me?",
    avatar: "peach",
    correctBracelet: "Adele R.",
    bracelets: ["Adele R.", "Marta P.", "Leo T."],
    correctMedicine: "Pillola blu",
    medicines: [
      { name: "Pillola blu", color: "#9dcbff" },
      { name: "Sciroppo rosa", color: "#ffb6cd" },
      { name: "Capsula verde", color: "#9be2b0" }
    ]
  },
  {
    patient: "Leo",
    mood: "È attento e vuole controllare tutto.",
    dialogue: "Prima leggiamo bene il mio nome, ok?",
    avatar: "blue",
    correctBracelet: "Leo T.",
    bracelets: ["Nina V.", "Leo T.", "Bruno L."],
    correctMedicine: "Capsula verde",
    medicines: [
      { name: "Bustina gialla", color: "#ffe27a" },
      { name: "Capsula verde", color: "#98e3af" },
      { name: "Pillola lilla", color: "#d7c0ff" }
    ]
  },
  {
    patient: "Marta",
    mood: "È tranquilla ma un po' stanca.",
    dialogue: "Grazie per andare piano, mi aiuta molto.",
    avatar: "purple",
    correctBracelet: "Marta P.",
    bracelets: ["Gino S.", "Marta P.", "Adele R."],
    correctMedicine: "Pillola lilla",
    medicines: [
      { name: "Pillola lilla", color: "#d6c0ff" },
      { name: "Sciroppo arancio", color: "#ffc28c" },
      { name: "Capsula verde", color: "#98e3af" }
    ]
  },
  {
    patient: "Gino",
    mood: "È allegro e fa sempre una battuta.",
    dialogue: "Se mi porti quella giusta ti regalo un sorriso!",
    avatar: "yellow",
    correctBracelet: "Gino S.",
    bracelets: ["Gino S.", "Adele R.", "Leo T."],
    correctMedicine: "Bustina gialla",
    medicines: [
      { name: "Bustina gialla", color: "#ffe27a" },
      { name: "Pillola blu", color: "#9dcbff" },
      { name: "Gocce rosa", color: "#ffb8ca" }
    ]
  }
];

let currentRound = 0;
let stars = 0;
let timer = 15;
let interval = null;

let chosenBracelet = null;
let chosenMedicine = null;
let trayLoaded = false;

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);
deliverBtn.addEventListener("click", deliverRound);
skipBtn.addEventListener("click", skipRound);
trayDropzone.addEventListener("click", loadTray);

function startGame() {
  currentRound = 0;
  stars = 0;
  startScreen.classList.remove("active");
  endScreen.classList.remove("active");
  gameScreen.classList.add("active");
  document.body.classList.add("game-active");
  loadRound();
}

function restartGame() {
  clearInterval(interval);
  document.body.classList.remove("game-active");
  startScreen.classList.add("active");
  gameScreen.classList.remove("active");
  endScreen.classList.remove("active");
}

function loadRound() {
  clearInterval(interval);

  const round = rounds[currentRound];
  if (!round) {
    endGame();
    return;
  }

  chosenBracelet = null;
  chosenMedicine = null;
  trayLoaded = false;
  timer = 15;

  roundLabel.textContent = currentRound + 1;
  starsLabel.textContent = stars;
  timerLabel.textContent = timer;

  patientAvatar.className = `patient-avatar omino-wrapper ${round.avatar}`;
  patientName.textContent = round.patient;
  patientMood.textContent = round.mood;
  patientDialogue.textContent = `"${round.dialogue}"`;

  selectedMedicine.textContent = "Nessuna medicina scelta";
  trayDropzone.textContent = "Vassoio";
  trayDropzone.classList.remove("ready");
  feedbackBox.textContent = "Pronta? Scegli la medicina e completa il mini gioco.";
  feedbackBox.className = "feedback-box neutral";

  renderBracelets(round);
  renderMedicines(round);
  startRoundTimer();
}

function renderBracelets(round) {
  braceletChoices.innerHTML = "";
  round.bracelets.forEach(name => {
    const btn = document.createElement("button");
    btn.className = "bracelet-option";
    btn.textContent = name;
    btn.addEventListener("click", () => {
      chosenBracelet = name;
      document.querySelectorAll(".bracelet-option").forEach(el => el.classList.remove("correct", "wrong"));
      if (name === round.correctBracelet) {
        btn.classList.add("correct");
        setFeedback("Braccialetto giusto! Adesso scegli o trascina la medicina.", "good");
      } else {
        btn.classList.add("wrong");
        setFeedback("Ops! Quel braccialetto non è corretto.", "bad");
      }
    });
    braceletChoices.appendChild(btn);
  });
}

function renderMedicines(round) {
  medicineChoices.innerHTML = "";
  round.medicines.forEach(med => {
    const card = document.createElement("div");
    card.className = "medicine-option";
    card.innerHTML = `
      <div class="medicine-icon" style="background:${med.color};"></div>
      <strong>${med.name}</strong>
    `;
    card.addEventListener("click", () => {
      chosenMedicine = med.name;
      document.querySelectorAll(".medicine-option").forEach(el => el.classList.remove("selected"));
      card.classList.add("selected");
      selectedMedicine.textContent = `Hai scelto: ${med.name}`;
      setFeedback("Perfetto, ora tocca il vassoio per preparare la consegna.", "neutral");
    });
    medicineChoices.appendChild(card);
  });
}

function loadTray() {
  if (!chosenMedicine) {
    setFeedback("Prima scegli una medicina.", "bad");
    return;
  }
  trayLoaded = true;
  trayDropzone.classList.add("ready");
  trayDropzone.textContent = `Pronto: ${chosenMedicine}`;
  setFeedback("Vassoio preparato! Ora puoi consegnare.", "good");
}

function deliverRound() {
  const round = rounds[currentRound];
  let points = 0;

  if (chosenBracelet === round.correctBracelet) points += 1;
  if (chosenMedicine === round.correctMedicine) points += 1;
  if (trayLoaded) points += 1;

  if (points === 3) {
    stars += 3;
    setFeedback("Yay! Tutto perfetto, paziente felicissimo!", "good");
  } else if (points === 2) {
    stars += 2;
    setFeedback("Quasi perfetto! Buona consegna.", "neutral");
  } else if (points === 1) {
    stars += 1;
    setFeedback("Hai completato il round, ma con un po' di confusione.", "bad");
  } else {
    setFeedback("Ops! Round da rifare meglio.", "bad");
  }

  starsLabel.textContent = stars;

  setTimeout(() => {
    currentRound += 1;
    loadRound();
  }, 1100);
}

function skipRound() {
  setFeedback("Hai saltato questo paziente. Andiamo avanti!", "neutral");
  setTimeout(() => {
    currentRound += 1;
    loadRound();
  }, 900);
}

function startRoundTimer() {
  clearInterval(interval);
  interval = setInterval(() => {
    timer -= 1;
    timerLabel.textContent = timer;

    if (timer <= 0) {
      clearInterval(interval);
      setFeedback("Tempo scaduto! Passiamo al prossimo paziente.", "bad");
      setTimeout(() => {
        currentRound += 1;
        loadRound();
      }, 900);
    }
  }, 1000);
}

function setFeedback(text, type) {
  feedbackBox.textContent = text;
  feedbackBox.className = `feedback-box ${type}`;
}

function endGame() {
  clearInterval(interval);
  document.body.classList.remove("game-active");
  gameScreen.classList.remove("active");
  endScreen.classList.add("active");

  if (stars >= 10) {
    resultTitle.textContent = "Super dolcezza!";
    starsBig.textContent = "⭐ ⭐ ⭐";
    resultText.textContent = "Hai giocato con attenzione, ritmo e precisione. Reparto felicissimo.";
  } else if (stars >= 6) {
    resultTitle.textContent = "Brava!";
    starsBig.textContent = "⭐ ⭐";
    resultText.textContent = "Hai completato bene il turno. Ancora un po' di pratica e sarai perfetta.";
  } else {
    resultTitle.textContent = "Hai fatto del tuo meglio!";
    starsBig.textContent = "⭐";
    resultText.textContent = "Sei all'inizio, ma round dopo round andrai sempre meglio.";
  }
}
