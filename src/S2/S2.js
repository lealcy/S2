"use strict";

class S2 {
    static #canvas;
    static #context;
    static #running = false;
    static #frameCount = 0;
    static #timestamp = 0;
    static #deltaTime = 1;
    static #clearEveryFrame = true;
    static #backgroundColor = "black";
    static #scene;

    static get canvas() {
        return S2.#canvas;
    }

    static get context() {
        return S2.#context;
    }

    static get width() {
        return S2.#canvas.width;
    }

    static get height() {
        return S2.#canvas.height;
    }

    static get running() {
        return S2.#running;
    }

    static get timestamp() {
        return S2.#timestamp;
    }

    static get deltaTime() {
        return S2.#deltaTime;
    }

    static get frameCount() {
        return S2.#frameCount;
    }

    static get clearEveryFrame() {
        return S2.#clearEveryFrame;
    }

    static set clearEveryFrame(value) {
        S2.#clearEveryFrame = !!value;
    }

    static get backgroundColor() {
        return S2.#backgroundColor;
    }

    static set backgroundColor(value) {
        S2.#backgroundColor = value;
    }

    static get scene() {
        return S2.#scene;
    }

    static set scene(value) {
        if (!(value instanceof S2.Entity)) {
            throw new Error("S2.S2.scene value must be an instance of S2.Entity.");
        }
        S2.#scene = value;
    }

