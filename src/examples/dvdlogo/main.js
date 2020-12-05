"use strict";

class DvdLogo extends S2.Entity {
    constructor(x, y) {
        super(x, y);
        const logo = new S2.Sprite("images/dvdlogogold.png");
        this.renderer = new S2.SpriteRenderer(logo);
        this.bounceAnimation = this.animate.bounceBox(0, 0, S2.width, S2.height, new S2.Vector(3, 3));
    }

    // Control the logo with the arrow keys
    update() {
        if (S2.Input.keyDown("ArrowUp")) {
            this.animate.slide(S2.Vector.Up, 10, 30);
        }
        if (S2.Input.keyDown("ArrowRight")) {
            this.animate.slide(S2.Vector.Right, 10, 30);
        }
        if (S2.Input.keyDown("ArrowDown")) {
            this.animate.slide(S2.Vector.Down, 10, 30);
        }
        if (S2.Input.keyDown("ArrowLeft")) {
            this.animate.slide(S2.Vector.Left, 10, 30);
        }
    }

    // Adjuste the bouncing in case the browser window is resized
    canvasResized() {
        this.animate.delete(this.bounceAnimation);
        this.bounceAnimation = this.animate.bounceBox(0, 0, S2.width, S2.height, new S2.Vector(3, 3));

    }
}

S2.attachToCanvas(document.querySelector("canvas"));
S2.scene.spawn(new DvdLogo(10, 10));

