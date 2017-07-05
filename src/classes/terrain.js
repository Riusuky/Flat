class Tile {
    constructor(row, column, sprite) {
        if(sprite instanceof Image) {
            this.sprite = sprite;
        }
        else if(sprite) {
            console.error('Tile.constructor: sprite is not a Image object.');
            return null;
        }

        row = Number(row.toFixed());
        column = Number(column.toFixed());

        if( (typeof row == 'number') && (typeof column == 'number') ) {
            this.row = row;
            this.column = column;
        }
        else {
            console.error('Tile.constructor: row and column must be numbers.');
            return null;
        }

        this.highlighted = false;
    }
}

class Terrain {
    constructor() {
        this.tileSizeX = 64;
        this.tileSizeY = 64;

        this.tileMap = new Map();
        this.tileHighlightMap = new Map();
    }

    get tiles() {
        return [...this.tileMap.values()];
    }

    get tileSize() {
        return [this.tileSizeX, this.tileSizeY];
    }

    set tileSize(tileSize) {
        if( (tileSize instanceof Array) && (tileSize.length == 2) && (typeof tileSize[0] == 'number') && (typeof tileSize[1] == 'number') ) {
            this.tileSizeX = tileSize[0];
            this.tileSizeY = tileSize[1];
        }
        else {
            console.error('set Terrain.tileSize: tileSize is not an array of size 2 that contains numbers.');
        }
    }


    setTile(tile) {
        if(!(tile instanceof Tile)) {
            console.error('Terrain.setTile: tile is not a Tile object.');
        }
        else {
            this.tileMap.set(`${tile.row}x${tile.column}`, tile);
        }
    }

    setTiles(tiles) {
        if(!(tiles instanceof Array)) {
            console.error('Terrain.setTiles: tiles is not an Array.');
        }
        else {
            for(const tile of tiles) {
                this.setTile(tile);
            }
        }
    }

    setTileHighlight(row, column, highlighted = true) {
        if( (typeof row == 'number') && (typeof column == 'number') && (typeof highlighted == 'boolean') ) {
            let tile = this.tileMap.get(`${row}x${column}`);
            if(!tile) {
                tile = new Tile(row, column);
                this.setTile(tile);
            }

            tile.highlighted = highlighted;

            return tile;
        }
        else {
            console.error('Terrain.setTileHighlight: row and column must be numbers and highlighted must be a boolean.');
        }

        return null;
    }

    clear() {
        this.tileMap.clear();
        this.tileHighlightMap = new Map();
    }
}
