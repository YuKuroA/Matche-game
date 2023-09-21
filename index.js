const errorMassage = document.getElementById("error-message");
const form = document.getElementById("game-options-form");
const gridContainer = document.querySelector(".grid-container");
const startButton = document.getElementById("start");

let game;

function start() {
  if (game) {
    game.clear();
  }

  form.classList.remove("hidden");
  startButton.classList.add("hidden");
}

function handleSubmit(event) {
  event.preventDefault();
  
  const height = event.target.height.value;
  const width = event.target.width.value;
  const columns = event.target.columns.value;
  const rows = event.target.rows.value;
  const time = event.target.time.value;

  if (!columns || !rows || !time) {
    errorMassage.innerHTML = "Fill all fields to start the game!";
    errorMassage.classList.remove("hidden");
    return;
  }

  if (columns < 0 || rows < 0 || time < 0) {
    errorMassage.innerHTML = "All values should be positive!";
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

  game = new MatchGrid(
    height,
    width,
    columns,
    rows,
    time,
    theme
  );

  game.container = gridContainer;

  game.render();
}

const theme = {
  backgroundColor: "antiquewhite",
  fontSize: "36px",
};


class Card {
  #card;
  #back;
  #front;
  #id = crypto.randomUUID();
  #isOpen = false;
  #isFlipDisabled = false;

  constructor(height, width, value, openCard) {
    this.height = height;
    this.width = width;
    this.value = value;
    this.openCard = openCard;
  }

  get id() {
    return this.#id;
  }

  set isFlipDisabled(value) {
    this.#isFlipDisabled = value;
  }

  flip() {
    if (this.#isFlipDisabled) {
      return;
    }

    try {
      this.#isOpen = !this.#isOpen;
      this.#back.style.display = this.#isOpen ? "none" : 'flex';
      this.#front.style.display = this.#isOpen ? 'flex' : 'none';

      anime({
        targets: this.#card,
        rotateY: {
            value: this.#isOpen ? '180' : '0',
            duration: 300,
            easing: 'easeInOutSine',
        },
    });
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
    this.#card.appendChild(this.#back);

    this.#front.classList.add("front");
    this.#front.innerHTML = this.value;
    this.#card.appendChild(this.#front);

    return this.#card;
  }
}

class Timer {
  #timer;
  #timerUpdateInterval;

  constructor (time, onTimeUp) {
    this.endTime = Date.now() + time*1000;
    this.onTimeUp = onTimeUp;
  }

  clear() {
    this.#timer.remove()
  }

  convertTimeToMMSS(time) {
    const milisInSeconds =  Math.floor(time / 1000);
    const minutes = Math.floor(milisInSeconds / 60);

    return `${minutes}:${milisInSeconds % 60}`
  }

  stop() {
    clearInterval(this.#timerUpdateInterval);
  }
  
  updateTime() {
    if (this.endTime - Date.now() < 0) {
      this.onTimeUp?.();

      this.#timer.innerHTML = `00:00`;

      clearInterval(this.#timerUpdateInterval);
      return;
    }


    this.#timer.innerHTML = this.convertTimeToMMSS(this.endTime - Date.now());
  }

  render() {
    const menu = document.getElementById('menu');
    this.#timer = document.createElement("div");
    this.#timer.classList.add('timer');
    this.#timer.innerHTML = this.convertTimeToMMSS(this.endTime - Date.now());

    menu.prepend(this.#timer)

    this.#timerUpdateInterval = setInterval(this.updateTime.bind(this), 1000)
  }
}

class MatchGrid {
  #cards = [];
  #container;
  #flippedCards = [];
  #machedCards = [];
  #timer;

  constructor(cardHeight, cardWidth, columns, rows, time, theme) {
    this.cardHeight = cardHeight;
    this.cardWidth = cardWidth;
    this.columns = columns;
    this.rows = rows;
    this.theme = theme;
    this.cardsTotal = this.columns * this.rows;

    this.#timer = new Timer(time, () => this.gameEnd("loss", "Time is out!"))
  }

  set container(container) {
    this.#container = container;
  }

  checkCards() {
    const [card1, card2] = this.#flippedCards;
    this.#flippedCards = [];

    if (card1.value !== card2.value) {
      setTimeout(() => {
        card1.flip();
        card2.flip();
      }, 500)
      
      return;
    }

    card1.isFlipDisabled = true;
    card2.isFlipDisabled = true;
    
    this.#machedCards.push(card1, card2);

    if (this.#machedCards.length === this.cardsTotal) {
      this.gameEnd("win", "Congratulation!");
      this.#timer.stop();
    }
  }

  clear() {
    this.#container.innerHTML = "";
    
    // clear all related instances
    this.#timer.clear();
  }
  
  gameEnd(type, massage) {
    this.#container.innerHTML = "";

    const endScreen = document.createElement("div");
    endScreen.innerHTML = massage;
    endScreen.classList.add("end-screen");
    endScreen.classList.remove("hidden");
    endScreen.classList.add(type);
    this.#container.appendChild(endScreen);
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
      this.#cards.push(new Card(
        this.cardHeight,
        this.cardWidth,
        cardValues[i],
        (card) => this.openCard(card)
      ));
    }
  }

  openCard(card) {
    if (this.#flippedCards.find(flippedCard => flippedCard.id === card.id)) {
      return;
    }

    if (this.#machedCards.find(matchedCard => matchedCard.id === card.id)) {
      return;
    }

    if (this.#flippedCards.length < 2) {
      this.#flippedCards.push(card);
      card.flip();
    }

    if (this.#flippedCards.length === 2) {
      this.checkCards()
    }
  }
  
  setContainer() {
    this.#container.style.setProperty(
      `grid-template-columns`,
      `repeat(${this.columns}, 1fr)`
    );

    this.#container.style.setProperty(
      "background-color",
      this.theme.backgroundColor
    );

    this.#container.style.setProperty("font-size", this.theme.fontSize);
  }

  render() {
    this.setContainer();
    this.generateCards();
    
    this.#cards.forEach(card => this.#container.appendChild(card.render()));
    this.#timer.render();
  }
}