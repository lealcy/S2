"use strict";

const S2 = {
    _instance: null,
    get instance() {
        if (!this._instance) {
            throw new Error("An instance of the S2.S2 class must be created before use of this feature.");
        }
        return this._instance;
    }
};

S2.S2 = class {
    constructor(canvasEl) {
        if (S2._instance) {
            throw new Error("S2.S2 can only be initialized one time.");
        }
        if (!(canvasEl instanceof HTMLCanvasElement)) {
            throw new Error("S2.S2: canvasEl must be an instance of HTMLCanvasElement.");
        }
        S2._instance = this;
        this._canvas = null;
        this._context = null;
        this._entities = [];
        this._running = false;
        this._frameCount = 0;
        this._timestamp = 0;
        this._clearEveryFrame = true;
        this.attachToCanvas(canvasEl);
    }

    get canvas() {
        return this._canvas;
    }

    get context() {
        return this._context;
    }

    get width() {
        return this._canvas.width;
    }

    get height() {
        return this._canvas.height;
    }

    get running() {
        return this._running;
    }

    get timestamp() {
        return this._timestamp;
    }

    get frameCount() {
        return this._frameCount;
    }

    get clearEveryFrame() {
        return this._clearEveryFrame;
    }

    set clearEveryFrame(value) {
        this._clearEveryFrame = !!value;
    }

    attachToCanvas(canvasEl) {
        this._canvas = canvasEl;
        this._context = canvasEl.getContext("2d", { alpha: false });
        window.removeEventListener("resize", this._windowResizeListener.bind(this), false);
        window.addEventListener("resize", this._windowResizeListener.bind(this), false);
        this._windowResizeListener();
    }

    _windowResizeListener(e) {
        this._canvas.width = window.innerWidth;
        this._canvas.height = window.innerHeight;
    }

    addEntity(entity, layer) {
        if (!(entity instanceof S2.Entity)) {
            throw new Error("S2.addEntity first parameter must be an instance of S2.Entity");
        }
        if (layer === undefined) {
            layer = 100;
        } else if (layer < 0) {
            layer = 0;
        }
        if (this._entities[layer] === undefined) {
            this._entities[layer] = [];
        }
        this._entities[layer].push(entity);
        return entity;
    }

    run() {
        if (this._running) {
            return;
        }
        this._running = true;
        this._animationFrame(0);
    }

    _animationFrame(timestamp) {
        if (!this._running) {
            return;
        }
        window.requestAnimationFrame(this._animationFrame.bind(this));
        this._timestamp = timestamp;
        this._frameCount++;

        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);

        this._entities.forEach(layer => {
            layer.forEach(entity => {
                entity.update();
                entity._animationFrame();
            });
        })

    }

    stop() {
        this._running = false;
    }

}

S2.Entity = class {
    constructor(x, y, sprite) {
        this._transform = new S2.Transform();
        this._transform.position.x = x || 0;
        this._transform.position.y = y || 0;
        this._sprite = sprite || null;
        if (this._sprite && !(this._sprite instanceof S2.Sprite)) {
            throw new Error("S2.Entity sprite parameter not an instance of S2.Sprite class.");
        }
    }

    get transform() {
        return this._transform;
    }

    set transform(value) {
        if (!(value instanceof S2.Transform)) {
            throw new Error("S2.Entity.transform new value must be an instance of S2.Transform class.");
        }
        this._transform = value;
    }

    get sprite() {
        return this._sprite;
    }

    set sprite(value) {
        if (!(value instanceof S2.Sprite)) {
            throw new Error("S2.Entity.sprite new value must be an instance of S2.Sprite class.");
        }
        this._sprite = value;
    }

    update() { } // Can be overloaded.

    _animationFrame() {
        this._transform.begin();
        if (this._sprite && this._sprite.loaded) {
            this.sprite.draw();
            //S2.instance.context.drawImage(this._sprite.image, 0, 0);
        }
        this._transform.end();
    }
}

S2.Transform = class {
    constructor() {
        this._position = new S2.Vector();
        this._scale = new S2.Vector(1, 1);
    }

    begin() {
        let ctx = S2.instance.context;
        ctx.save();
        ctx.translate(this._position.x, this.position.y);
        ctx.scale(this._scale.x, this._scale.y);
    }

    end() {
        S2.instance.context.restore();
    }

    get position() {
        return this._position;
    }

    set position(value) {
        if (!(value instanceof S2.Vector)) {
            throw new Error("S2.Transform.position must be an instance of S2.Vector.");
        }
        this._position = value;
    }

    get scale() {
        return this._scale;
    }

    set scale(value) {
        if (!(value instanceof S2.Vector)) {
            throw new Error("S2.Transform.scale must be an instance of S2.Vector.");
        }
        this._scale = value;
    }

}

S2.Vector = class {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
    }
}

S2.Sprite = class {
    constructor(src) {
        this._src = src;
        this._img = new Image();
        this._isLoaded = false;
        this._img.onload = e => {
            console.log("image loaded successfully");
            this._isLoaded = true;
        }
        this._img.onerror = e => {
            throw new Error(`S2.Sprite unable to load the image "${src}".`);
        }
        this._img.src = src;
    }

    get src() {
        return this._src;
    }

    get image() {
        if (this._isLoaded) {
            return this._img;
        }
    }

    get width() {
        return this._isLoaded ? this._img.width : 0;
    }

    get height() {
        return this._isLoaded ? this._img.height : 0;
    }

    get loaded() {
        return this._isLoaded;
    }

    draw(x, y) {
        x = x || 0;
        y = y || 0;
        S2.instance.context.drawImage(this._img, x, y);
    }
}