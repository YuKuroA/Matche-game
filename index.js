class Card {
  #card;
  #back;
  #front;
  #id = crypto.randomUUID();
  #open = false;

  constructor(height, width, value, container, openCard) {
    this.height = height;
    this.width = width;
    this.value = value;
    this.container = container;
    this.openCard = openCard;
  }

  get id() {
    return this.#id;
  }

  flip() {
    try {
      this.#open = !this.#open;

      this.#back.style.display = this.#open ? "none" : "block";
      this.#front.style.display = this.#open ? "block" : "none";
    } catch {
      return;
    }
  }

  render() {
    this.#card = document.createElement("div");
    this.#back = document.createElement("div");
    this.#front = document.createElement("div");

    this.#card.classList.add("card");
    this.#card.onclick = () => this.openCard(this);
    this.#card.style.height = this.height + "px";
    this.#card.style.width = this.width + "px";

    this.#back.classList.add("back");
    this.#back.classList.add("showed");
    this.#card.appendChild(this.#back);

    this.#front.classList.add("front");
    this.#front.classList.add("hidden");
    this.#front.innerHTML = this.value;
    this.#card.appendChild(this.#front);

    this.container.appendChild(this.#card);
  }
}

class MatchGrid {
  #cards = [];
  flippedCards = [];
  machedCards = [];

  constructor(height, width, columns, rows, container, timer, theme) {
    this.height = height;
    this.width = width;
    this.columns = columns;
    this.rows = rows;
    this.container = container;
    this.timer = timer;
    this.theme = theme;
    this.cardsTotal = this.columns * this.rows;
  }

  setContainer() {
    this.container.style.setProperty(
      `grid-template-columns`,
      `repeat(${this.columns}, 1fr)`
    );

    this.container.style.setProperty(
      "background-color",
      this.theme.backgroundColor
    );

    this.container.style.setProperty("font-size", this.theme.fontSize);
  }

  generateCards() {
    let cardValues = [];

    for (let i = 0; i < this.cardsTotal; i++) {
      cardValues.push(i);
    }

    cardValues = cardValues.slice(0, this.cardsTotal / 2).sort(() => {
      return Math.random() - 0.5;
    });

    cardValues = cardValues.concat(cardValues).sort(() => {
      return Math.random() - 0.5;
    });

    for (let i = 0; i < this.cardsTotal; i++) {
      this.#cards.push(
        new Card(
          this.height,
          this.width,
          cardValues[i],
          this.container,
          (card) => this.openCard(card)
        )
      );
    }
  }

  gameEnd(type, massage) {
    const endScreen = document.createElement("div");
    endScreen.innerHTML = massage;
    endScreen.classList.add("end-screen");
    endScreen.classList.add("showed");
    endScreen.classList.add(type);
    this.container.appendChild(endScreen);
  }

  checkCards() {
    const [card1, card2] = this.flippedCards;
    this.flippedCards = [];

    if (card1.value != card2.value) {
      setTimeout(() => {
        card1.flip();
        card2.flip();
      }, 500);

      return;
    }

    this.machedCards.push(card1, card2);

    console.log(card1, card2, this.machedCards);
    if (this.machedCards.length === this.cardsTotal) {
      this.gameEnd("win", "Congratulation!");
    }
  }

  openCard(card) {
    if (this.flippedCards.find((flippedCard) => flippedCard.id === card.id)) {
      return;
    }

    if (this.flippedCards.length < 2) {
      this.flippedCards.push(card);
      card.flip();
    }

    if (this.flippedCards.length === 2) {
      this.checkCards();
    }
  }

  render() {
    this.setContainer();
    this.generateCards();

    this.#cards.forEach((card) => card.render());

    setTimeout(() => {
      this.gameEnd("loss", "Time is out!");
    }, this.timer * 1000);
  }
}

const gridContainer = document.querySelector(".grid-container");
const navBar = document.querySelector("nav");
const form = navBar.querySelector("form");
const startButton = navBar.querySelector(".start");
const inputHeight = form.querySelector('input[name="height"]');
const inputWidth = form.querySelector('input[name="width"]');
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
  const height = inputHeight.value;
  const width = inputWidth.value;
  const columns = inputColumns.value;
  const rows = inputRows.value;
  const timer = inputTimer.value;

  if (!columns || !rows || !timer) {
    errorMassage.innerHTML = "Fill all fields to start the game!";
    errorMassage.classList.remove("hidden");
    return;
  }

  if ((columns * rows) % 2 === 1) {
    errorMassage.innerHTML = "Total number of cards should be divisible by 2";
    errorMassage.classList.remove("hidden");
    return;
  }

  form.classList.add("hidden");
  startButton.classList.remove("hidden");

  const game = new MatchGrid(
    height,
    width,
    columns,
    rows,
    gridContainer,
    timer,
    theme
  );

  game.render();
}

const theme = {
  backgroundColor: "antiquewhite",
  fontSize: "36px",
};
