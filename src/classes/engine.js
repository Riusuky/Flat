/**
* @class
*/
class Engine {
    /**
    * @constructor
    */
    constructor() {
        if(Engine.instance instanceof Engine) {
            console.error('Engine.constructor: Engine instance already exists.');
            return null;
        }

        Engine.instance = this;

        this.lastTime = Date.now();
        this.gameObjectSet = new Set();
        this.collisionCandidateSet = new Set();
        this.keyCallbackSet = new Set();
        this.mouseCallbackSet = new Set();

        document.addEventListener('keyup', this.handleKeyEvents.bind(this));
        document.addEventListener('keydown', this.handleKeyEvents.bind(this));
        document.addEventListener('keypress', this.handleKeyEvents.bind(this));

        if(!Render) {
            console.error('Engine.constructor: Render class is not defined.');
        }
        else if(!(Render.instance instanceof Render)) {
            console.error('Engine.constructor: There is no render instance to subscribre mouse events.');
        }
        else {
            this.render = Render.instance;

            this.render.canvas.addEventListener('mouseover', this.handleMouseEvents.bind(this));
            this.render.canvas.addEventListener('mousemove', this.handleMouseEvents.bind(this));
            this.render.canvas.addEventListener('mouseleave', this.handleMouseEvents.bind(this));
            this.render.canvas.addEventListener('mouseout', this.handleMouseEvents.bind(this));
            this.render.canvas.addEventListener('click', this.handleMouseEvents.bind(this));
            this.render.canvas.addEventListener('auxclick', this.handleMouseEvents.bind(this));
            this.render.canvas.addEventListener('mousedown', this.handleMouseEvents.bind(this));
            this.render.canvas.addEventListener('mouseup', this.handleMouseEvents.bind(this));
        }
    }

    handleKeyEvents(event) {
        for(const callback of this.keyCallbackSet) {
            callback(event);
        }
    }

    handleMouseEvents(event) {
        for(const callback of this.mouseCallbackSet) {
            callback(event);
        }
    }

    start() {
        requestAnimationFrame(this.routine.bind(this));
    }

    get currentTime() {
        return Date.now();
    }

    routine() {
        const deltaTime = (this.currentTime - this.lastTime)/1000;

        for(const gameObject of this.gameObjectSet) {
            gameObject.earlyUpdate(deltaTime);
        }

        this.checkForCollisions();

        for(const gameObject of this.gameObjectSet) {
            gameObject.lateUpdate(deltaTime);
        }

        this.render.render();

        this.lastTime = this.currentTime;

        requestAnimationFrame(this.routine.bind(this));
    }

    checkForCollisions() {
        const gameObjects = [...this.collisionCandidateSet];

        for(const dynamicObject of _.filter(gameObjects, 'dynamic')) {
            for(const gameObject of gameObjects) {
                if(gameObject != dynamicObject) {
                    dynamicObject.onCollisionCheck(gameObject);
                }
            }
        }
    }

    /**
    * @callback routineCallback
    * @param {number} deltaTime - time since the callback was last called.
    */

    /**
    * @method registerUpdateCallback - add a callback to be invoked by the engine.
    * @param {routineCallback} callback
    */
    registerUpdateCallback(gameObject, registerCollisionCheck = true) {
        if(!GameObject) {
            console.error('Engine.registerUpdateCallback: GameObject class is not defined.');
        }
        else if(!(gameObject instanceof GameObject)) {
            console.error('Engine.registerUpdateCallback: gameObject is not an instance of GameObject.');
        }
        else {
            this.gameObjectSet.add(gameObject);

            if(registerCollisionCheck) {
                this.collisionCandidateSet.add(gameObject);
            }
        }
    }

    registerCollisionCandidate(gameObject) {
        if(!GameObject) {
            console.error('Engine.registerUpdateCallback: GameObject class is not defined.');
        }
        else if(!(gameObject instanceof GameObject)) {
            console.error('Engine.registerUpdateCallback: gameObject is not an instance of GameObject.');
        }
        else {
            this.collisionCandidateSet.add(gameObject);
        }
    }

    registerKeyEventCallback(callback) {
        if(typeof callback == 'function') {
            this.keyCallbackSet.add(callback);
        }
        else {
            console.error('Engine.registerKeyEventCallback: callback is not set as a function.');
        }
    }

    registerMouseEventCallback(callback) {
        if(typeof callback == 'function') {
            this.mouseCallbackSet.add(callback);
        }
        else {
            console.error('Engine.registerMouseEventCallback: callback is not set as a function.');
        }
    }
}
