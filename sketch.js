let d;
let b;

function setup() {
    createCanvas(640, 640);
    background(0);
    d = new dot();
}

function draw(){
    fill(0,0,255);
    d.update();
    clear();
    background(0);
    d.show();
}

//-----------------------------------------------------------------------------------------------------
class dot {
    constructor(){
        this.pos = createVector(width/2,height/2);
        this.vel = createVector(0,0);
        this.acc = createVector(0,0);
        this.dead = false;
        b = new Brain(400);
    }

    show() {
        fill(255,0,0);
        ellipse(this.pos.x,this.pos.y,5,5);
    }

    move() {
        if(400>b.step)
        {
            this.acc = b.directions[b.step];
            b.step++;
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
            if(this.pos.x<3 || this.pos.y<3 || this.pos.x > width - 3 || this.pos.y > height-3)
            {
                this.dead = true;
            }
        }
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