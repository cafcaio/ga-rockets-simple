let population;
let lifespan;
let counter;
let numberOfRockets;
let target;
let mutationRate;
let matingPoolSize;
let obstacle;
let obstaclePosition;
let maxForce;
let genP;
let countP;


function setup() {

  createCanvas(500, 500);
  lifespan = 200;
  matingPoolSize = 20000;
  numberOfRockets = 30;
  mutationRate = 0.02;
  maxForce = 0.25;
  population = new Population(numberOfRockets, lifespan);
  obstaclePosition = createVector(0.5 * width, 0.5 * height);
  obstacle = new Obstacle(obstaclePosition, 200, 15);
  target = createVector(0.5 * width, 0.15 * height);
  genP = createP();
  countP = createP();



  counter = 0;
  generations = 1;


}



function draw() {


  background(0);
  fill(255);
  ellipse(target.x, target.y, 20, 20);

  obstacle.show();
  population.run();

  countP.html("Generations: " + generations);
  genP.html("Count: " + counter);



  counter++;
  if (counter == lifespan) {
    population.evaluatePop(target, matingPoolSize);
    population.crossoverPop();
    population.mutatePop(mutationRate);


    population.resetPop();
    counter = 0;
    generations++;
  }



}
