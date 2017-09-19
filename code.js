"use strict";
const s2 = new S2.S2(document.querySelector("canvas"));

class Narwhal extends S2.Entity {
    constructor(x, y) {
        super(x, y);
        this.narwhalImage = new S2.Sprite("images/narwhal.png");
        this.narwhalImageInverted = new S2.Sprite("images/narwhal_inverted.png");
        this.renderer = new S2.SpriteRenderer(this.narwhalImage);
        this.velocity = 6;
        this.vector = new S2.Vector(this.velocity, this.velocity);
    }

    update() {
        if (this.transform.position.x < 0) {
            this.vector.x = this.velocity;
            this.renderer.sprite = this.narwhalImage;
        }
        if (this.transform.position.x + this.renderer.sprite.width > s2.width) {
            this.vector.x = -this.velocity;
            this.renderer.sprite = this.narwhalImageInverted;
        }
        if (this.transform.position.y < 0) {
            this.vector.y = this.velocity;
        }
        if (this.transform.position.y + this.renderer.sprite.height > s2.height) {
            this.vector.y = -this.velocity;
        }
        this.transform.position.add(this.vector);
    }
}

s2.backgroundColor = "#06d";
s2.addEntity(new Narwhal(0, 0));
s2.addEntity(new Narwhal(512, 512));

s2.run();