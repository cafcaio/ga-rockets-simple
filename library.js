class Obstacle {
  constructor(centerPosition, length, height) {
    this.centerPosition = createVector(centerPosition.x, centerPosition.y);
    this.length = length;
    this.height = height;
  }

  show() {
    push();
    rectMode(CENTER);
    fill(255);
    translate(this.centerPosition.x, this.centerPosition.y);
    rect(0, 0, this.length, this.height);
    pop();
  }

  hasCrashed(positionVector) {
    let x = positionVector.x;
    let y = positionVector.y;
    let rectX = this.centerPosition.x - this.length / 2; //base positions
    let rectY = this.centerPosition.y - this.height / 2;
    if ((x > rectX) && (x < rectX + this.length) && (y > rectY) && (y < rectY + this.height)) {
      return true;
    }
    return false;
  }
}


class Rocket {
  constructor(argument) {
    this.position = createVector(width / 2, height);
    this.velocity = createVector();
    this.acceleration = createVector();
    this.count = 0;
    this.finished = false;
    this.crashed = false;

    if (typeof(argument) == "number") { //argument is a size, dna built randomly
      this.dna = new DNA(argument);
    }

  }

  setDNA(dna) {
    this.dna = dna;
  }
  evaluate(target) {
    let d = dist(this.position.x, this.position.y, target.x, target.y);
    this.fitness = 1 / d ** 2;
    if (this.finished) {
      this.fitness *= 10;
    }
    if (this.crashed) {
      this.fitness /= 10;
    }
  }


  reset() {
    this.position = createVector(width / 2, height);
    this.velocity = createVector();
    this.acceleration = createVector();
    this.count = 0;
    this.finished = false;
    this.crashed = false;
  }

  applyForce(force) {
    this.acceleration.add(force);

    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);

  }

  update() {
    let distToTarget = dist(target.x, target.y, this.position.x, this.position.y);
    if (distToTarget < 20) {
      this.finished = true;
    } else if (obstacle.hasCrashed(this.position) || this.hasCrashedOnWindow()) {
      this.crashed = true;
    } else {
      this.applyForce(this.dna.genes[this.count]);
      this.count++;
    }

  }

  show() {
    push();
    rectMode(CENTER);
    translate(this.position.x, this.position.y);
    rotate(this.velocity.heading());

    if (this.crashed) {
      fill(255, 0, 0, 150);
    } else if (this.finished){
      fill(0, 255, 0, 150);
    } else {
      fill(255, 150);
    }
    rect(0, 0, 25, 5);
    pop();
  }


  hasCrashedOnWindow() {
    if(this.position.x < 0 || this.position.x > width || this.position.y < 0 || this.position.y > height){
      return true;
    }
    return false;
  }
}

class DNA {
  constructor(argument) {
    if (typeof(argument) == "number") {
      this.length = argument;
      this.genes = [];
      for (let i = 0; i < this.length; i++) {
        this.genes.push(p5.Vector.random2D().setMag(maxForce));
      }
    } else {
      this.genes = [];
      arrayCopy(argument, this.genes);
      this.length = this.genes.length;
    }
  }

  static crossover(dna1, dna2) {
    let midpoint = floor(random(dna1.length));
    let childGenes = [];
    for (let i = 0; i < dna1.length; i++) {
      if (i < midpoint) {
        childGenes.push(dna1.genes[i]);
      } else {
        childGenes.push(dna2.genes[i]);
      }
    }
    let child = new DNA(childGenes);
    return child;
  }

  mutate(mutationRate) {
    for (let i = 0; i < this.length; i++) {
      if (random(1) < mutationRate) {
        this.genes[i] = p5.Vector.random2D().setMag(maxForce);
      }
    }
  }
}

class Population {
  constructor(size, lifetime) {
    this.popSize = size;
    this.lifetime = lifetime;
    this.array = [];
    for (let i = 0; i < this.popSize; i++) {
      this.array.push(new Rocket(this.lifetime));
    }

    this.matingPool = [];
  }

  evaluatePop(target, matingPoolSize) {
    this.matingPool = [];
    for (let i = 0; i < this.popSize; i++) {
      this.array[i].evaluate(target);
    }
    let maxFitness = -Infinity;
    for (let i = 0; i < this.popSize; i++) {
      if (this.array[i].fitness > maxFitness) {
        maxFitness = this.array[i].fitness;
      }
    }
    while (this.matingPool.length < matingPoolSize) {
      let pick = random(this.array);
      let p = map(pick.fitness, 0, maxFitness, 0, 1);
      if (random(0, 1) < p) {
        this.matingPool.push(pick);
      }
    }
  }

  crossoverPop() {
    for (let i = 0; i < this.popSize; i++) {
      let partnerA = random(this.matingPool).dna;
      let partnerB = random(this.matingPool).dna;
      let child = DNA.crossover(partnerA, partnerB);
      this.array[i].setDNA(child);
    }
  }

  mutatePop(mutationRate) {
    for (let i = 0; i < this.popSize; i++) {
      this.array[i].dna.mutate(mutationRate);
    }
  }



  run() {
    for (let i = 0; i < this.popSize; i++) {
      this.array[i].update();
      this.array[i].show();
    }
  }

  resetPop() {
    for (let i = 0; i < this.popSize; i++) {
      this.array[i].reset();
    }
  }

}
