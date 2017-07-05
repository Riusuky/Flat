/**
* @class
*/
class ImageObject {
    /**
    * @constructor
    */
    constructor(sprite, subscribeToRender = true) {
        if(sprite) {
            this.setSprite(sprite);
        }

        this.pivotX = 0.5;
        this.pivotY = 0.5;

        this.x = 0;
        this.y = 0;

        this.originalsizeX = this.originalsizeX || 0;
        this.originalsizeY = this.originalsizeY || 0;

        this.scaleX = 1;
        this.scaleY = 1;

        this.layer = 0;

        this.visible = true;

        if(!Render) {
            console.error('ImageObject.constructor: Render class is not defined.');
        }
        else if(!(Render.instance instanceof Render)) {
            console.error('ImageObject.constructor: There is no render instance to subscribre to.');
        }
        else {
            this.render = Render.instance;
            if(subscribeToRender) {
                this.subscribeToRender();
            }
        }
    }

    get pivot() {
        return [this.pivotX, this.pivotY];
    }

    set pivot(pivot) {
        if( (pivot instanceof Array) && (pivot.length == 2) && (typeof pivot[0] == 'number') && (typeof pivot[1] == 'number') ) {
            this.pivotX = pivot[0];
            this.pivotY = pivot[1];
        }
        else {
            console.error('set ImageObject.pivot: pivot is not an array of size 2 that contains numbers.');
        }
    }

    get position() {
        return [this.x, this.y];
    }

    set position(position) {
        if( (position instanceof Array) && (position.length == 2) && (typeof position[0] == 'number') && (typeof position[1] == 'number') ) {
            this.x = position[0];
            this.y = position[1];
        }
        else {
            console.error('set ImageObject.position: position is not an array of size 2 that contains numbers.');
        }
    }

    get sizeX() {
        return this.originalsizeX*this.scaleX;
    }

    get sizeY() {
        return this.originalsizeY*this.scaleY;
    }

    get size() {
        return [this.originalsizeX*this.scaleX, this.originalsizeY*this.scaleY];
    }

    get originalsize() {
        return [this.originalsizeX, this.originalsizeY];
    }

    set originalsize(originalsize) {
        if( (originalsize instanceof Array) && (originalsize.length == 2) && (typeof originalsize[0] == 'number') && (typeof originalsize[1] == 'number') ) {
            this.originalsizeX = originalsize[0];
            this.originalsizeY = originalsize[1];
        }
        else {
            console.error('set ImageObject.originalsize: originalsize is not an array of size 2 that contains numbers.');
        }
    }

    get scale() {
        return [this.scaleX, this.scaleY];
    }

    set scale(scale) {
        if( (scale instanceof Array) && (scale.length == 2) && (typeof scale[0] == 'number') && (typeof scale[1] == 'number') ) {
            this.scaleX = scale[0];
            this.scaleY = scale[1];
        }
        else if(typeof scale == 'number') {
            this.scaleX = scale;
            this.scaleY = scale;
        }
        else {
            console.error('set ImageObject.scale: scale is not an array of size 2 that contains numbers or simply a number.');
        }
    }

    mayRender() {
        return (this.sprite instanceof Image) && this.visible;
    }

    setSprite(sprite, adjustSize = true) {
        if(sprite instanceof Image) {
            this.sprite = sprite;

            if(adjustSize) {
                this.originalsizeX = sprite.naturalWidth;
                this.originalsizeY = sprite.naturalHeight;
            }
        }
        else if(sprite) {
            console.error('GameObject.constructor: sprite is not set as a Image object.');
        }
        else {
            this.sprite = null;
        }
    }

    subscribeToRender() {
        this.render.registerObject(this);
    }

    unsubscribeToRender() {
        this.render.unregisterObject(this);
    }

    createCopy() {
        const newCopy = new ImageObject(this.sprite, false);

        this.copyPropertiesTo(newCopy);

        return newCopy;
    }

    copyPropertiesTo(targetImageObject) {
        if((targetImageObject instanceof ImageObject)) {
            targetImageObject.sprite = this.sprite;

            targetImageObject.pivot = [this.pivotX, this.pivotY];
            targetImageObject.position = [this.x, this.y];

            targetImageObject.originalsize = [this.originalsizeX, this.originalsizeY];

            targetImageObject.scale = [this.scaleX, this.scaleY];

            targetImageObject.layer = this.layer;
        }
        else {
            console.error('ImageObject.copyPropertiesTo: targetImageObject is not a ImageObject instance.');
        }
    }
}

/**
* @class
*/
class GameObject extends ImageObject {
    /**
    * @constructor
    */
    constructor(sprite, subscribeToRender = true) {
        super(sprite, subscribeToRender);

        this.vx = 0;
        this.vy = 0;

        this.originalBorderWidth = this.originalsizeX || 64;
        this.originalBorderHeight = this.originalsizeY || 64;
        // // Box colider
        // this.boxColliderSize = [0, 0];
        // this.boxColliderPositionOffset = [0, 0];
        //
        // this.active = true;
    }

    update(deltaTime) {
        if(this.active) {
            this.x += this.vx*deltaTime;
            this.y += this.vy*deltaTime;
        }
    }

    get borderWidth() {
        return this.originalBorderWidth*this.scaleX;
    }

    get borderHeight() {
        return this.originalBorderHeight*this.scaleY;
    }

    get originalBorder() {
        return [this.originalBorderWidth, this.originalBorderHeight];
    }

    set originalBorder(originalBorder) {
        if( (originalBorder instanceof Array) && (originalBorder.length == 2) && (typeof originalBorder[0] == 'number') && (typeof originalBorder[1] == 'number') ) {
            this.originalBorderWidth = originalBorder[0];
            this.originalBorderHeight = originalBorder[1];
        }
        else {
            console.error('set ImageObject.originalBorder: originalBorder is not an array of size 2 that contains numbers.');
        }
    }

    get border() {
        const borderRadius = [+ 0.5*this.originalBorderWidth*this.scaleX, 0.5*this.originalBorderHeight*this.scaleY];

        return {
            top: this.y + borderRadius[1],
            right: this.x + borderRadius[0],
            bottom: this.y - borderRadius[1],
            left: this.x - borderRadius[0]
        };
    }

    hasCollided(otherBorder) {
        var myBorder = this.border;

        return (Math.min(myBorder.right, otherBorder.right) - Math.max(myBorder.left, otherBorder.left) >= 0) && (Math.min(myBorder.bottom, otherBorder.bottom) - Math.max(myBorder.top, otherBorder.top) >= 0);
    }

    createCopy() {
        const newCopy = new GameObject(this.sprite, false);

        this.copyPropertiesTo(newCopy);

        return newCopy;
    }

    copyPropertiesTo(targetGameObject) {
        if((targetGameObject instanceof GameObject)) {
            super.copyPropertiesTo(targetGameObject);

            targetGameObject.vx = this.vx;
            targetGameObject.vy = this.vy;

            targetGameObject.originalBorderWidth = this.originalBorderWidth;
            targetGameObject.originalBorderHeight = this.originalBorderHeight;
        }
        else {
            console.error('GameObject.copyPropertiesTo: targetGameObject is not a GameObject instance.');
        }
    }
}
