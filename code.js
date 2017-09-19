"use strict";
const s2 = new S2.S2(document.querySelector("canvas"));

class Narwhal extends S2.Entity {
    constructor(x, y) {
        super(x, y);
        this.narwhalImage = new S2.Sprite("images/narwhal.png");
        this.narwhalImageInverted = new S2.Sprite("images/narwhal_inverted.png");
        this.sprite = this.narwhalImage;
        this.velocity = 6;
        this.vector = new S2.Vector(this.velocity, this.velocity);
    }

    update() {
        if (this.transform.position.x < 0) {
            this.vector.x = this.velocity;
            this.sprite = this.narwhalImage;
        }
        if (this.transform.position.x + this.sprite.width > s2.width) {
            this.vector.x = -this.velocity;
            this.sprite = this.narwhalImageInverted;
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