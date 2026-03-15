const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const endScreen = document.getElementById("endScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const nextBtn = document.getElementById("nextBtn");

const orderIndexEl = document.getElementById("orderIndex");
const stepIndexEl = document.getElementById("stepIndex");
const scoreValueEl = document.getElementById("scoreValue");
const timerValueEl = document.getElementById("timerValue");

const orderTitle = document.getElementById("orderTitle");
const orderText = document.getElementById("orderText");
const customerAvatar = document.getElementById("customerAvatar");
const customerName = document.getElementById("customerName");
const customerMood = document.getElementById("customerMood");
const mamaActor = document.getElementById("mamaActor");
const actorBubble = document.getElementById("actorBubble");

const flavorGrid = document.getElementById("flavorGrid");
const iceFill = document.getElementById("iceFill");
const stopIceBtn = document.getElementById("stopIceBtn");
const toppingGrid = document.getElementById("toppingGrid");
const cupDropzone = document.getElementById("cupDropzone");
const cupToppingVisual = document.getElementById("cupToppingVisual");
const shakeCup = document.getElementById("shakeCup");
const shakeProgress = document.getElementById("shakeProgress");
const shakeLabel = document.getElementById("shakeLabel");
const shakeBtn = document.getElementById("shakeBtn");

const lastGrade = document.getElementById("lastGrade");
const helperText = document.getElementById("helperText");
const starsRow = document.getElementById("starsRow");
const gradePopup = document.getElementById("gradePopup");
const gradePopupText = document.getElementById("gradePopupText");

const finalTitle = document.getElementById("finalTitle");
const finalStars = document.getElementById("finalStars");
const finalMessage = document.getElementById("finalMessage");

const orders = [
  {
    name: "Classic Strawberry",
    text: "Fragola, ghiaccio medio, perle nere.",
    customer: "Mimi",
    mood: "\"Lo voglio dolcissimo!\"",
    avatar: "avatar-pink",
    flavor: "Fragola",
    flavors: ["Fragola", "Mango", "Matcha"],
    topping: "Perle nere",
    toppingColor: "#2d2d2d",
    toppings: [
      { name: "Perle nere", color: "#2d2d2d" },
      { name: "Lychee", color: "#ffb6c1" },
      { name: "Pudding", color: "#f5d4c8" }
    ]
  },
  {
    name: "Green Matcha",
    text: "Matcha, poco ghiaccio, lychee.",
    customer: "Luna",
    mood: "\"Freschissimo per favore!\"",
    avatar: "avatar-mint",
    flavor: "Matcha",
    flavors: ["Fragola", "Matcha", "Taro"],
    topping: "Lychee",
    toppingColor: "#ffb6c1",
    toppings: [
      { name: "Perle nere", color: "#2d2d2d" },
      { name: "Lychee", color: "#ffb6c1" },
      { name: "Pudding", color: "#f5d4c8" }
    ]
  },
  {
    name: "Taro Dream",
    text: "Taro, ghiaccio normale, pudding.",
    customer: "Kiki",
    mood: "\"Con tanto topping!\"",
    avatar: "avatar-peach",
    flavor: "Taro",
    flavors: ["Taro", "Mango", "Fragola"],
    topping: "Pudding",
    toppingColor: "#f5d4c8",
    toppings: [
      { name: "Lychee", color: "#ffb6c1" },
      { name: "Pudding", color: "#f5d4c8" },
      { name: "Perle nere", color: "#2d2d2d" }
    ]
  }
];

const SHAKE_GOAL = 16;
const TARGET_ZONE_START = 39;
const TARGET_ZONE_END = 61;
const ICE_SPEED = 1.8;
const TIMER_START = 10;

let currentOrderIdx = 0;
let currentStep = 1;
let totalScore = 0;
let orderStars = 0;
let iceInterval = null;
let iceWidth = 0;
let timerInterval = null;
let timerLeft = TIMER_START;
let shakeCount = 0;
let toppingDropped = false;
let draggedTopping = null;

function showScreen(screen) {
  [startScreen, gameScreen, endScreen].forEach(s => s.classList.remove("active"));
  screen.classList.add("active");
}

function setGrade(text, type) {
  lastGrade.textContent = text;
  lastGrade.className = `grade-badge ${type}`;
}

function setMamaState(state, bubbleText) {
  if (!mamaActor || !actorBubble) return;
  mamaActor.className = "mama-actor " + (state || "idle");
  actorBubble.textContent = bubbleText || "Pronta!";
  var once = state === "success" || state === "fail" || state === "pick" || state === "pour" || state === "point";
  if (once) {
    var duration = state === "success" || state === "fail" ? 700 : 550;
    setTimeout(function() {
      mamaActor.className = "mama-actor idle";
      actorBubble.textContent = "Pronta!";
    }, duration);
  }
}

function showGradePopup(text) {
  gradePopupText.textContent = text;
  gradePopup.classList.remove("hidden");
  setTimeout(() => gradePopup.classList.add("hidden"), 800);
}

function updateStarsRow() {
  const show = Math.min(orderStars, 3);
  const filled = "★".repeat(show);
  const empty = "☆".repeat(3 - show);
  starsRow.textContent = filled + empty;
}

function loadOrder() {
  const order = orders[currentOrderIdx];
  orderTitle.textContent = order.name;
  orderText.textContent = order.text;
  customerName.textContent = order.customer;
  customerMood.textContent = order.mood;
  customerAvatar.className = `customer-avatar ${order.avatar}`;
  orderStars = 0;
  updateStarsRow();
  setGrade("Ready?", "neutral");
  helperText.textContent = "Completa il mini-game nel tempo giusto.";
  setMamaState("idle", "Pronta!");
}

function goToStep(step) {
  document.querySelectorAll(".step-screen").forEach(el => el.classList.remove("active-step"));
  const el = document.getElementById("step" + step);
  if (el) el.classList.add("active-step");
  currentStep = step;
  stepIndexEl.textContent = step;
  nextBtn.disabled = true;
  timerLeft = TIMER_START;
  timerValueEl.textContent = timerLeft;
  timerValueEl.className = "";

  clearInterval(timerInterval);
  timerInterval = setInterval(tickTimer, 1000);

  if (step === 1) {
    renderFlavors();
    helperText.textContent = "Scegli il gusto giusto per questo ordine.";
    setMamaState("point", "Scegli il gusto!");
  } else if (step === 2) {
    startIceMeter();
    helperText.textContent = "Ferma la barra nella zona verde!";
    setMamaState("pour", "Ferma il ghiaccio!");
  } else if (step === 3) {
    toppingDropped = false;
    cupToppingVisual.style.background = "transparent";
    cupToppingVisual.style.height = "0";
    cupDropzone.classList.remove("dropped");
    renderToppings();
    helperText.textContent = "Trascina il topping corretto nel bicchiere.";
    setMamaState("pick", "Trascina qui!");
  } else if (step === 4) {
    shakeCount = 0;
    shakeProgress.style.width = "0%";
    shakeLabel.textContent = `Tap 0 / ${SHAKE_GOAL}`;
    shakeCup.classList.remove("shaking");
    helperText.textContent = "Clicca SHAKE! 16 volte.";
    setMamaState("shake", "Shakera!");
  }
}

function tickTimer() {
  timerLeft--;
  timerValueEl.textContent = Math.max(0, timerLeft);
  if (timerLeft <= 2) timerValueEl.classList.add("danger");
  else if (timerLeft <= 4) timerValueEl.classList.add("warning");
  if (timerLeft <= 0) {
    clearInterval(timerInterval);
    failStep("Tempo scaduto!");
  }
}

function failStep(reason) {
  setGrade(reason, "bad");
  showGradePopup("Oops!");
  setMamaState("fail", "Oops!");
  nextBtn.disabled = false;
  if (iceInterval) {
    clearInterval(iceInterval);
    iceInterval = null;
  }
}

function passStep(message) {
  clearInterval(timerInterval);
  orderStars++;
  updateStarsRow();
  totalScore += 1;
  scoreValueEl.textContent = totalScore;
  setGrade(message, "good");
  showGradePopup("Nice!");
  setMamaState("success", "Perfetto!");
  nextBtn.disabled = false;
  if (iceInterval) {
    clearInterval(iceInterval);
    iceInterval = null;
  }
}

function renderFlavors() {
  flavorGrid.innerHTML = "";
  const order = orders[currentOrderIdx];
  order.flavors.forEach(name => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = name;
    btn.addEventListener("click", () => {
      clearInterval(timerInterval);
      document.querySelectorAll("#flavorGrid .choice-btn").forEach(b => b.classList.remove("correct", "wrong"));
      if (name === order.flavor) {
        btn.classList.add("correct");
        passStep("Gusto perfetto!");
      } else {
        btn.classList.add("wrong");
        failStep("Gusto sbagliato");
      }
    });
    flavorGrid.appendChild(btn);
  });
}