    static attachToCanvas(canvasEl, shouldRun = true) {
        if (!(canvasEl instanceof HTMLCanvasElement)) {
            throw new Error("S2.attachToCanvas canvasEl parameter must be an instance of HTMLCanvasElement.");
        }
        S2.detatchFromCanvas();
        S2.#canvas = canvasEl;
        S2.#context = canvasEl.getContext("2d", { alpha: false });
        if (!S2.#scene) {
            S2.#scene = new S2.Entity(0, 0);
        }
        window.addEventListener("resize", S2.#windowResizeListener, false);
        S2.#windowResizeListener();
        S2.Input.attachToCanvas();

        if (shouldRun) {
            S2.start();
        }
    }

    static detatchFromCanvas() {
        window.removeEventListener("resize", S2.#windowResizeListener, false);
        if (S2.#canvas) {
            S2.Input.detatchFromCanvas();
        }
    }

    static start() {
        if (S2.#running) {
            return;
        }
        S2.#running = true;
        S2.#internalAnimationFrame(0);
    }

    static stop() {
        S2.#running = false;
    }


    static requestFullScreen() {
        (S2.#canvas.requestFullscreen && S2.#canvas.requestFullscreen()) ||
            (S2.#canvas.webkitRequestFullscreen && S2.#canvas.webkitRequestFullscreen()) ||
            (S2.#canvas.mozRequestFullScreen && S2.#canvas.mozRequestFullScreen()) ||
            (S2.#canvas.msRequestFullscreen && S2.#canvas.msRequestFullscreen());
    }

    static #internalAnimationFrame(timestamp) {
        if (!S2.#running) {
            return;
        }
        requestAnimationFrame(S2.#internalAnimationFrame);
        S2.#deltaTime = (timestamp - S2.#timestamp) / (1000 / 60);
        S2.#timestamp = timestamp;
        S2.#frameCount++;

        if (!S2.#backgroundColor) {
            S2.#context.clearRect(0, 0, S2.#canvas.width, S2.#canvas.height);
        } else {
            S2.#context.save();
            S2.#context.fillStyle = S2.#backgroundColor;
            S2.#context.fillRect(0, 0, S2.#canvas.width, S2.#canvas.height);
            S2.#context.restore();
        }
        S2.#scene.internalUpdate();
        S2.#scene.internalAnimationFrame();
    }

    static #windowResizeListener(e) {
        const oldWidth = S2.#canvas.width;
        const oldHeight = S2.#canvas.height;
        S2.#canvas.width = window.innerWidth;
        S2.#canvas.height = window.innerHeight;
        S2.#scene.internalCanvasResized(oldWidth, oldHeight);
    }

    static Input = class {
        static #keys = new Map;

        static attachToCanvas() {
            S2.canvas.tabIndex = 0;
            S2.canvas.focus();
            S2.canvas.addEventListener("keydown", S2.Input.#keydownListener, true);
            S2.canvas.addEventListener("keyup", S2.Input.#keyupListener, true);
        }

        static detatchFromCanvas() {
            S2.canvas.removeEventListener("keydown", S2.Input.#keydownListener, true);
            S2.canvas.removeEventListener("keyup", S2.Input.#keyupListener, true);
        }

        static keyDown(key) {
            if (!S2.Input.#keys.has(key)) {
                return false;
            }
            const e = S2.Input.#keys.get(key);
            return e.type === "keydown" ? e : false;
        }

        static keyUp(key) {
            if (!S2.Input.#keys.has(key)) {
                return true;
            }
            const e = S2.Input.#keys.get(key);
            return e.type === "keyup" ? e : false;
        }

        static keyPressed(key) {
            if (!S2.Input.#keys.has(key)) {
                return false;
            }
            const e = S2.Input.#keys.get(key);
            return e.type === "keydown" && e.repeat === false ? e : false;
        }

        static keyReleased(key) {
            return S2.Input.keyUp(key);
        }

        static #keydownListener(e) {
            S2.Input.#keys.set(e.key, e);
        }

        static #keyupListener(e) {
            S2.Input.#keys.set(e.key, e);
        }

    }

    static Vector = class {
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

        static scale(vector, magnitude) {
            if (magnitude instanceof S2.Vector) {
                return new S2.Vector(vector.x * magnitude.x, vector.y * magnitude.y);
            }
            return new S2.Vector(vector.x * magnitude, vector.y * magnitude);
        }

        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }

        copy() {
            return new S2.Vector(this.x, this.y);
        }

        add(vector) {
            this.x += vector.x;
            this.y += vector.y;
            return this;
        }

        scale(magnitude) {
            if (magnitude instanceof S2.Vector) {
                this.x *= magnitude.x;
                this.y *= magnitude.y;
            } else {
                this.x *= magnitude;
                this.y *= magnitude;
            }
            return this;
        }
    }

    static Entity = class {
        static get DefaultLayer() { return 100; }

        #transform = new S2.Transform();
        #animate = new S2.Animate(this);
        #renderer;
        #layers = [];
        #behaviors = new Set;

        constructor(x = 0, y = 0, renderer = null) {
            this.#transform.position.x = x;
            this.#transform.position.y = y;
            this.#renderer = renderer;
            if (this.#renderer && !(this.#renderer instanceof S2.Renderer)) {
                throw new Error("S2.Entity.contructor renderer parameter must be an instance of S2.Renderer class.");
            }
        }

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
            if (!(value instanceof S2.Renderer)) {
                throw new Error("S2.Entity.renderer new value must be an instance of S2.Renderer class.");
            }
            this.#renderer = value;
        }

        spawn(entity, layer = S2.Entity.DefaultLayer) {
            if (!(entity instanceof S2.Entity)) {
                throw new Error("S2.Entity.spawn entity parameter must be an instance of S2.Entity");
            }
            if (layer < 0) {
                layer = 0;
            }
            if (this.#layers[layer] === undefined) {
                this.#layers[layer] = new Set;
            }
            this.#layers[layer].add(entity);
            return entity;
        }

        despawn(entity, layer = S2.Entity.DefaultLayer) {
            if (!(entity instanceof S2.Entity)) {
                throw new Error("S2.Entity.despawn entity parameter must be an instance of S2.Entity");
            }
            if (layer < 0) {
                layer = 0;
            }
            if (this.#layers[layer] === undefined || !this.#layers[layer].has(entity)) {
                return false;
            }
            this.#layers[layer].delete(entity);
            return true;
        }

        addBehavior(behavior) {
            if (!(behavior instanceof S2.Behavior)) {
                throw new Error("S2.Entity.addBehavior behavior parameter must be an instance of S2.Behavior");
            }
            this.#behaviors.add(behavior);
            return true;
        }

        deleteBehavior(behavior) {
            if (!(behavior instanceof S2.Behavior)) {
                throw new Error("S2.Entity.deleteBehavior behavior parameter must be an instance of S2.Behavior");
            }
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

    static Transform = class {
        #position = new S2.Vector();
        #scale = new S2.Vector(1, 1);

        begin() {
            S2.context.save();
            S2.context.translate(this.#position.x, this.#position.y);
            S2.context.scale(this.#scale.x, this.#scale.y);
        }

        end() {
            S2.context.restore();
        }

        get position() {
            return this.#position;
        }

        set position(value) {
            if (!(value instanceof S2.Vector)) {
                throw new Error("S2.Transform.position value must be an instance of S2.Vector.");
            }
            this.#position = value;
        }

        get scale() {
            return this.#scale;
        }

        set scale(value) {
            if (!(value instanceof S2.Vector)) {
                throw new Error("S2.Transform.scale value must be an instance of S2.Vector.");
            }
            this.#scale = value;
        }
    }

    static Animate = class {
        #entity;
        #animators = new Set;

        constructor(entity) {
            if (!(entity instanceof S2.Entity)) {
                throw new Error("S2.Animate.constructor entity parameter must be an instance of S2.Entity");
            }
            this.#entity = entity;
        }

        add(animator) {
            if (!(animator instanceof S2.Animator)) {
                throw new Error("S2.Animate.add animator parameter value must be an instance of S2.Animator.");
            }
            this.#animators.add(animator);
            return animator;
        }

        delete(animator) {
            if (!(animator instanceof S2.Animator)) {
                throw new Error("S2.Animate.delete animator parameter value must be an instance of S2.Animator.");
            }
            this.#animators.delete(animator);
        }

        fall(threshold, velocity) {
            const animator = new S2.Animator(this.#entity, (entity, animator) => {
                if (threshold >= entity.transform.position.y) {
                    entity.transform.position.y += velocity * S2.deltaTime;
                } else {
                    animator.cancel();
                }
            });
            this.#animators.add(animator);
            return animator;
        }

        slide(direction, distance, steps) {
            const stepSize = distance / steps;
            const animator = new S2.Animator(this.#entity, (entity, animator) => {
                if (steps) {
                    entity.transform.position.add(S2.Vector.scale(direction, stepSize * S2.deltaTime));
                    steps--;
                } else {
                    animator.cancel();
                }
            });
            this.#animators.add(animator);
            return animator;
        }

        bounceBox(x, y, width, height, velocity) {
            if (!(velocity instanceof S2.Vector)) {
                throw new Error("S2.Animate.bounceBox velocity parameter value must be an instance of S2.Vector.");
            }
            let vector = velocity.copy();
            const animator = new S2.Animator(this.#entity, (entity, animation) => {
                if (entity.transform.position.x < x) {
                    vector.x = velocity.x * S2.deltaTime;
                }
                if (entity.transform.position.x + entity.renderer.width > width) {
                    vector.x = -velocity.x * S2.deltaTime;
                }
                if (entity.transform.position.y < y) {
                    vector.y = velocity.y * S2.deltaTime;
                }
                if (entity.transform.position.y + entity.renderer.height > height) {
                    vector.y = -velocity.y * S2.deltaTime;
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

    static Animator = class {
        #completeCallback;
        #entity;
        #fn;
        complete = false;

        constructor(entity, fn, completeCallback = () => { }) {
            if (!(entity instanceof S2.Entity)) {
                throw new Error("S2.Animator.constructor entity parameter must be an instance of S2.Entity");
            }
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

    static Renderer = class {
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

    static SpriteRenderer = class extends S2.Renderer {
        #sprite;
        #offset;
        #width;
        #height;

        constructor(sprite, offset = new S2.Vector(0, 0), width, height) {
            super();
            if (!(sprite instanceof S2.Sprite)) {
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
            S2.context.drawImage(
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

    static Sprite = class {
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

    static SpriteSheet = class {
        #columns;
        #rows;
        #entryWidth;
        #entryHeight;
        #sprite;
        #cache = [];

        constructor(sprite, columns, rows, entryWidth, entryHeight) {
            if (!(sprite instanceof S2.Sprite)) {
                throw new Error("S2.SpriteSheet.constructor sprite paramenter must be an instance of S2.Sprite.");
            }
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

    static #SpriteSheetEntry = class {
        constructor(x, y, spriteRenderer) {
            this.x = x;
            this.y = y;
            this.spriteRenderer = spriteRenderer;
        }
    }



}

class Behavior {
    update(entity) { }
    canvasResized(entity) { }
}