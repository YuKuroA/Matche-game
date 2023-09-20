class GameGrid {
  cardValues = [];
  flippedCards = [];
  machedCards = [];

  constructor(columns, rows, parent) {
    this.columns = columns;
    this.rows = rows;
    this.parent = parent;
    this.cardsTotal = this.columns * this.rows;
  }

  createCard() {
    const card = document.createElement("div");
    const cardBack = document.createElement("div");
    card.classList.add("card");
    card.onclick = this.flipCard.bind(this);
    cardBack.classList.add("back");
    cardBack.classList.add("showed");
    card.appendChild(cardBack);
    this.parent.appendChild(card);
  }

  gameEnd() {
    const endScreen = document.createElement("div");
    endScreen.innerHTML = "Congratulation!";
    endScreen.classList.add("end-screen");
    endScreen.classList.add("showed");
    endScreen.classList.add("win");
    this.parent.appendChild(endScreen);
  }

  checkCards() {
    const [card1, card2] = this.flippedCards;
    const front1 = card1.querySelector(".front").innerHTML;
    const front2 = card2.querySelector(".front").innerHTML;

    if (front1 === front2) {
      this.machedCards.push(card1, card2);
      this.flippedCards = [];
    } else {
      setTimeout(() => {
        this.toggleFlip(card1, false);
        this.toggleFlip(card2, false);
        this.flippedCards = [];
      }, 1000);
    }

    if (this.machedCards.length === this.cardsTotal) {
      this.gameEnd();
    }
  }

  toggleFlip(card, open) {
    const front = card.querySelector(".front");
    const back = card.querySelector(".back");

    if (open) {
      back.style.display = "none";
      front.style.display = "block";
    }

    if (!open) {
      front.style.display = "none";
      back.style.display = "block";
    }
  }

  flipCard(event) {
    const card = event.target.parentNode;

    if (!this.flippedCards.includes(card) && this.flippedCards.length < 2) {
      this.flippedCards.push(card);
      this.toggleFlip(card, true);

      if (this.flippedCards.length === 2) {
        this.checkCards();
      }
    }
  }

  createGrid() {
    for (let i = 0; i < this.cardsTotal; i++) {
      this.createCard();
      this.cardValues.push(i);
    }

    this.parent.style.setProperty(
      `grid-template-columns`,
      `repeat(${this.columns}, 1fr)`
    );

    this.cardValues = this.cardValues.slice(0, this.cardsTotal / 2).sort(() => {
      return Math.random() - 0.5;
    });

    this.cardValues = this.cardValues.concat(this.cardValues).sort(() => {
      return Math.random() - 0.5;
    });

    const cards = this.parent.querySelectorAll(".card");

    cards.forEach((element, index) => {
      const front = document.createElement("div");
      front.classList.add("front");
      front.classList.add("hidden");
      front.innerHTML = this.cardValues[index];
      element.appendChild(front);
    });
  }
}

const gridContainer = document.querySelector(".grid-container");
const navBar = document.querySelector("nav");
const form = navBar.querySelector("form");
const startButton = navBar.querySelector(".start");
const inputColumns = form.querySelector('input[name="columns"]');
const inputRows = form.querySelector('input[name="rows"]');
const inputTimer = form.querySelector('input[name="timer"]');
const errorMassage = navBar.querySelector(".error");

function start() {
  form.classList.remove("hidden");
  startButton.classList.add("hidden");
  gridContainer.innerHTML = "";
  inputColumns.value = "";
  inputRows.value = "";
}

function handleSubmit(event) {
  event.preventDefault();
  const columns = inputColumns.value;
  const rows = inputRows.value;
  const timer = inputTimer.value;

  if (!columns || !rows || !timer) {
    errorMassage.innerHTML = "Fill all fields to start the game!";
    errorMassage.classList.remove("hidden");
    return;
  }

  form.classList.add("hidden");
  startButton.classList.remove("hidden");

  const game = new GameGrid(columns, rows, gridContainer);

  game.createGrid();

  setTimeout(() => {
    const endScreen = document.createElement("div");
    endScreen.innerHTML = "Time is out!";
    endScreen.classList.add("end-screen");
    endScreen.classList.add("showed");
    endScreen.classList.add("loss");
    gridContainer.appendChild(endScreen);
  }, timer * 1000);
}
