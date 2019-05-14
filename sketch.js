let p;
let goal;
let obstacles;

//Standard p5.js starts with a setup, where "preprocessing" begins
function setup() {
    createCanvas(800, 800);
    background(0);

    //Initializes a population of dots (exact number is the parameter value)
    p = new Population(1000);
    //The goal to "win" the game is for the points to hit the circle as the goal vector
    goal = createVector(400,100);

    obstacles = [[150, 200, 300, 10], [350, 400, 400, 10], [100, 600, 400, 10]];
}

//Standard p5.js starts with a draw function which loops every frame
//Everything within this function will occur over in over as if it's in a loop
function draw(){
    if(p.checkAllFinished())
    {
        p.prepareNextGeneration();
    } 
    else 
    {
        background(0);

        fill(255,255,0);
        ellipse(goal.x,goal.y,10,10);

        fill(128, 128, 128);
        obstacles.forEach(obs => rect(obs[0], obs[1], obs[2], obs[3]));

        //updates the position of every dot and shows it on the canvas
        p.update();
        p.show();
    }
}


/////////////////DOT CLASS///////////////////

class dot {
    constructor(size){
        this.pos = createVector(width/2,height-15);
        this.vel = createVector(0,0);
        this.acc = createVector(0,0);
        this.dead = false;
        this.success = false;
        this.fitness = 0.0;
        this.isBest = false;
        this.size = size;
        this.b = new Brain(this.size);
    }

    //shows the current position of the dot
    show() {
        if(this.isBest) {
            fill(0, 255, 0);
            ellipse(this.pos.x, this.pos.y, 8, 8);
        }else{
            fill(255, 0, 0);
            ellipse(this.pos.x, this.pos.y, 5, 5);
        }
    }

    //moves the dot's position based on its acceleration, velocity, and position
    move() {
        if(this.size>this.b.step) {
            this.acc = this.b.directions[this.b.step];
            this.b.step++;

            this.vel.add(this.acc);
            this.vel.limit(5);
            this.pos.add(this.vel);
        }
        else {
            this.dead = true;
        }
    }

    //determines if the dot has hit a wall or hit objective and calls the move function
    update() {
        if(!this.dead && !this.success)
        {
            this.move();
            if(this.pos.x<4 || this.pos.y<4 || this.pos.x > width - 4 || this.pos.y > height-4)
            {
                this.dead = true;
            }
            else if (dist(this.pos.x,this.pos.y,goal.x,goal.y)<7)
            {
                this.success = true;
            }
            else {
                obstacles.forEach(obs => {
                    let hit = collidePointRect(this.pos.x, this.pos.y, obs[0], obs[1], obs[2], obs[3]);
                    if (hit) this.dead = true;
                });
            }
        }
    }

    //Calculates how well a dot did at the game based on how close it is to the goal after the game ends
    getFitness(){
        if (this.success) {
            //note: max. fitness should be > 1/7
            this.fitness = 1.0 / 16.0 + 10000.0 / (float)(this.b.step * this.b.step);
        }
        else {
            //note: max. fitness < 1/7, see update()
            this.distance = dist(this.pos.x, this.pos.y, goal.x, goal.y);
            this.fitness = 1.0 / this.distance;
        }
        return this.fitness;
    }

    //Dot reproduces for next generation
    reproduce() {
        let baby = new dot(this.size);
        baby.b = this.b.clone();
        return baby;
    }
}

/////////////////BRAIN CLASS///////////////////

class Brain {
    constructor(size){
        this.directions = createVector(size);
        this.step = 0;
        this.size = size;
        this.randoming();
    }

    //generates random directions for each dot at generation 1
    randoming(){
        for(let i=0;i<this.size;i++)
        {
            let randomAngle = random(2*PI);
            this.directions[i] = p5.Vector.fromAngle(randomAngle);
        }
    }

    //clones the directions of the parent to the reproduced baby
    clone(){
        let clone = new Brain(this.size);
        for(let i=0;i<this.size;i++)
        {
            clone.directions[i] = this.directions[i].copy();
        }
        return clone;
    }

    //mutates the directions, e.g. in 1% rate
    mutate(){
        let mutationRate = 0.01;
        for (let i = 0; i < this.size; i++){
            let rand = random(1);
            if (rand < mutationRate){
                //set this direction as a random direction
                let randomAngle = random(2 * PI);
                this.directions[i] = p5.Vector.fromAngle(randomAngle);
            }
        }
    }
};

/////////////////POPULATION CLASS///////////////////

class Population {
    constructor(size){
        this.d = new dot();
        this.size = size;
        this.fitnessSum = 0.0;
        this.bestFitness = 0.0;
        this.generation = 1;
        this.bestDot = 0;
        this.minStep = 500;
        for(let i=0;i<size;i++)
        {
            this.d[i] = new dot(this.minStep);
        }
    }

    show(){
        for(let i=0;i<this.size;i++)
        {
            this.d[i].show();
        }
        //draw best as last
        this.d[this.bestDot].show();

        //draw info
        textSize(24);
        fill(128, 128, 128);
        text('best fitness: ' + this.bestFitness.toPrecision(4), 10, 30);
        text('best steps: ' + this.minStep, 10, 60);
        text('generation: ' + this.generation, 10, 90);
    }

    update(){
        for(let i=0;i<this.size;i++)
        {
            if (this.d[i].b.step > this.minStep) {
                //dead by age to best
                this.d[i].dead = true;
            }
            this.d[i].update();
        }
    }

    checkAllFinished(){
        for(let i=0;i<this.size;i++)
        {
            if(!this.d[i].dead && !this.d[i].success)
            {
                return false;
            }
        }
        return true;
    }

    naturalSelection(){
        let d2 = new dot();
        //preserve the best parent to next generation
        d2[0] = this.d[this.bestDot].reproduce();
        d2[0].isBest = true;
        for(let i=1;i<this.size;i++)
        {
            //determine parents that will breed next generation
            let parent = this.determineParent();
            d2[i] = parent.reproduce();
        }
        this.d = d2;
        this.generation++;
    }

    calculateFitnessSum(){
        //calculates the sum of all the dot's fitness
        this.fitnessSum = 0;
        for(let i=0;i<this.size;i++)
        {
            this.fitnessSum += this.d[i].getFitness();
        }
        this.setBestDot();
        print(this.fitnessSum);
    }

    setBestDot() {
        let max = 0.0;
        let maxIndex = 0;
        for (let i = 0; i < this.size; i++) {
            if (this.d[i].fitness > max) {
                max = this.d[i].fitness
                maxIndex = i;
            }
        }
        this.bestDot = maxIndex;
        this.bestFitness = max;

        if (this.d[maxIndex].success) {
            this.minStep = this.d[maxIndex].b.step;
        }
    }

    determineParent(){
        //Chooses which "parent zone" to be used (look up Code Bullet video for more details)
        let rNum = random(this.fitnessSum);
        //Picks the parent that will breed based of rNum (most likely to be higher fitness parents due to them dominating fitnessSum zone)
        let dotSum = 0;
        for(let i=0;i<this.size;i++)
        {
            this.dotSum += this.d[i].getFitness();
            if(rNum > dotSum)
            {
                return this.d[i];
            }
        }
    }

    mutateChildren() {
        //note: don't mutate the best dot at zero index
        for (let i = 1; i < this.size; i++) {
            this.d[i].b.mutate();
        }
    }

    prepareNextGeneration() {
        this.calculateFitnessSum();
        this.naturalSelection();
        this.mutateChildren();
    }
};