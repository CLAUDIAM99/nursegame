const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const endScreen = document.getElementById("endScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const nextBtn = document.getElementById("nextBtn");

const stepLabel = document.getElementById("stepLabel");
const scoreLabel = document.getElementById("scoreLabel");
const orderName = document.getElementById("orderName");
const orderRequest = document.getElementById("orderRequest");

const flavorChoices = document.getElementById("flavorChoices");
const toppingChoices = document.getElementById("toppingChoices");
const iceBar = document.getElementById("iceBar");
const targetZone = document.getElementById("targetZone");
const stopIceBtn = document.getElementById("stopIceBtn");

const cup = document.getElementById("cup");
const shakeBtn = document.getElementById("shakeBtn");
const shakeCountEl = document.getElementById("shakeCount");

const feedback = document.getElementById("feedback");
const endTitle = document.getElementById("endTitle");
const starView = document.getElementById("starView");
const endText = document.getElementById("endText");

const orders = [
  {
    name: "Milk Tea Fragola",
    request: "Vuole ghiaccio medio e perle nere.",
    flavor: "Fragola",
    flavors: ["Fragola", "Mango", "Matcha"],
    topping: "Perle nere",
    toppings: ["Perle nere", "Lychee", "Pudding"]
  },
  {
    name: "Tè Verde Matcha",
    request: "Poco ghiaccio e lychee.",
    flavor: "Matcha",
    flavors: ["Fragola", "Matcha", "Taro"],
    topping: "Lychee",
    toppings: ["Perle nere", "Lychee", "Pudding"]
  },
  {
    name: "Milk Tea Taro",
    request: "Ghiaccio normale e pudding.",
    flavor: "Taro",
    flavors: ["Taro", "Mango", "Fragola"],
    topping: "Pudding",
    toppings: ["Lychee", "Pudding", "Perle nere"]
  }
];

let currentOrder = null;
let currentStep = 1;
let stars = 0;
let stepStars = 0;
let iceInterval = null;
let iceWidth = 0;
let iceSpeed = 2;
let shakeCount = 0;
const SHAKE_GOAL = 12;

function showScreen(screen) {
  [startScreen, gameScreen, endScreen].forEach(s => s.classList.remove("active"));
  screen.classList.add("active");
}

function setFeedback(text, type) {
  feedback.textContent = text;
  feedback.className = `feedback ${type}`;
}

function renderOrder() {
  const order = orders[Math.floor(Math.random() * orders.length)];
  currentOrder = order;
  orderName.textContent = order.name;
  orderRequest.textContent = order.request;
}

function goToStep(step) {
  document.querySelectorAll(".step-card").forEach(c => c.classList.remove("active-step"));
  const el = document.getElementById("step" + step);
  if (el) el.classList.add("active-step");
  currentStep = step;
  stepLabel.textContent = step;
  nextBtn.disabled = true;

  if (step === 1) {
    renderFlavors();
    setFeedback("Scegli il gusto giusto per questo ordine.", "neutral");
  } else if (step === 2) {
    startIceMeter();
    setFeedback("Ferma la barra nella zona verde!", "neutral");
  } else if (step === 3) {
    renderToppings();
    setFeedback("Scegli il topping richiesto.", "neutral");
  } else if (step === 4) {
    shakeCount = 0;
    shakeCountEl.textContent = `Shake: 0 / ${SHAKE_GOAL}`;
    cup.classList.remove("shaking");
    setFeedback("Clicca Shake! fino a 12 volte.", "neutral");
  }
}

function renderFlavors() {
  flavorChoices.innerHTML = "";
  currentOrder.flavors.forEach(name => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = name;
    btn.addEventListener("click", () => {
      document.querySelectorAll("#flavorChoices .choice-btn").forEach(b => b.classList.remove("correct", "wrong"));
      if (name === currentOrder.flavor) {
        btn.classList.add("correct");
        stepStars += 1;
        setFeedback("Gusto perfetto!", "good");
      } else {
        btn.classList.add("wrong");
        setFeedback("Questo ordine vuole un altro gusto.", "bad");
      }
      nextBtn.disabled = false;
    });
    flavorChoices.appendChild(btn);
  });
}

function startIceMeter() {
  iceWidth = 0;
  iceBar.style.width = "0%";
  if (iceInterval) clearInterval(iceInterval);
  iceInterval = setInterval(() => {
    iceWidth += iceSpeed;
    if (iceWidth >= 100) iceWidth = 0;
    iceBar.style.width = iceWidth + "%";
  }, 50);
}

function stopIceMeter() {
  if (!iceInterval) return;
  clearInterval(iceInterval);
  iceInterval = null;
  const zoneStart = 39;
  const zoneEnd = 61;
  if (iceWidth >= zoneStart && iceWidth <= zoneEnd) {
    stepStars += 1;
    setFeedback("Ghiaccio perfetto!", "good");
  } else {
    setFeedback("La barra doveva fermarsi nella zona verde.", "bad");
  }
  nextBtn.disabled = false;
}

function renderToppings() {
  toppingChoices.innerHTML = "";
  currentOrder.toppings.forEach(name => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = name;
    btn.addEventListener("click", () => {
      document.querySelectorAll("#toppingChoices .choice-btn").forEach(b => b.classList.remove("correct", "wrong"));
      if (name === currentOrder.topping) {
        btn.classList.add("correct");
        stepStars += 1;
        setFeedback("Topping giusto!", "good");
      } else {
        btn.classList.add("wrong");
        setFeedback("L'ordine chiede un altro topping.", "bad");
      }
      nextBtn.disabled = false;
    });
    toppingChoices.appendChild(btn);
  });
}

function doShake() {
  shakeCount++;
  shakeCountEl.textContent = `Shake: ${shakeCount} / ${SHAKE_GOAL}`;
  cup.classList.add("shaking");
  setTimeout(() => cup.classList.remove("shaking"), 150);
  if (shakeCount >= SHAKE_GOAL) {
    stepStars += 1;
    setFeedback("Shake completato! Clicca Avanti.", "good");
    nextBtn.disabled = false;
  }
}

function nextStep() {
  if (currentStep < 4) {
    goToStep(currentStep + 1);
  } else {
    stars = stepStars;
    scoreLabel.textContent = stars;
    endGame();
  }
}

function endGame() {
  showScreen(endScreen);
  if (stars >= 10) {
    endTitle.textContent = "Carinissimo!";
    starView.textContent = "⭐ ⭐ ⭐";
    endText.textContent = "Hai preparato bubble tea deliziosi. I clienti sono felicissimi!";
  } else if (stars >= 6) {
    endTitle.textContent = "Brava!";
    starView.textContent = "⭐ ⭐";
    endText.textContent = "Ottimo lavoro. Ancora un po' di pratica e sarai perfetta.";
  } else {
    endTitle.textContent = "Continua a provare!";
    starView.textContent = "⭐";
    endText.textContent = "I primi ordini sono i più difficili. Rigioca per migliorare.";
  }
}

function startGame() {
  currentStep = 1;
  stars = 0;
  stepStars = 0;
  scoreLabel.textContent = "0";
  renderOrder();
  goToStep(1);
  showScreen(gameScreen);
}

function restartGame() {
  showScreen(startScreen);
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);
nextBtn.addEventListener("click", nextStep);
stopIceBtn.addEventListener("click", stopIceMeter);
shakeBtn.addEventListener("click", doShake);
