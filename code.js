"use strict";
const s2 = new S2.S2(document.querySelector("canvas"));

class Narwhal extends S2.Entity {
    constructor(x, y) {
        super(x, y, new S2.Sprite("images/narwhal.png"));
        this.vector = new S2.Vector(1, 1);
        this.velocity = 1;
        this.transform.scale.x = -1;
        this.transform.position.x += this.sprite.width;
    }

    update() {
        if (this.transform.position.x < 0) {
            this.vector.x = this.velocity;
            // Flip the image horizontally
            this.transform.scale.x = -1;
            this.transform.position.x += this.sprite.width;
        }
        if (this.transform.position.x > s2.width) {
            this.vector.x = -this.velocity;
            this.transform.scale.x = 1;
            this.transform.position.x -= this.sprite.width;
        }
        if (this.transform.position.y < 0) {
            this.vector.y = this.velocity;
        }
        if (this.transform.position.y + this.sprite.height > s2.height) {
            this.vector.y = -this.velocity;
        }
        this.transform.position.add(this.vector);
    }
}

s2.addEntity(new Narwhal(0, 0));

s2.run();