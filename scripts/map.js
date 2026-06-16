import { API_BASE_URL } from './config.js';

const [esriConfig, Map, MapView, Graphic, GraphicsLayer] =
    await $arcgis.import([
        "@arcgis/core/config.js",
        "@arcgis/core/Map.js",
        "@arcgis/core/views/MapView.js",
        "@arcgis/core/Graphic.js",
        "@arcgis/core/layers/GraphicsLayer.js",
    ]);

// 1. Get ArcGIS config from backend
const mapConfig = await fetch(`${API_BASE_URL}/map/config`)
    .then((res) => res.json());

console.log("Map config:", mapConfig);

// 2. Set ArcGIS API key BEFORE creating the map
esriConfig.apiKey = mapConfig.apiKey;

// 3. Create map
const map = new Map({
    basemap: mapConfig.basemap || "arcgis-navigation",
});

// 4. Create view
const view = new MapView({
    container: "map-canvas",
    map: map,
    center: [
        mapConfig.center.longitude,
        mapConfig.center.latitude
    ],
    zoom: mapConfig.zoom || 15,
    constraints: {
        snapToZoom: false,
    },
});

// 5. Add graphics layer
const graphicsLayer = new GraphicsLayer();
map.add(graphicsLayer);

// 6. Get building locations from backend
const locations = await fetch(`${API_BASE_URL}/map-locations`)
    .then((res) => res.json());

console.log("Map locations:", locations);

// 7. Marker symbol
const blueMapPinSymbol = {
    type: "simple-marker",
    style: "circle",
    color: [0, 82, 110],
    size: "14px",
    outline: {
        color: [255, 255, 255],
        width: 2,
    },
};

// 8. Add markers
locations
    .filter((location) => location.latitude && location.longitude)
    .forEach((location) => {
        const buildingGraphic = new Graphic({
            geometry: {
                type: "point",
                longitude: location.longitude,
                latitude: location.latitude,
            },
            symbol: blueMapPinSymbol,
            attributes: {
                building: location.building,
                building_name: location.building_name,
            },
            popupTemplate: {
                title: "{building}",
                content: "{building_name}",
            },
        });

        graphicsLayer.add(buildingGraphic);
    });
