"use strict";
const s2 = new S2.S2(document.querySelector("canvas"));

class DvdLogo extends S2.Entity {
    constructor(x, y) {
        super(x, y);
        const logo = new S2.Sprite("images/dvdlogogold.png");
        this.renderer = new S2.SpriteRenderer(logo);
        this.bounceAnimation = this.animate.bounceBox(0, 0, s2.width, s2.height, new S2.Vector(3, 3));
    }

    // Control the logo with the arrow keys
    update() {
        if (s2.input.keyDown("ArrowUp")) {
            this.animate.slide(new S2.Vector(0, -1), 10, 30);
        }
        if (s2.input.keyDown("ArrowRight")) {
            this.animate.slide(new S2.Vector(1, 0), 10, 30);
        }
        if (s2.input.keyDown("ArrowDown")) {
            this.animate.slide(new S2.Vector(0, 1), 10, 30);
        }
        if (s2.input.keyDown("ArrowLeft")) {
            this.animate.slide(new S2.Vector(-1, 0), 10, 30);
        }
    }

    // Adjuste the bouncing in case the browser window is resized
    canvasResized() {
        this.animate.delete(this.bounceAnimation);
        this.bounceAnimation = this.animate.bounceBox(0, 0, s2.width, s2.height, new S2.Vector(3, 3));

    }
}

s2.scene.spawn(new DvdLogo(10, 10));

