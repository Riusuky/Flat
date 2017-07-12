class Render {
    constructor(canvas) {
        if(Render.instance instanceof Render) {
            console.error('Render.constructor: Render instance already exists.');
            return null;
        }

        if(!(canvas instanceof HTMLCanvasElement)) {
            console.error("Render.constructor: given canvas object is not an HTMLCanvasElement.");
            return null;
        }

        Render.instance = this;

        this.canvas = canvas;
        this.context2D = this.canvas.getContext('2d');

        this.updateCanvasSize();

        window.addEventListener('resize', this.updateCanvasSize);

        // Coordinate sytem. Axis orientation will be: X->right , Y->up
        this.originX = 0.5;
        this.originY = 0.5;

        this.coordOffsetX = 0;
        this.coordOffsetY = 0;

        this.objectSet = new Set();

        this.drawTileGrid = false;
        this.drawBorders = false;
        this.drawTileHighlight = false;
    }

    canvasPositionToRenderCoordinates(position) {
        if( (position instanceof Array) && (position.length == 2) && (typeof position[0] == 'number') && (typeof position[1] == 'number') ) {
            const realOrigin = this.realOrigin;

            return [
                position[0] - realOrigin[0],
                realOrigin[1] - position[1]
            ];
        }
        else {
            console.error('set Render.canvasPositionToRenderCoordinates: position is not an array of size 2 that contains numbers.');
            return null;
        }
    }

    mousePositionToCanvasRelativePosition(mousePosition) {
        const canvasRect = this.canvas.getBoundingClientRect();

        return [
            mousePosition[0] - canvasRect.left,
            mousePosition[1] - canvasRect.top
        ];
    }

    mousePositionToRenderCoordinates(mousePosition) {
        return this.canvasPositionToRenderCoordinates(this.mousePositionToCanvasRelativePosition(mousePosition));
    }

    mousePositionToTileCoordinates(mousePosition) {
        if(!Terrain) {
            console.error('Render.mousePositionToTileCoordinates: Terrain class is not defined.');
        }
        else if(!(this.terrain instanceof Terrain)) {
            console.error('Render.mousePositionToTileCoordinates: terrain is not set.');
        }
        else {
            const realOrigin = this.realOrigin;
            const relativeCanvasPosition = this.mousePositionToCanvasRelativePosition(mousePosition);

            const coordinates = [
                0.5 + (relativeCanvasPosition[0] - realOrigin[0])/this.terrain.tileSizeX,
                -0.5 + (realOrigin[1] - relativeCanvasPosition[1])/this.terrain.tileSizeY
            ];

            return [
                Math.floor(coordinates[0]),
                Math.ceil(coordinates[1])
            ];
        }
    }

    get origin() {
        return [this.originX, this.originY];
    }

    set origin(origin) {
        if( (origin instanceof Array) && (origin.length == 2) && (typeof origin[0] == 'number') && (typeof origin[1] == 'number') ) {
            this.originX = origin[0];
            this.originY = origin[1];
        }
        else {
            console.error('set Render.origin: origin is not an array of size 2 that contains numbers.');
        }
    }

    get coordOffset() {
        return [this.coordOffsetX, this.coordOffsetY];
    }

    set coordOffset(coordOffset) {
        if( (coordOffset instanceof Array) && (coordOffset.length == 2) && (typeof coordOffset[0] == 'number') && (typeof coordOffset[1] == 'number') ) {
            this.coordOffsetX = coordOffset[0].toFixed();
            this.coordOffsetY = coordOffset[1].toFixed();
        }
        else {
            console.error('set Render.coordOffset: coordOffset is not an array of size 2 that contains numbers.');
        }
    }

    get realOrigin() {
        return [
            this.originX*this.canvas.width + this.coordOffsetX,
            (1 - this.originY)*this.canvas.height - this.coordOffsetY
        ];
    }

    updateCanvasSize() {
        const containerStyle = window.getComputedStyle(this.canvas.parentElement);

        this.canvas.width = parseFloat(containerStyle.width) - parseFloat(containerStyle.paddingLeft) - parseFloat(containerStyle.paddingRight) - parseFloat(containerStyle.borderLeftWidth) - parseFloat(containerStyle.borderRightWidth);
        this.canvas.height = parseFloat(containerStyle.height) - parseFloat(containerStyle.paddingTop) - parseFloat(containerStyle.paddingBottom) - parseFloat(containerStyle.borderTopWidth) - parseFloat(containerStyle.borderBottomWidth);
    }

    registerObject(imageObject) {
        if(!ImageObject) {
            console.error('Render.registerObject: ImageObject class is not defined.');
        }
        else if(!(imageObject instanceof ImageObject)) {
            console.error('Render.registerObject: imageObject is not a ImageObject object.');
        }
        else {
            this.objectSet.add(imageObject);
        }
    }

    unregisterObject(imageObject) {
        if(!ImageObject) {
            console.error('Render.registerObject: ImageObject class is not defined.');
        }
        else if(!(imageObject instanceof ImageObject)) {
            console.error('Render.registerObject: imageObject is not a ImageObject object.');
        }
        else {
            this.objectSet.delete(imageObject);
        }
    }

    setTerrain(terrain) {
        if(!Terrain) {
            console.error('Render.setTerrain: Terrain class is not defined.');
        }
        else if(!(terrain instanceof Terrain)) {
            console.error('Render.setTerrain: terrain is not a Terrain object.');
        }
        else {
            this.terrain = terrain;
        }
    }

    render() {
        this.context2D.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.renderTerrain();

        if(this.drawTileGrid) {
            this.renderTileGrid();
        }

        this.renderObjects();
    }

    renderTerrain() {
        const realOrigin = this.realOrigin;

        this.context2D.fillStyle = 'rgba(255, 255, 255, 0.4)';

        if(this.terrain) {
            for(const tile of this.terrain.tiles) {
                const tilePosition = [
                    (realOrigin[0] + (tile.row - 0.5)*this.terrain.tileSizeX).toFixed(),
                    (realOrigin[1] - (tile.column + 0.5)*this.terrain.tileSizeY).toFixed()
                ];

                if(tile.sprite) {
                    this.context2D.drawImage(
                        tile.sprite,
                        tilePosition[0],
                        tilePosition[1],
                        (this.terrain.tileSizeX).toFixed(),
                        (this.terrain.tileSizeY).toFixed()
                    );
                }

                if(this.drawTileHighlight && tile.highlighted) {
                    this.context2D.fillRect(
                        tilePosition[0],
                        tilePosition[1],
                        (this.terrain.tileSizeX).toFixed(),
                        (this.terrain.tileSizeY).toFixed()
                    );
                }
            }
        }
    }

    renderObjects() {
        const realOrigin = this.realOrigin;

        let objectSize, objectBorder;

        this.context2D.strokeStyle = 'purple';
        this.context2D.lineWidth = 2;

        for(const objectToRender of _.chain([...this.objectSet]).sortBy('y').reverse().sortBy('layer').value()) {
            if(objectToRender.mayRender()) {
                objectSize = objectToRender.size;
                this.context2D.drawImage(
                    objectToRender.sprite,
                    (realOrigin[0] + objectToRender.x - objectToRender.pivotX*objectSize[0]).toFixed(),
                    (realOrigin[1] - (objectToRender.y + (1 - objectToRender.pivotY)*objectSize[1])).toFixed(),
                    (objectSize[0]).toFixed(),
                    (objectSize[1]).toFixed()
                );
            }

            if(this.drawBorders) {
                if(!GameObject) {
                    console.error('Render.renderObjects: GameObject class not defined.');
                }
                else if((objectToRender instanceof GameObject) && objectToRender.active) {
                    objectBorder = objectToRender.border;
                    this.context2D.strokeRect(realOrigin[0] + objectBorder.left, realOrigin[1] - objectBorder.top, objectToRender.borderWidth, objectToRender.borderHeight);
                }
            }
        }
    }

    renderTileGrid() {
        if(this.terrain) {
            this.context2D.strokeStyle = 'white';
            this.context2D.lineWidth = 1;

            const realOrigin = this.realOrigin;

            const minX = Math.ceil(0.5 - realOrigin[0]/this.terrain.tileSizeX);
            const maxX = Math.floor(0.5 + (this.canvas.width - realOrigin[0])/this.terrain.tileSizeX);

            const minY = Math.ceil(-0.5 + (realOrigin[1] - this.canvas.height)/this.terrain.tileSizeY);
            const maxY = Math.floor(-0.5 + realOrigin[1]/this.terrain.tileSizeY);

            this.context2D.beginPath();

            let loackedPosition = 0;

            for(let i = minX; i <= maxX; i++) {
                loackedPosition = (realOrigin[0] + (i - 0.5)*this.terrain.tileSizeX).toFixed();
                this.context2D.moveTo(loackedPosition, 0);
                this.context2D.lineTo(loackedPosition,this.canvas.height);
            }

            for(let j = minY; j <= maxY; j++) {
                loackedPosition = (realOrigin[1] - (j + 0.5)*this.terrain.tileSizeY).toFixed();
                this.context2D.moveTo(0, loackedPosition);
                this.context2D.lineTo(this.canvas.width, loackedPosition);
            }

            this.context2D.stroke();
        }
    }
}
