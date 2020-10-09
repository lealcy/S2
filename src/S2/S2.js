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
    constructor(canvasEl, dontRun) {
        if (S2._instance) {
            throw new Error("S2.S2 can only be instantied one time. If you want to change the canvas, use S2.instance.attachToCanvas(canvasEl) instead.");
        }
        if (!(canvasEl instanceof HTMLCanvasElement)) {
            throw new Error("S2.S2.constructor canvasEl parameter must be an instance of HTMLCanvasElement.");
        }
        S2._instance = this;
        this._canvas = null;
        this._context = null;
        this._running = false;
        this._frameCount = 0;
        this._timestamp = 0;
        this._clearEveryFrame = true;
        this._backgroundColor = "black";
        this._input = null;
        this._scene = new S2.Entity(0, 0);
        this.attachToCanvas(canvasEl);

        if (!dontRun) {
            this.run();
        }
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
        this._scene = value;
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
        this._scene._canvasResized();
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

    requestFullScreen() {
        (this._canvas.requestFullscreen && this._canvas.requestFullscreen()) ||
            (this._canvas.webkitRequestFullscreen && this._canvas.webkitRequestFullscreen()) ||
            (this._canvas.mozRequestFullScreen && this._canvas.mozRequestFullScreen()) ||
            (this._canvas.msRequestFullscreen && this._canvas.msRequestFullscreen());
    }

    _animationFrame(timestamp) {
        if (!this._running) {
            return;
        }
        requestAnimationFrame(this._animationFrame.bind(this));
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
        this._scene._update();
        this._scene._animationFrame();
        this._input._animationFrame();

    }

    stop() {
        this._running = false;
    }

}

S2.Entity = class {
    constructor(x = 0, y = 0, renderer = null) {
        this._transform = new S2.Transform();
        this._animate = new S2.Animate(this);
        this._transform.position.x = x;
        this._transform.position.y = y;
        this._renderer = renderer;
        if (this._renderer && !(this._renderer instanceof S2.Renderer)) {
            throw new Error("S2.Entity.contructor renderer parameter must be an instance of S2.Renderer class.");
        }
        this._layers = [];
        this._behaviors = new Set;
    }

    static get DefaultLayer() { return 100; }

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
            layer = S2.Entity.DefaultLayer;
        } else if (layer < 0) {
            layer = 0;
        }
        if (this._layers[layer] === undefined) {
            this._layers[layer] = new Set;
        }
        this._layers[layer].add(entity);
        return entity;
    }

    despawn(entity, layer) {
        if (!(entity instanceof S2.Entity)) {
            throw new Error("S2.Entity.despawn entity parameter must be an instance of S2.Entity");
        }
        if (layer === undefined) {
            layer = S2.Entity.DefaultLayer;
        } else if (layer < 0) {
            layer = 0;
        }
        if (this._layers[layer] === undefined || !this._layers[layer].has(entity)) {
            return false;
        }
        this._layers[layer].delete(entity);
        return true;
    }

    addBehavior(behavior) {
        if (!(behavior instanceof S2.Behavior)) {
            throw new Error("S2.Entity.addBehavior behavior parameter must be an instance of S2.Behavior");
        }
        this._behaviors.add(behavior);
        return true;
    }

    deleteBehavior(behavior) {
        return this._behaviors.delete(behavior);
    }

    update(entity) { }

    canvasResized() { }

    _animationFrame() {
        this._animate._animationFrame();
        this._transform.begin();
        if (this._renderer) {
            this._renderer.draw();
        }
        this._layers.forEach(layer => {
            layer.forEach(entity => {
                entity._update();
                entity._animationFrame();
            });
        });
        this._transform.end();
    }

    _update() {
        this._behaviors.forEach(v => v.update(this));
        this.update(this);
    }

    _canvasResized() {
        this._layers.forEach(layer => {
            layer.forEach(entity => {
                entity._canvasResized(this);
            });
        });
        this._behaviors.forEach(v => v.canvasResized(this));
        this.canvasResized(this);
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
        this._animators = new Set;
    }

    add(animator) {
        if (!(animator instanceof S2.Animator)) {
            throw new Error("S2.Animate.add animator parameter value must be an instance of S2.Animator.");
        }
        this._animators.add(animator);
        return animator;
    }

    delete(animator) {
        this._animators.delete(animator);
    }

    fall(threshold, velocity) {
        const animator = new S2.Animator(this._entity, (entity, animator) => {
            if (threshold >= entity.transform.position.y) {
                entity.transform.position.y += velocity;
            } else {
                animator.cancel();
            }
        });
        this._animators.add(animator);
        return animator;
    }

    slide(direction, distance, steps) {
        const stepSize = distance / steps;
        const animator = new S2.Animator(this._entity, (entity, animator) => {
            if (steps) {
                entity.transform.position.add(S2.Vector.Scale(direction, stepSize));
                steps--;
            } else {
                animator.cancel();
            }
        });
        this._animators.add(animator);
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
        this._animators.add(animator);
        return animator;
    }

    _animationFrame() {
        this._animators.forEach(animator => animator._animationFrame());
        this._animators.forEach(v => {
            if (v._complete) {
                this._animators.delete(v);
            }
        });
    }
}

