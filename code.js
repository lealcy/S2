"use strict";
const s2 = new S2.S2(document.querySelector("canvas"));

class Bouncer extends S2.Entity {
    constructor(x, y, spriteNormal, spriteInverted, velocity) {
        super(x, y);
        this.spriteNormal = spriteNormal;
        this.spriteInverted = spriteInverted;
        this.renderer = new S2.SpriteRenderer(this.spriteNormal);
        this.velocity = velocity;
        this.vector = new S2.Vector(this.velocity, this.velocity);
    }

    update() {
        if (this.transform.position.x < 0) {
            this.vector.x = this.velocity;
            this.renderer.sprite = this.spriteNormal;
        }
        if (this.transform.position.x + this.renderer.sprite.width > s2.width) {
            this.vector.x = -this.velocity;
            this.renderer.sprite = this.spriteInverted;
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

//s2.backgroundColor = "#06d";
const dvdLogo = new S2.Sprite("images/dvdlogogold.png");
//const narwhal = new S2.Sprite("images/narwhal.png");
//const narwhalInverted = new S2.Sprite("images/narwhal_inverted.png");
s2.addEntity(new Bouncer(0, 0, dvdLogo, dvdLogo, 3));
//s2.addEntity(new Bouncer(512, 512, narwhal, narwhalInverted, 6));

s2.run();