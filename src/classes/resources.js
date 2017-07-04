const ImageResourceStatus = {
    INITIATING: 'Initiating',
    FAILED: 'Failed',
    LOADING: 'Loading',
    LOADED: 'Loaded'
};

class ImageResource {
    constructor() {
        this.progress = 0;
        this.status = ImageResourceStatus.INITIATING;
        this.onLoad = null;
        this.onProgress = null;
        this.onStatusChanged = null;
    }

    static get IMAGE_STATUS() {
        return ImageResourceStatus;
    }

    get loaded() {
        return this.status == ImageResourceStatus.LOADED;
    }

    setProgress(progress) {
        this.progress = progress;

        console.log(`ImageResource.setProgress: ${progress}`);

        if(this.onProgress) {
            this.onProgress(this.progress);
        }
    }

    setStatus(status) {
        this.status = status;

        if(this.onStatusChanged) {
            this.onStatusChanged(this.status);
        }

        switch (this.status) {
            case ImageResourceStatus.INITIATING:
            break;

            case ImageResourceStatus.FAILED:
            break;

            case ImageResourceStatus.LOADING:
            break;

            case ImageResourceStatus.LOADED:
            this.setProgress(1);
            if(this.onLoad) {
                this.onLoad();
            }
            break;

            default:
        }
    }

    setTriggers() {
        if(this.img) {
            this.promise = new Promise((resolve, reject) => {
                this.img.onloadstart = () => {
                    this.setStatus(ImageResourceStatus.LOADING);
                };
                this.img.onprogress = progress => {
                    this.progress = this.setProgress(progress);
                };
                this.img.onload = () => {
                    this.setStatus(ImageResourceStatus.LOADED);
                    resolve(this);
                };
                this.img.onerror = (error) => {
                    this.setStatus(ImageResourceStatus.FAILED);
                    reject(error);
                };
            });
        }
    }

    setSource(source) {
        if(source) {
            if(source instanceof Image) {
                if(source.src) {
                    this.imageSrc = source.src;
                    this.img = source;

                    if(source.completed) {
                        this.setStatus(ImageResourceStatus.LOADED);
                    }
                    else {
                        this.setTriggers();
                    }
                }
                else {
                    console.error('ImageResource requires a proper source.');
                }
            }
            else if(typeof source == 'string') {
                this.imageSrc = source;
                this.img = new Image();

                this.setTriggers();

                this.img.src = source;
            }

            return this.promise;
        }
        else {
            console.error('ImageResource requires a proper source.');
        }
    }
}

class Resources {
    constructor() {
        this.imageCache = new Map();
    }

    /**
    * @method addImage - Add an image resource and starts loading it if possible.
    * @param {Object|string} imgSource - image source. It may be an img element object or the img url string.
    * @param {string} [alias] - image alias used to retrieve resource. if imgSource is a string and alias is not specified, then the alias will be set to the imgSource.
    * @return {Promisse} - promise that fullfills when the resource has loaded.
    */
    addImage(imgSource, alias) {
        if( (typeof imgSource == 'string') && !alias ) {
            alias = imgSource;
        }

        const newImageResource = new ImageResource();

        if(!alias) {
            console.log('Resources.addImage: alias not set and thus this image will not be cached!');
        }
        else {
            if(this.imageCache.has(alias)) {
                window.alert(`Resources.addImage: image alias "${alias}" is already being used and will be overwritten.`);
            }

            this.imageCache.set(alias, newImageResource);
        }

        return newImageResource.setSource(imgSource);
    }

    /**
    * @method addImages - Same as addImage but for multple image resources.
    * @param {Array} sources - each element should be an array that matches the arguments of the addImage method: [imgSource, alias].
    * @return {Promisse} - promise that fullfills when all resources have loaded.
    */
    addImages(sources) {
        if(!(sources instanceof Array)) {
            console.error('Resources.addImages: argument is not an array');

            return;
        }

        const promises = [];

        for(const aguments of sources) {
            if(arguments instanceof Array) {
                promises.push(this.addImage.apply(this, aguments));
            }
            else {
                promises.push(this.addImage(aguments));
            }
        }

        return Promise.all(promises);
    }

    /**
    * @method getImage - returns the img element object respective to the given alias.
    */
    getImage(alias) {
        const cache = this.imageCache.get(alias);

        if(!cache) {
            console.error('Resources.getImage: could not find alias "${alias}"');
        }

        return cache;
    }
}
