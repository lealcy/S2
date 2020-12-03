"use strict";

class S2 {
    static #instance;
    static get instance() {
        return this.#instance;
    }
    static set instance(value) {
        if (this.#instance) {
            throw new Error("S2 can only be instantied one time. If you want to change the canvas, use S2.instance.attachToCanvas(canvasEl) instead.");
            return;
        }
        this.#instance = value;
    }

    #canvas;
    #context;
    #running = false;
    #frameCount = 0;
    #timestamp = 0;
    #clearEveryFrame = true;
    #backgroundColor = "black";
    #input;
    #scene = new Entity(0, 0);

    constructor(canvasEl, dontRun) {
        if (!(canvasEl instanceof HTMLCanvasElement)) {
            throw new Error("S2.constructor canvasEl parameter must be an instance of HTMLCanvasElement.");
        }

        S2.instance = this;
        this.attachToCanvas(canvasEl);

        if (!dontRun) {
            this.run();
        }
    }

    get canvas() {
        return this.#canvas;
    }

    get context() {
        return this.#context;
    }

    get width() {
        return this.#canvas.width;
    }

    get height() {
        return this.#canvas.height;
    }

    get running() {
        return this.#running;
    }

    get timestamp() {
        return this.#timestamp;
    }

    get frameCount() {
        return this.#frameCount;
    }

    get clearEveryFrame() {
        return this.#clearEveryFrame;
    }

    set clearEveryFrame(value) {
        this.#clearEveryFrame = !!value;
    }

    get backgroundColor() {
        return this.#backgroundColor;
    }

    set backgroundColor(value) {
        this.#backgroundColor = value;
    }

    get input() {
        return this.#input;
    }

    get scene() {
        return this.#scene;
    }

    set scene(value) {
        if (!(value instanceof S2.Entity)) {
            throw new Error("S2.S2.scene value must be an instance of S2.Entity.");
        }
        this.#scene = value;
    }

    attachToCanvas(canvasEl) {
        this.#canvas = canvasEl;
        this.#context = canvasEl.getContext("2d", { alpha: false });
        window.removeEventListener("resize", this.#windowResizeListener.bind(this), false);
        window.addEventListener("resize", this.#windowResizeListener.bind(this), false);
        this.#windowResizeListener();
        this.#input = new Input();
    }

    run() {
        if (this.#running) {
            return;
        }
        this.#running = true;
        this.internalAnimationFrame(0);
    }

    stop() {
        this.#running = false;
    }


    requestFullScreen() {
        (this.#canvas.requestFullscreen && this.#canvas.requestFullscreen()) ||
            (this.#canvas.webkitRequestFullscreen && this.#canvas.webkitRequestFullscreen()) ||
            (this.#canvas.mozRequestFullScreen && this.#canvas.mozRequestFullScreen()) ||
            (this.#canvas.msRequestFullscreen && this.#canvas.msRequestFullscreen());
    }

    internalAnimationFrame(timestamp) {
        if (!this.#running) {
            return;
        }
        requestAnimationFrame(this.internalAnimationFrame.bind(this));
        this.#timestamp = timestamp;
        this.#frameCount++;

        if (!this.#backgroundColor) {
            this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
        } else {
            this.#context.save();
            this.#context.fillStyle = this.#backgroundColor;
            this.#context.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
            this.#context.restore();
        }
        this.#scene.internalUpdate();
        this.#scene.internalAnimationFrame();
        this.#input.internalAnimationFrame();

    }

    #windowResizeListener(e) {
        this.#scene.internalCanvasResized();
        this.#canvas.width = window.innerWidth;
        this.#canvas.height = window.innerHeight;
    }

}

class Entity {
    #transform = new Transform();
    #animate = new Animate(this);
    #renderer;
    #layers = [];
    #behaviors = new Set;

    constructor(x = 0, y = 0, renderer = null) {
        this.#transform.position.x = x;
        this.#transform.position.y = y;
        this.#renderer = renderer;
        if (this.#renderer && !(this.#renderer instanceof Renderer)) {
            throw new Error("S2.Entity.contructor renderer parameter must be an instance of S2.Renderer class.");
        }
    }

    static get DefaultLayer() { return 100; }

    get transform() {
        return this.#transform;
    }

    set transform(value) {
        if (!(value instanceof S2.Transform)) {
            throw new Error("S2.Entity.transform new value must be an instance of S2.Transform class.");
        }
        this.#transform = value;
    }

    get animate() {
        return this.#animate;
    }

    set animate(value) {
        if (!(value instanceof S2.Animate)) {
            throw new Error("S2.Entity.animate value must be an instance of S2.Animate.");
        }
        this.#animate = value;
    }

    get renderer() {
        return this.#renderer;
    }

    set renderer(value) {
        if (!(value instanceof Renderer)) {
            throw new Error("S2.Entity.renderer new value must be an instance of S2.Renderer class.");
        }
        this.#renderer = value;
    }

    spawn(entity, layer) {
        if (!(entity instanceof Entity)) {
            throw new Error("S2.Entity.spawn entity parameter must be an instance of S2.Entity");
        }
        if (layer === undefined) {
            layer = Entity.DefaultLayer;
        } else if (layer < 0) {
            layer = 0;
        }
        if (this.#layers[layer] === undefined) {
            this.#layers[layer] = new Set;
        }
        this.#layers[layer].add(entity);
        return entity;
    }

    despawn(entity, layer) {
        if (!(entity instanceof Entity)) {
            throw new Error("S2.Entity.despawn entity parameter must be an instance of S2.Entity");
        }
        if (layer === undefined) {
            layer = Entity.DefaultLayer;
        } else if (layer < 0) {
            layer = 0;
        }
        if (this.#layers[layer] === undefined || !this.#layers[layer].has(entity)) {
            return false;
        }
        this.#layers[layer].delete(entity);
        return true;
    }

    addBehavior(behavior) {
        if (!(behavior instanceof Behavior)) {
            throw new Error("S2.Entity.addBehavior behavior parameter must be an instance of S2.Behavior");
        }
        this.#behaviors.add(behavior);
        return true;
    }

    deleteBehavior(behavior) {
        return this.#behaviors.delete(behavior);
    }

    update(entity) { }

    canvasResized() { }

    internalAnimationFrame() {
        this.#animate.internalAnimationFrame();
        this.#transform.begin();
        if (this.#renderer) {
            this.#renderer.draw();
        }
        this.#layers.forEach(layer => {
            layer.forEach(entity => {
                entity.internalUpdate();
                entity.internalAnimationFrame();
            });
        });
        this.#transform.end();
    }

    internalUpdate() {
        this.#behaviors.forEach(v => v.update(this));
        this.update(this);
    }

    internalCanvasResized() {
        this.#layers.forEach(layer => {
            layer.forEach(entity => {
                entity.internalCanvasResized(this);
            });
        });
        this.#behaviors.forEach(v => v.canvasResized(this));
        this.canvasResized(this);
    }
}
class Transform {
    #position = new Vector();
    #scale = new Vector(1, 1);

