let p;
let goal;
//Standard p5.js starts with a setup, where "preprocessing" begins
function setup() {
    createCanvas(800, 800);
    background(0);
    //Initializes a population of dots (exact number is the parameter value)
    p = new Population(1000);
    //The goal to "win" the game is for the points to hit the circle as the goal vector
    goal = createVector(400,100);
}

//Standard p5.js starts with a draw function which loops every frame
//Everything within this function will occur over in over as if it's in a loop
function draw(){
    
    if(p.checkAllDead())
    {
        p.getFitness();
        p.naturalSelection();
    } 
    else 
    {
        background(0);
        fill(255,255,0);
        ellipse(goal.x,goal.y,10,10);
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
        this.size = size;
        this.b = new Brain(this.size);
    }

    //shows the current position of the dot
    show() {
        fill(255,0,0);
        ellipse(this.pos.x,this.pos.y,5,5);
    }

    //moves the dot's position based on its acceleration, velocity, and position
    move() {
        if(this.size>this.b.step)
        {
            this.acc = this.b.directions[this.b.step];
            this.b.step++;
        }
        else {
            this.dead = true;
        }

        this.vel.add(this.acc);
        this.vel.limit(5);
        this.pos.add(this.vel);
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
        }
    }

    //Calculates how well a dot did at the game based on how close it is to the goal after the game ends
    getFitness(){
        this.distance = dist(this.pos.x,this.pos.y,goal.x,goal.y);
        this.fitness = 1/this.distance;
        return this.fitness;
    }

    //Dot reproduces for next generation
    reproduce(){
        print("TEST2");
        let baby = new dot();
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
            clone.directions[i] = directions[i];
        }
    }
};

/////////////////POPULATION CLASS///////////////////

class Population {
    constructor(size){
        this.d = new dot();
        this.size = size;
        this.fitnessSum = 0;
        this.generation = 1;
        for(let i=0;i<size;i++)
        {
            this.d[i] = new dot(400);
        }
    }

    show(){
        for(let i=0;i<this.size;i++)
        {
            this.d[i].show();
        }
    }

    update(){
        for(let i=0;i<this.size;i++)
        {
            this.d[i].update();
        }
    }

    getFitness(){
        for(let i=0;i<this.size;i++)
        {
            this.d[i].getFitness();
        }
    }

    checkAllDead(){
        for(let i=0;i<this.size;i++)
        {
            if(!this.d[i].dead)
            {
                return false;
            }
        }
        return true;
    }

    naturalSelection(){
        let d2 = new dot();
        let parent = new dot();
        this.calculateFitnessSum();
        print(this.fitnessSum);
        for(let i=0;i<this.size;i++)
        {
            //determine parents that will breed next genertation
            parent = this.determineParent();
            d2[i] = parent.reproduce();
        }

        this.d = d2.clone();
        this.generation++;
    }

    calculateFitnessSum(){
         //calculates the sum of all the dot's fitness
         for(let i=0;i<this.size;i++)
         {
             this.fitnessSum += this.d[i].getFitness();
         }
    }

    determineParent(){
        //Chooses which "parent zone" to be used (look up Code Bullet video for more details)
        let rNum = random(this.fitnessSum);
        //Picks the parent that will breed based of rNum (most likely to be higher fitness parents due to them dominating fitnessSum zone)
        let dotSum = 0;
        for(let i=0;i<this.size;i++)
        {
            //print(rNum + " " + dotSum);
            this.dotSum += this.d[i].getFitness();
            if(rNum > dotSum)
            {
                print("test3");
                return this.d[i];
            }
        }
    }
};