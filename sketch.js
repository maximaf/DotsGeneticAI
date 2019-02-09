let p;
function setup() {
    createCanvas(640, 640);
    background(0);
    p = new Population(100);
}

function draw(){
    background(0);
    p.update();
    p.show();
}

//-----------------------------------------------------------------------------------------------------
class dot {
    constructor(size){
        this.pos = createVector(width/2,height/2);
        this.vel = createVector(0,0);
        this.acc = createVector(0,0);
        this.dead = false;
        this.size = size;
        this.b = new Brain(this.size);
    }

    show() {
        fill(255,0,0);
        ellipse(this.pos.x,this.pos.y,5,5);
    }

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

    update() {
        if(!this.dead)
        {
            this.move();
            if(this.pos.x<4 || this.pos.y<4 || this.pos.x > width - 4 || this.pos.y > height-4)
            {
                this.dead = true; 
            }
        }
        return this.dead;
    }
}

//----------------------------------------------------------------------------------------------------------------

class Brain {
    constructor(size){
        this.directions = createVector(size);
        this.step = 0;
        this.size = size;
        this.randoming();
    }

    randoming(){

        for(this.i=0;this.i<this.size;this.i++)
        {
            let randomAngle = random(2*PI);
            this.directions[this.i] = p5.Vector.fromAngle(randomAngle);
        }
    }
};

//-------------------------------------------------------------------------------

class Population {
    constructor(size){
        this.d = new dot();
        this.size = size;
        for(this.i=0;this.i<size;this.i++)
        {
            this.d[this.i] = new dot(400);
        }
    }

    show(){
        for(this.i=0;this.i<this.size;this.i++)
        {
            this.d[this.i].show();
        }
    }

    update(){
        for(this.i=0;this.i<this.size;this.i++)
        {
            this.d[this.i].update();
        }
    }
};