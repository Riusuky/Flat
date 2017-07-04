const canvas = document.getElementById("canvas");

const resources = new Resources();

const render = new Render(canvas);

const engine = new Engine();

let lastMousePosition = null;
let lastHighlightedTile = null;

let dragEnabled = false;

engine.registerMouseEventCallback(event => {
    if( (event.type == 'mousedown') && (event.which == 2) ) {
        lastMousePosition = [event.clientX, event.clientY];
        dragEnabled = true;
    }
    else if( (event.type == 'mouseleave') || ((event.type == 'mouseup') && (event.which == 2)) ) {
        dragEnabled = false;
        lastMousePosition = null;
        render.mousePositionToRenderCoordinates([event.clientX, event.clientY])
    }
    else if(event.type == 'mousemove') {
        const mousePosition = [event.clientX, event.clientY];

        if(lastMousePosition) {
            render.coordOffsetX += mousePosition[0] - lastMousePosition[0];
            render.coordOffsetY -= mousePosition[1] - lastMousePosition[1];

            lastMousePosition = mousePosition;
        }

        if(lastHighlightedTile) {
            lastHighlightedTile.highlighted = false;
        }

        lastHighlightedTile = terrain.setTileHighlight.apply(terrain, render.mousePositionToTileCoordinates(mousePosition));
    }
});

// engine.registerKeyEventCallback(event => {
//     debugger;
// });

const terrain = new Terrain();

render.setTerrain(terrain);

render.drawTileGrid = true;
render.drawBorders = true;
render.drawTileHighlight = true;

resources.addImages(['img/grass.jpg', 'img/tree.png']).then(result => {
    const tree = new GameObject(result[1].img);
    tree.pivot = [0.5, 0.1];
    tree.originalBorder = [250, 120];

    tree.scale = 0.4;

    for(let i = -2; i<=2; i++) {
        for(let j = -2; j<=2; j++) {
            terrain.setTile(new Tile(i, j, result[0].img));
        }
    }

    engine.start();
});
