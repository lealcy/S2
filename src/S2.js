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
            throw new Error("S2.S2 can only be initialized one time. If you want to change the canvas, use S2.instance.attachToCanvas(canvasEl) instead.");
        }
        if (!(canvasEl instanceof HTMLCanvasElement)) {
            throw new Error("S2.S2.contructor canvasEl parameter must be an instance of HTMLCanvasElement.");
        }
        S2._instance = this;
        this._canvas = null;
        this._context = null;
        this._running = false;
        this._frameCount = 0;
        this._timestamp = 0;
        this._clearEveryFrame = true;
        this._backgroundColor = null;
        this._input = null;
        this._scene = new S2.Entity(0, 0);
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

    get backgroundColor() {
        return this._backgroundColor;
    }

    set backgroundColor(value) {
        this._backgroundColor = value;
    }

    get input() {
        return this._input;
    }

    get scene() {
        return this._scene;
    }

    set scene(value) {
        if (!(entity instanceof S2.Entity)) {
            throw new Error("S2.S2.scene value must be an instance of S2.Entity.");
        }
    }

    attachToCanvas(canvasEl) {
        this._canvas = canvasEl;
        this._context = canvasEl.getContext("2d", { alpha: false });
        window.removeEventListener("resize", this._windowResizeListener.bind(this), false);
        window.addEventListener("resize", this._windowResizeListener.bind(this), false);
        this._windowResizeListener();
        this._input = new S2.Input();
    }

    _windowResizeListener(e) {
        this._canvas.width = window.innerWidth;
        this._canvas.height = window.innerHeight;
    }

    run() {
        if (this._running) {
            return;
        }
        this._running = true;
        this._animationFrame(0);
    }

    requestFullscreen() {
        (this._canvas.requestFullscreen && this._canvas.requestFullscreen()) ||
            (this._canvas.webkitRequestFullscreen && this._canvas.webkitRequestFullscreen()) ||
            (this._canvas.mozRequestFullScreen && this._canvas.mozRequestFullScreen()) ||
            (this._canvas.msRequestFullscreen && this._canvas.msRequestFullscreen());
    }

    _animationFrame(timestamp) {
        if (!this._running) {
            return;
        }
        window.requestAnimationFrame(this._animationFrame.bind(this));
        this._timestamp = timestamp;
        this._frameCount++;

        if (!this._backgroundColor) {
            this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
        } else {
            this._context.save();
            this._context.fillStyle = this._backgroundColor;
            this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
            this._context.restore();
        }
        this._scene.update();
        this._scene._animationFrame();
        this._input._animationFrame();

    }

    stop() {
        this._running = false;
    }

}