S2.Animator = class {
    constructor(entity, fn, completeCallback = () => { }) {
        this._complete = false;
        this._completeCallback = completeCallback;
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
        this._completeCallback();
    }
}

S2.Vector = class {
    constructor(x = 0, y = 0) {
        this._x = x;
        this._y = y;
    }

    static get Up() {
        return new S2.Vector(0, -1);
    }

    static get Right() {
        return new S2.Vector(1, 0);
    }

    static get Down() {
        return new S2.Vector(0, 1);
    }

    static get Left() {
        return new S2.Vector(-1, 0);
    }

    static Scale(vector, magnitude) {
        if (magnitude instanceof S2.Vector) {
            return new S2.Vector(vector.x * magnitude.x, vector.y * magnitude.y);
        }
        return new S2.Vector(vector.x * magnitude, vector.y * magnitude);
    }

    get x() {
        return this._x;
    }

    set x(value) {
        this._x = value;
    }

    get y() {
        return this._y;
    }

    set y(value) {
        this._y = value;
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
    constructor(sprite, innerPosition, innerWidth, innerHeight) {
        super();
        if (!(sprite instanceof S2.Sprite)) {
            throw new Error("S2.SpriteRenderer.constructor sprite paramenter must be an instance of S2.Sprite.");
        }
        this._sprite = sprite;
        this._innerPosition = innerPosition
        this._innerWidth = innerWidth;
        this._innerHeight = innerHeight;
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

    get innerPosition() {
        return this._innerPosition !== undefined ? this._innerPosition : new Vector(0, 0);
    }

    set innerPosition(value) {
        if (!(value instanceof S2.Vector)) {
            throw new Error("S2.SpriteRenderer.innerPosition value must be an instance of S2.Vector.");
        }
        this._innerPosition = value;
    }

    get innerWidth() {
        return this._innerWidth === undefined ? this._sprite.width : this._innerWidth;
    }

    set innerWidth(value) {
        this._innerWidth = value;
    }

    get innerHeight() {
        return innerHeight === undefined ? this._sprite.height : this._innerHeight;
    }

    set innerHeight(value) {
        this._innerHeight = value;
    }

    get width() {
        return this._sprite.width;
    }

    get height() {
        return this._sprite.height;
    }

    draw() {
        if (this._sprite.loaded) {
            if (this._innerPosition !== undefined) {
                const width = this._innerWidth !== undefined ? this._innerWidth : this._sprite.width;
                const height = this._innerHeight !== undefined ? this._innerHeight : this._sprite.height;
                S2.instance.context.drawImage(
                    this._sprite.image,
                    this._innerPosition.x,
                    this._innerPosition.y,
                    width,
                    height,
                    0,
                    0,
                    width,
                    height);
            } else {
                S2.instance.context.drawImage(this._sprite.image, 0, 0);
            }
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
        this._keys = new Map;
        let canvas = S2.instance.canvas;
        canvas.tabIndex = 0;
        canvas.focus();
        canvas.addEventListener("keydown", this._keydownListener.bind(this), true);
        canvas.addEventListener("keyup", this._keyupListener.bind(this), true);
    }

    _animationFrame() {
        //this._keys = new Map;
    }

    keyDown(key) {
        if (!this._keys.has(key)) {
            return false;
        }
        const e = this._keys.get(key);
        return e.type === "keydown" ? e : false;
    }

    keyUp(key) {
        if (!this._keys.has(key)) {
            return true;
        }
        const e = this._keys.get(key);
        return e.type === "keyup" ? e : false;
    }

    keyPressed(key) {
        if (!this._keys.has(key)) {
            return false;
        }
        const e = this._keys.get(key);
        return e.type === "keydown" && e.repeat === false ? e : false;
    }

    keyReleased(key) {
        return this.keyUp(key);
    }

    _keydownListener(e) {
        this._keys.set(e.key, e);
    }

    _keyupListener(e) {
        this._keys.set(e.key, e);
    }

}

S2.Behavior = class {
    update(entity) { }
    canvasResized(entity) { }
}