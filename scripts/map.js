

const [esriConfig, Map, MapView, Graphic, GraphicsLayer] =
    await $arcgis.import([
        "@arcgis/core/config.js",
        "@arcgis/core/Map.js",
        "@arcgis/core/views/MapView.js",
        "@arcgis/core/Graphic.js",
        "@arcgis/core/layers/GraphicsLayer.js",
    ])
;

const mapConfig = await fetch('http://66.112.209.106:3000/map/config').then((res) => res.json());
console.log(mapConfig);
esriConfig.apiKey = mapConfig.apiKey;

const map = new Map({
    basemap: "arcgis/community",
});

const view = new MapView({
    container: "map-canvas",
    map: map,
    center: [-111.78311813556628, 43.81768993455273],
    zoom: 15,
    constraints: {
        snapToZoom: false,
    },
});

const graphicsLayer = new GraphicsLayer();
map.add(graphicsLayer);

const blueMapPinSymbol = {
    type: "simple-marker",
    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
    color: [0, 82, 110], // TODO: choose color based on department
    size: "32px",
    yoffset: "16px", // <- Make sure this is just half of the size
};

// landmarkList.forEach(landmark => {
//     const landmarkGraphic = new Graphic({
//         geometry: {
//             type: "point",
//             longitude: landmark.longitude,
//             latitude: landmark.latitude,
//         },
//         symbol: blueMapPinSymbol,
//         attributes: {
//             name: landmark.name,
//             description: landmark.description,
//         },
//         popupTemplate: {
//             title: landmark.name,
//             content: landmark.description,
//         },
//     });

//     graphicsLayer.add(landmarkGraphic);
// });