function startIceMeter() {
  iceWidth = 0;
  iceFill.style.width = "0%";
  if (iceInterval) clearInterval(iceInterval);
  iceInterval = setInterval(() => {
    iceWidth += ICE_SPEED;
    if (iceWidth >= 100) iceWidth = 0;
    iceFill.style.width = iceWidth + "%";
  }, 50);
}

stopIceBtn.addEventListener("click", () => {
  if (!iceInterval) return;
  clearInterval(iceInterval);
  iceInterval = null;
  if (iceWidth >= TARGET_ZONE_START && iceWidth <= TARGET_ZONE_END) {
    passStep("Ghiaccio perfetto!");
  } else {
    failStep("Fuori zona!");
  }
});

function renderToppings() {
  toppingGrid.innerHTML = "";
  const order = orders[currentOrderIdx];
  order.toppings.forEach(({ name, color }) => {
    const chip = document.createElement("div");
    chip.className = "topping-chip";
    chip.textContent = name;
    chip.dataset.name = name;
    chip.dataset.color = color;
    chip.draggable = true;
    chip.addEventListener("dragstart", (e) => {
      draggedTopping = { name, color };
      chip.classList.add("dragging");
      e.dataTransfer.setData("text/plain", name);
      e.dataTransfer.effectAllowed = "move";
    });
    chip.addEventListener("dragend", () => {
      chip.classList.remove("dragging");
      draggedTopping = null;
    });
    toppingGrid.appendChild(chip);
  });
}

cupDropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  cupDropzone.classList.add("drag-over");
});

cupDropzone.addEventListener("dragleave", () => {
  cupDropzone.classList.remove("drag-over");
});

cupDropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  cupDropzone.classList.remove("drag-over");
  if (!draggedTopping || toppingDropped) return;
  toppingDropped = true;
  const order = orders[currentOrderIdx];
  if (draggedTopping.name === order.topping) {
    cupToppingVisual.style.background = draggedTopping.color;
    cupToppingVisual.style.height = "28px";
    cupDropzone.classList.add("dropped");
    document.querySelectorAll(".topping-chip").forEach(c => c.classList.add("dropped"));
    passStep("Topping giusto!");
  } else {
    failStep("Topping sbagliato");
  }
});

shakeBtn.addEventListener("click", () => {
  shakeCount++;
  shakeProgress.style.width = (shakeCount / SHAKE_GOAL) * 100 + "%";
  shakeLabel.textContent = `Tap ${shakeCount} / ${SHAKE_GOAL}`;
  shakeCup.classList.add("shaking");
  setTimeout(() => shakeCup.classList.remove("shaking"), 120);
  if (shakeCount >= SHAKE_GOAL) {
    passStep("Shake completo!");
  }
});

nextBtn.addEventListener("click", () => {
  if (currentStep < 4) {
    goToStep(currentStep + 1);
  } else {
    currentOrderIdx++;
    if (currentOrderIdx < orders.length) {
      orderIndexEl.textContent = currentOrderIdx + 1;
      loadOrder();
      goToStep(1);
    } else {
      endGame();
    }
  }
});

function endGame() {
  clearInterval(timerInterval);
  clearInterval(iceInterval);
  showScreen(endScreen);
  const maxPoints = orders.length * 4;
  if (totalScore >= maxPoints * 0.75) {
    finalTitle.textContent = "Adorabile!";
    finalStars.textContent = "⭐ ⭐ ⭐";
    finalMessage.textContent = "Hai preparato i drink con precisione e tanto stile.";
  } else if (totalScore >= maxPoints * 0.5) {
    finalTitle.textContent = "Brava!";
    finalStars.textContent = "⭐ ⭐";
    finalMessage.textContent = "Ottimo lavoro. Ancora un po' di pratica e sarai perfetta.";
  } else {
    finalTitle.textContent = "Continua a provare!";
    finalStars.textContent = "⭐";
    finalMessage.textContent = "I primi ordini sono i più difficili. Rigioca per migliorare.";
  }
}

function startGame() {
  currentOrderIdx = 0;
  currentStep = 1;
  totalScore = 0;
  orderIndexEl.textContent = "1";
  scoreValueEl.textContent = "0";
  loadOrder();
  goToStep(1);
  showScreen(gameScreen);
}

restartBtn.addEventListener("click", () => showScreen(startScreen));
startBtn.addEventListener("click", startGame);