    begin() {
        let ctx = S2.instance.context;
        ctx.save();
        ctx.translate(this.#position.x, this.#position.y);
        ctx.scale(this.#scale.x, this.#scale.y);
    }

    end() {
        S2.instance.context.restore();
    }

    get position() {
        return this.#position;
    }

    set position(value) {
        if (!(value instanceof Vector)) {
            throw new Error("S2.Transform.position value must be an instance of S2.Vector.");
        }
        this.#position = value;
    }

    get scale() {
        return this.#scale;
    }

    set scale(value) {
        if (!(value instanceof Vector)) {
            throw new Error("S2.Transform.scale value must be an instance of S2.Vector.");
        }
        this.#scale = value;
    }
}

class Animate {
    #entity;
    #animators = new Set;

    constructor(entity) {
        this.#entity = entity;
    }

    add(animator) {
        if (!(animator instanceof Animator)) {
            throw new Error("S2.Animate.add animator parameter value must be an instance of S2.Animator.");
        }
        this.#animators.add(animator);
        return animator;
    }

    delete(animator) {
        this.#animators.delete(animator);
    }

    fall(threshold, velocity) {
        const animator = new Animator(this.#entity, (entity, animator) => {
            if (threshold >= entity.transform.position.y) {
                entity.transform.position.y += velocity;
            } else {
                animator.cancel();
            }
        });
        this.#animators.add(animator);
        return animator;
    }

    slide(direction, distance, steps) {
        const stepSize = distance / steps;
        const animator = new Animator(this.#entity, (entity, animator) => {
            if (steps) {
                entity.transform.position.add(Vector.Scale(direction, stepSize));
                steps--;
            } else {
                animator.cancel();
            }
        });
        this.#animators.add(animator);
        return animator;
    }

    bounceBox(x, y, width, height, velocity) {
        if (!(velocity instanceof Vector)) {
            throw new Error("S2.Animate.bounceBox velocity parameter value must be an instance of S2.Vector.");
        }
        let vector = velocity.copy();
        const animator = new Animator(this.#entity, (entity, animation) => {
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
        this.#animators.add(animator);
        return animator;
    }

    internalAnimationFrame() {
        this.#animators.forEach(animator => animator.internalAnimationFrame());
        this.#animators.forEach(v => {
            if (v.complete) {
                this.#animators.delete(v);
            }
        });
    }
}

class Animator {
    #completeCallback;
    #entity;
    #fn;
    complete = false;

    constructor(entity, fn, completeCallback = () => { }) {
        this.#completeCallback = completeCallback;
        this.#entity = entity;
        this.#fn = fn;
    }

    internalAnimationFrame() {
        if (!this.complete) {
            this.#fn(this.#entity, this);
        }
    }

