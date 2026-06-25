// -------------------------------------------------------------------------
// BUILDING DATA DICTIONARY
// -------------------------------------------------------------------------

const buildingList = [
    {
        name: "John Taylor Building",
        code: "TAY",
        longitude: -111.78248444801046,
        latitude: 43.81694583377972,
    },
    {
        name: "Hyrum Manwaring Center",
        code: "MC",
        longitude: -111.78263637667692,
        latitude: 43.818451753364144,
    },
    {
        name: "David O. McKay Library",
        code: "MCK",
        longitude: -111.78286277912267,
        latitude: 43.81949647069055,
    },
    {
        name: "BYU-Idaho Center",
        code: "BCTR",
        longitude: -111.78508397663666,
        latitude: 43.8184963653647,
    },
    {
        name: "Jacob Spori Building",
        code: "SPO",
        longitude: -111.7824002916312,
        latitude: 43.82082684021518,
    },
    {
        name: "George S. Romney Building",
        code: "ROM",
        longitude: -111.78317387843754,
        latitude: 43.82021651041659,
    },
    {
        name: "Eliza R. Snow Performing Arts Center",
        code: "SNO",
        longitude: -111.78354930433272,
        latitude: 43.82130748684191,
    },
    {
        name: "John L. Clarke Building",
        code: "CLK",
        longitude: -111.78172763569471,
        latitude: 43.82025555244315,
    },
    {
        name: "Joseph Fielding Smith Building",
        code: "SM",
        longitude: -111.78144987690813,
        latitude: 43.81919463126997,
    },
    {
        name: "Gordon B. Hinckley Building",
        code: "HIN",
        longitude: -111.77986791356423,
        latitude: 43.81588034742696,
    },
    {
        name: "Science and Technology Center",
        code: "STC",
        longitude: -111.78466182238381,
        latitude: 43.814675493316614,
    },
    {
        name: "Mark Austin Technical & Engineering Building",
        code: "AUS",
        longitude: -111.78435264563406,
        latitude: 43.815819627755566,
    },
    {
        name: "Ezra Taft Benson Agricultural & Biological Sciences Building",
        code: "BEN",
        longitude: -111.78305140606066,
        latitude: 43.81551975914793,
    },
    {
        name: "Agricultural Engineering Building",
        code: "AGM",
        longitude: -111.7831550660907,
        latitude: 43.8132429750805,
    },
    {
        name: "Engineering Technology Center",
        code: "ETC",
        longitude: -111.78307405271207,
        latitude: 43.814085148082754,
    },
    {
        name: "Thomas E. Ricks Building",
        code: "RKS",
        longitude: -111.78117287037354,
        latitude: 43.81481306705497,
    },
    {
        name: "Spencer W. Kimball Building",
        code: "KIM",
        longitude: -111.78149564040112,
        latitude: 43.81708162489654,
    },
    {
        name: "John W. Hart Building",
        code: "HRT",
        longitude: -111.78522432352315,
        latitude: 43.81953202562512,
    },
    {
        name: "Student Health Center",
        code: "SHC",
        longitude: -111.77925936684649,
        latitude: 43.816844810185195,
    },
    {
        name: "BYU-Idaho Stadium",
        code: "STA",
        longitude: -111.78602157247036,
        latitude: 43.82092641339254,
    },
    {
        name: "Visual Arts Studio",
        code: "VAS",
        longitude: -111.7816058835756,
        latitude: 43.82092547356725,
    },
    {
        name: "University Communications Building",
        code: "UCB",
        longitude:  -111.77936653078693,
        latitude: 43.817292606798596,
    },
    {
        name: "Lowell G. Biddulph Building",
        code: "BID",
        longitude: -111.78508082692004,
        latitude: 43.81709067735768,
    },
    {
        name: "William F. Rigby Building",
        code: "RIG",
        longitude: -111.78443552560194,
        latitude: 43.81707873839289,
    },
    {
        name: "University Operations Building",
        code: "PPO",
        longitude: -111.78570471980477,
        latitude: 43.81612329405016,
    },
    {
        name: "Facilities Management Services Building",
        code: "PPS",
        longitude: -111.78550549249228,
        latitude: 43.81620670770126,
    },
    {
        name: "Outdoor Rental Center",
        code: "ORC",
        longitude: -111.78608485336468,
        latitude: 43.82117611247245,
    },
    {
        name: "Stadium Studio",
        code: "STU",
        longitude: -111.78602507009823,
        latitude: 43.82093289796658,
    },
];


// -------------------------------------------------------------------------
// MAP CONFIG/SETUP
// -------------------------------------------------------------------------

import { API_BASE_URL } from './config.js';

const [esriConfig, Map, MapView, Graphic, GraphicsLayer] =
    await $arcgis.import([
        "@arcgis/core/config.js",
        "@arcgis/core/Map.js",
        "@arcgis/core/views/MapView.js",
        "@arcgis/core/Graphic.js",
        "@arcgis/core/layers/GraphicsLayer.js",
    ]);

<<<<<<< Updated upstream
// 1. Get ArcGIS config from backend
=======
const API_BASE_URL = "http://66.112.209.106:3000";

// Get ArcGIS config from backend
>>>>>>> Stashed changes
const mapConfig = await fetch(`${API_BASE_URL}/map/config`)
    .then((res) => res.json());

// console.log("Map config:", mapConfig);

// Set ArcGIS API key BEFORE creating the map
esriConfig.apiKey = mapConfig.apiKey;

// 3. Create map (just a container object)
const map = new Map({
    basemap: mapConfig.basemap || "arcgis-navigation",
});

// Create view (the actual visuals of the map)
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


// -------------------------------------------------------------------------
// MAP PINS ("locations")
// -------------------------------------------------------------------------

// Add graphics layer (place where we can add our own visual data)
const graphicsLayer = new GraphicsLayer();
map.add(graphicsLayer);

// Get building locations from backend
const locations = await fetch(`${API_BASE_URL}/map-locations`)
    .then((res) => res.json());

console.log("Map locations:", locations);

// Define what a marker symbol looks like
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

// Add markers
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
