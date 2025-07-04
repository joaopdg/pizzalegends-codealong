class Hud {
  constructor() {
    this.scoreBoard = [];
  }

  update() {
    this.scoreBoard.forEach((s) => {
      s.update(window.playerState.pizzas[s.id]);
    });
  }

  createElement() {
    if (this.element) {
      this.element.remove();
      this.scoreBoard = [];
    }

    this.element = document.createElement("div");
    this.element.classList.add("Hud");

    const { playerState } = window;
    playerState.lineup.forEach((key) => {
      const pizza = playerState.pizzas[key];
      const scoreBoard = new Combatant(
        {
          id: key,
          ...Pizzas[pizza.pizzaId],
          ...pizza,
        },
        null
      );
      scoreBoard.createElement();
      this.scoreBoard.push(scoreBoard);
      this.element.appendChild(scoreBoard.hudElement);
    });

    this.update();
  }

  init(container) {
    this.createElement();
    container.appendChild(this.element);

    document.addEventListener("PlayerStateUpdated", () => {
      this.update();
    });

    document.addEventListener("LineupChanged", () => {
      this.createElement();
      container.appendChild(this.element);
    });
  }
}