    cancel() {
        this.complete = true;
        this.#completeCallback();
    }
}
class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    static get Up() {
        return new Vector(0, -1);
    }

    static get Right() {
        return new Vector(1, 0);
    }

    static get Down() {
        return new Vector(0, 1);
    }

    static get Left() {
        return new Vector(-1, 0);
    }

    static Scale(vector, magnitude) {
        if (magnitude instanceof Vector) {
            return new Vector(vector.x * magnitude.x, vector.y * magnitude.y);
        }
        return new Vector(vector.x * magnitude, vector.y * magnitude);
    }

    copy() {
        return new Vector(this.x, this.y);
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }

    scale(magnitude) {
        if (magnitude instanceof Vector) {
            this.x *= magnitude.x;
            this.y *= magnitude.y;
        } else {
            this.x *= magnitude;
            this.y *= magnitude;
        }
        return this;
    }
}

class Renderer {
    get width() {
        throw new Error("S2.Renderer.width getter not implemented.");
    }

    get height() {
        throw new Error("S2.Renderer.height getter not implemented.");
    }

    draw() {
        throw new Error("S2.Renderer.draw() method not implemented.");
    }
}

class SpriteRenderer extends Renderer {
    #sprite;
    #offset;
    #width;
    #height;

    constructor(sprite, offset = new Vector(0, 0), width, height) {
        super();
        if (!(sprite instanceof Sprite)) {
            throw new Error("S2.SpriteRenderer.constructor sprite paramenter must be an instance of S2.Sprite.");
        }
        this.#sprite = sprite;
        this.#offset = offset;
        this.#width = width;
        this.#height = height;
    }

    get width() {
        return this.#width !== undefined ? this.#width : this.#sprite.width;
    }

    get height() {
        return this.#height !== undefined ? this.#height : this.#sprite.height;
    }

    draw() {
        if (!this.#sprite.loaded) {
            return;
        }
        S2.instance.context.drawImage(
            this.#sprite.image,
            this.#offset.x,
            this.#offset.y,
            this.width,
            this.height,
            0,
            0,
            this.width,
            this.height);
    }
}

class Sprite {
    #src;
    #isLoaded = false;
    #img = new Image();

    constructor(src) {
        this.#src = src;
        this.#img.onload = e => {
            this.#isLoaded = true;
        }
        this.#img.onerror = e => {
            throw new Error(`S2.Sprite unable to load the image "${src}".`);
        }
        this.#img.src = src;
    }

    get src() {
        return this.#src;
    }

    get image() {
        return this.#img;
    }

    get width() {
        return this.#isLoaded ? this.#img.width : 0;
    }

    get height() {
        return this.#isLoaded ? this.#img.height : 0;
    }

    get loaded() {
        return this.#isLoaded;
    }
}

class SpriteSheetEntry {
    constructor(x, y, spriteRenderer) {
        this.x = x;
        this.y = y;
        this.spriteRenderer = spriteRenderer;
    }
}

class SpriteSheet {
    #columns;
    #rows;
    #entryWidth;
    #entryHeight;
    #sprite;
    #cache = [];

    constructor(sprite, columns, rows, entryWidth, entryHeight) {
        this.#columns = columns;
        this.#rows = rows;
        this.#entryWidth = entryWidth;
        this.#entryHeight = entryHeight;
        this.#sprite = sprite;
    }

    getSpriteRenderer(x, y) {
        const cached = this.#cache.find(el => el.x === x && el.y === y);
        if (cached !== undefined) {
            return cached.spriteRenderer;
        }
        const spriteRenderer = new SpriteRenderer(
            this.#sprite,
            new Vector(this.#entryWidth * x, this.#entryHeight * y),
            this.#entryWidth,
            this.#entryHeight
        );
        this.#cache.push(spriteRenderer);
        return spriteRenderer;
    }
}

class Input {
    #keys = new Map;

    constructor() {
        let canvas = S2.instance.canvas;
        canvas.tabIndex = 0;
        canvas.focus();
        canvas.addEventListener("keydown", this.#keydownListener.bind(this), true);
        canvas.addEventListener("keyup", this.#keyupListener.bind(this), true);
    }

    internalAnimationFrame() {
        //this.#keys = new Map;
    }

    keyDown(key) {
        if (!this.#keys.has(key)) {
            return false;
        }
        const e = this.#keys.get(key);
        return e.type === "keydown" ? e : false;
    }

    keyUp(key) {
        if (!this.#keys.has(key)) {
            return true;
        }
        const e = this.#keys.get(key);
        return e.type === "keyup" ? e : false;
    }

    keyPressed(key) {
        if (!this.#keys.has(key)) {
            return false;
        }
        const e = this.#keys.get(key);
        return e.type === "keydown" && e.repeat === false ? e : false;
    }

    keyReleased(key) {
        return this.keyUp(key);
    }

    #keydownListener(e) {
        this.#keys.set(e.key, e);
    }

    #keyupListener(e) {
        this.#keys.set(e.key, e);
    }

}

class Behavior {
    update(entity) { }
    canvasResized(entity) { }
}