class Person extends GameObject {
  constructor(config) {
    super(config);
    this.movingProgressRemaining = 0;
    this.isStanding = false;
    this.intentPosition = null;
    this.isPlayerControlled = config.isPlayerControlled || false;
    this.directionUpdate = {
      up: ["y", -1],
      down: ["y", 1],
      left: ["x", -1],
      right: ["x", 1],
    };
  }

  update(state) {
    if (this.movingProgressRemaining > 0) {
      this.updatePosition();
    } else {
      if (
        !state.map.isCutscenePlaying &&
        this.isPlayerControlled &&
        state.arrow
      ) {
        this.startBehavior(state, {
          type: "walk",
          direction: state.arrow,
        });
      }
      this.updateSprite(state);
    }
  }

  startBehavior(state, behavior) {
    if (!this.isMounted) {
      return;
    }

    this.direction = behavior.direction;
    
    if (behavior.type === "walk") {
      if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {
        behavior.retry &&
          setTimeout(() => {
            this.startBehavior(state, behavior);
          }, 10);
        return;
      }

      this.movingProgressRemaining = 16;

      //fix colision not detecting while npc moving
      const intentPosition = utils.nextPosition(this.x, this.y, this.direction);
      this.intentPosition = [intentPosition.x, intentPosition.y];

      this.updateSprite(state);
    }

    if (behavior.type === "stand") {
      this.isStanding = true;
      setTimeout(() => {
        utils.emitEvent("PersonStandComplete", {
          whoId: this.id,
        });
        this.isStanding = false;
      }, behavior.time);
    }
  }

  updatePosition() {
    const [property, change] = this.directionUpdate[this.direction];
    this[property] += change;
    this.movingProgressRemaining -= 1;

    if (this.movingProgressRemaining === 0) {
      this.intentPosition = null;
      utils.emitEvent("PersonWalkingComplete", {
        whoId: this.id,
      });
    }
  }

  updateSprite() {
    if (this.movingProgressRemaining > 0) {
      this.sprite.setAnimetion("walk-" + this.direction);
      return;
    }

    this.sprite.setAnimetion("idle-" + this.direction);
  }
}