S2.Entity = class {
    constructor(x, y, renderer) {
        this._transform = new S2.Transform();
        this._animate = new S2.Animate(this);
        this._transform.position.x = x || 0;
        this._transform.position.y = y || 0;
        this._renderer = renderer || null;
        if (this._renderer && !(this._renderer instanceof S2.Renderer)) {
            throw new Error("S2.Entity.contructor renderer parameter must be an instance of S2.Renderer class.");
        }
        this._entities = [];
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

    get animate() {
        return this._animate;
    }

    set animate(value) {
        if (!(value instanceof S2.Animate)) {
            throw new Error("S2.Entity.animate value must be an instance of S2.Animate.");
        }
        this._animate = value;
    }

    get renderer() {
        return this._renderer;
    }

    set renderer(value) {
        if (!(value instanceof S2.Renderer)) {
            throw new Error("S2.Entity.renderer new value must be an instance of S2.Renderer class.");
        }
        this._renderer = value;
    }

    spawn(entity, layer) {
        if (!(entity instanceof S2.Entity)) {
            throw new Error("S2.Entity.spawn entity parameter must be an instance of S2.Entity");
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

    update() { } // Can be overloaded.

    _animationFrame() {
        this._animate._animationFrame();
        this._transform.begin();
        if (this._renderer) {
            this._renderer.draw();
        }
        this._entities.forEach(layer => {
            layer.forEach(entity => {
                entity.update();
                entity._animationFrame();
            });
        });
        this._transform.end();
    }
}

S2.Renderer = class {
    get width() {
        throw new Error("S2.Renderer.width getter not implemented.")
    }

    get height() {
        throw new Error("S2.Renderer.height getter not implemented.")
    }

    draw() {
        throw new Error("S2.Renderer.draw() method not implemented.")
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
            throw new Error("S2.Transform.position value must be an instance of S2.Vector.");
        }
        this._position = value;
    }

    get scale() {
        return this._scale;
    }

    set scale(value) {
        if (!(value instanceof S2.Vector)) {
            throw new Error("S2.Transform.scale value must be an instance of S2.Vector.");
        }
        this._scale = value;
    }
}

S2.Animate = class {
    constructor(entity) {
        this._entity = entity;
        this._animators = [];
    }

    add(animator) {
        if (!(animator instanceof S2.Animator)) {
            throw new Error("S2.Animate.add animator parameter value must be an instance of S2.Animator.");
        }
        this._animators.push(animator);
        return animator;
    }

    fall(threshold, velocity) {
        const animator = new S2.Animator(this._entity, (entity, animator) => {
            if (threshold >= entity.transform.position.y) {
                entity.transform.position.y += velocity;
            } else {
                animator.cancel();
            }
        });
        this._animators.push(animator);
        return animator;
    }

    bounceBox(x, y, width, height, velocity) {
        if (!(velocity instanceof S2.Vector)) {
            throw new Error("S2.Animate.bounceBox velocity parameter value must be an instance of S2.Vector.");
        }
        let vector = velocity.copy();
        const animator = new S2.Animator(this._entity, (entity, animation) => {
            if (entity.transform.position.x < x) {
                vector.x = velocity.x;
            }
            if (entity.transform.position.x + entity.renderer.width > width) {
                vector.x = -velocity.x;
            }
            if (entity.transform.position.y < y) {
                vector.y = velocity.y;
            }
            if (entity.transform.position.y + entity.renderer.height > height) {
                vector.y = -velocity.y;
            }
            entity.transform.position.add(vector);
        });
        this._animators.push(animator);
        return animator;
    }

    _animationFrame() {
        this._animators.forEach(animator => animator._animationFrame());
        this._animators = this._animators.filter(v => v._complete === false);
    }
}

S2.Animator = class {
    constructor(entity, fn) {
        this._complete = false;
        this._entity = entity
        this._fn = fn;
    }

    _animationFrame() {
        if (!this._complete) {
            this._fn(this._entity, this);
        }
    }

    cancel() {
        this._complete = true;
    }
}

S2.Vector = class {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    copy() {
        return new S2.Vector(this.x, this.y);
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
    }
}

S2.SpriteRenderer = class extends S2.Renderer {
    constructor(sprite) {
        super();
        if (!(sprite instanceof S2.Sprite)) {
            throw new Error("S2.SpriteRenderer.constructor sprite paramenter must be an instance of S2.Sprite.");
        }
        this._sprite = sprite;
    }

    get sprite() {
        return this._sprite;
    }

    set sprite(value) {
        if (!(value instanceof S2.Sprite)) {
            throw new Error("S2.SpriteRenderer.sprite value must be an instance of S2.Sprite.");
        }
        this._sprite = value;
    }

    get width() {
        if (!this._sprite) {
            throw new Error("Sprite not defined");
        }
        return this._sprite.width;
    }

    get height() {
        return this.sprite.height;
    }

    draw() {
        if (this._sprite.loaded) {
            S2.instance.context.drawImage(this._sprite.image, 0, 0);
        }
    }
}

S2.Sprite = class {
    constructor(src) {
        this._src = src;
        this._img = new Image();
        this._isLoaded = false;
        this._img.onload = e => {
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

}

S2.Input = class {
    constructor() {
        this._keys = {};
        let canvas = S2.instance.canvas;
        canvas.tabIndex = 0;
        canvas.focus();
        canvas.addEventListener("keydown", this._keydownListener.bind(this), true);
        canvas.addEventListener("keyup", this._keyupListener.bind(this), true);

    }

    _animationFrame() {
        this._keys = {};
    }

    keyDown(key, altKey, ctrlKey, shiftKey, metaKey) {
        const e = this._keys[key];
        return e !== undefined && e.type === "keydown" && e.altKey === !!altKey
            && e.ctrlKey === !!ctrlKey && e.shiftKey === !!shiftKey && e.metaKey === !!metaKey;
    }

    keyUp(key, altKey, ctrlKey, shiftKey, metaKey) {
        const e = this._keys[key];
        return e === undefined || (e.type === "keyup" && e.altKey === !!altKey
            && e.ctrlKey === !!ctrlKey && e.shiftKey === !!shiftKey && e.metaKey === !!metaKey);
    }

    keyPressed(key, altKey, ctrlKey, shiftKey, metaKey) {
        const e = this._keys[key];
        return e !== undefined && e.type === "keydown" && e.repeat === false && e.altKey === !!altKey
            && e.ctrlKey === !!ctrlKey && e.shiftKey === !!shiftKey && e.metaKey === !!metaKey;
    }

    keyReleased(key, altKey, ctrlKey, shiftKey, metaKey) {
        const e = this._keys[key];
        return e !== undefined && e.type === "keyup" && e.altKey === !!altKey
            && e.ctrlKey === !!ctrlKey && e.shiftKey === !!shiftKey && e.metaKey === !!metaKey;
    }

    _keydownListener(e) {
        //console.log(e);
        this._keys[e.key] = e;
    }

    _keyupListener(e) {
        this._keys[e.key] = e;
    }

}