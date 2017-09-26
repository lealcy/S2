"use strict";
const s2 = new S2.S2(document.querySelector("canvas"));

class DvdLogo extends S2.Entity {
    constructor(x, y) {
        super(x, y);
        const logo = new S2.Sprite("images/dvdlogogold.png");
        this.renderer = new S2.SpriteRenderer(logo);
        this.animate.bounceBox(0, 0, s2.width, s2.height, new S2.Vector(3, 3));
    }
}

s2.scene.spawn(new DvdLogo(10, 10));

//setInterval(() => s2.scene.spawn(new DvdLogo(10, 10)), 1000);