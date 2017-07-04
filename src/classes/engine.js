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
        this.callbackSet = new Set();
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
        const deltaTime = this.currentTime - this.lastTime;

        for(const callback of this.callbackSet) {
            callback(deltaTime);
        }

        this.render.render();

        requestAnimationFrame(this.routine.bind(this));
    }

    /**
    * @callback routineCallback
    * @param {number} deltaTime - time since the callback was last called.
    */

    /**
    * @method registerRoutineCallback - add a callback to be invoked by the engine.
    * @param {routineCallback} callback
    */
    registerRoutineCallback(callback) {
        if(typeof callback == 'function') {
            this.callbackSet.add(callback);
        }
        else {
            console.error('Engine.registerRoutineCallback: callback is not set as a function.');
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
