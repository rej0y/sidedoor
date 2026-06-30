import { buildBuildingMap } from './map-data.js';
import {
    openBuildingPopup,
    openProfessorPopup,
    closeMapPopup,
    isMapPopupOpen,
    registerPopupPositioner,
} from './map-popup.js';
import { filterByBuilding, selectProfessorCard } from './map-bridge.js';
import { registerMapHandlers } from './map-bridge.js';
import { API_BASE_URL } from './config.js';
import { buildingList } from './buildings.js';

const [esriConfig, EsriMap, MapView, Graphic, GraphicsLayer, Point] =
    await $arcgis.import([
        '@arcgis/core/config.js',
        '@arcgis/core/Map.js',
        '@arcgis/core/views/MapView.js',
        '@arcgis/core/Graphic.js',
        '@arcgis/core/layers/GraphicsLayer.js',
        '@arcgis/core/geometry/Point.js',
    ]);

const mapConfig = await fetch(`${API_BASE_URL}/map/config`)
    .then((res) => res.json());

esriConfig.apiKey = mapConfig.apiKey;

const map = new EsriMap({
    basemap: mapConfig.basemap || 'arcgis-navigation',
});

const view = new MapView({
    container: 'map-canvas',
    map: map,
    center: [
        mapConfig.center.longitude,
        mapConfig.center.latitude,
    ],
    zoom: mapConfig.zoom || 15,
    constraints: {
        snapToZoom: false,
    },
});

view.popupEnabled = false;
view.ui.remove("zoom");
view.ui.add("zoom", "bottom-right");
view.ui.add(document.getElementById("map-controls"), "bottom-right");

const graphicsLayer = new GraphicsLayer();
map.add(graphicsLayer);

const buildingGraphics = new Map();
const buildingCoords = new Map(
    buildingList.map((b) => [b.code, { longitude: b.longitude, latitude: b.latitude }]),
);

let hoveredBuilding = null;
let selectedBuilding = null;
let popupAnchor = null;
let extentWatchHandle = null;
let sizeWatchHandle = null;

function createPinSymbol(state = 'default') {
    const config = {
        default: { size: '14px', color: [0, 82, 110], outlineWidth: 2 },
        hover: { size: '18px', color: [0, 100, 135], outlineWidth: 2 },
        selected: { size: '20px', color: [147, 197, 253], outlineWidth: 3 },
    }[state];

    return {
        type: 'simple-marker',
        style: 'circle',
        color: config.color,
        size: config.size,
        outline: {
            color: [255, 255, 255],
            width: config.outlineWidth,
        },
    };
}

function createCountLabel(count) {
    if (!count) return null;

    return {
        type: 'text',
        color: 'white',
        text: String(count),
        font: {
            size: 9,
            weight: 'bold',
            family: 'Inter',
        },
        haloColor: [0, 82, 110],
        haloSize: 6,
        yoffset: 1,
    };
}

function getBuildingState(buildingCode) {
    if (selectedBuilding === buildingCode) return 'selected';
    if (hoveredBuilding === buildingCode) return 'hover';
    return 'default';
}

function updateBuildingSymbol(buildingCode) {
    const entry = buildingGraphics.get(buildingCode);
    if (!entry) return;
    entry.pinGraphic.symbol = createPinSymbol(getBuildingState(buildingCode));
}

function setHoveredBuilding(buildingCode) {
    if (hoveredBuilding === buildingCode) return;
    const previous = hoveredBuilding;
    hoveredBuilding = buildingCode;
    if (previous) updateBuildingSymbol(previous);
    if (buildingCode) updateBuildingSymbol(buildingCode);
}

function highlightBuilding(buildingCode) {
    const previous = selectedBuilding;
    selectedBuilding = buildingCode || null;
    if (previous) updateBuildingSymbol(previous);
    if (selectedBuilding) updateBuildingSymbol(selectedBuilding);
}

function panToBuilding(buildingCode) {
    const entry = buildingGraphics.get(buildingCode);
    if (!entry) return;

    view.goTo({
        center: [entry.longitude, entry.latitude],
        zoom: Math.max(view.zoom, 17),
    });
}

function getAnchorForBuilding(buildingCode) {
    const entry = buildingGraphics.get(buildingCode);
    if (entry) {
        return { longitude: entry.longitude, latitude: entry.latitude };
    }
    const coords = buildingCoords.get(buildingCode);
    if (coords?.longitude && coords?.latitude) {
        return coords;
    }
    return null;
}

function anchorToScreen(anchor) {
    const point = new Point({
        longitude: anchor.longitude,
        latitude: anchor.latitude,
    });
    return view.toScreen(point);
}

function positionMapPopup() {
    if (!popupAnchor || !isMapPopupOpen()) return;

    const popup = document.getElementById('map-popup');
    const mapCanvas = document.getElementById('map-canvas');
    const mapViewport = document.getElementById('map-viewport');
    if (!popup || !mapCanvas || !mapViewport) return;

    const screen = anchorToScreen(popupAnchor);
    if (!screen) return;

    const canvasRect = mapCanvas.getBoundingClientRect();
    const viewportRect = mapViewport.getBoundingClientRect();

    popup.style.left = `${screen.x + canvasRect.left - viewportRect.left}px`;
    popup.style.top = `${screen.y + canvasRect.top - viewportRect.top}px`;
}

function schedulePopupReposition() {
    requestAnimationFrame(() => {
        positionMapPopup();
    });
}

function startPopupTracking(anchor) {
    popupAnchor = anchor;
    schedulePopupReposition();

    stopPopupTracking(false);

    extentWatchHandle = view.watch('extent', schedulePopupReposition);
    sizeWatchHandle = view.watch('size', schedulePopupReposition);
}

function blurMapSurface() {
    view.container.querySelector('.esri-view-surface')?.blur();
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
}

function stopPopupTracking(clearAnchor = true) {
    if (clearAnchor) {
        popupAnchor = null;
    }
    if (extentWatchHandle) {
        extentWatchHandle.remove();
        extentWatchHandle = null;
    }
    if (sizeWatchHandle) {
        sizeWatchHandle.remove();
        sizeWatchHandle = null;
    }
}

function handleOpenProfessorPopup(prof) {
    const anchor = getAnchorForBuilding(prof.building);
    if (!anchor) return;

    openProfessorPopup(prof, {
        onProfessorSelect: (selected) => {
            selectProfessorCard(selected.professor_id);
        },
    });
    startPopupTracking(anchor);
}

function buildBuildingPins(professors) {
    const placePins = () => {
        graphicsLayer.removeAll();
        buildingGraphics.clear();
        hoveredBuilding = null;

        const buildingMap = buildBuildingMap(professors);

        for (const [buildingCode, buildingData] of buildingMap) {
            const pinGraphic = new Graphic({
                geometry: {
                    type: 'point',
                    longitude: buildingData.longitude,
                    latitude: buildingData.latitude,
                },
                symbol: createPinSymbol(getBuildingState(buildingCode)),
                attributes: {
                    building: buildingCode,
                    building_name: buildingData.building_name,
                    professorCount: buildingData.professorCount,
                },
            });

            graphicsLayer.add(pinGraphic);

            const labelSymbol = createCountLabel(buildingData.professorCount);
            if (labelSymbol) {
                graphicsLayer.add(new Graphic({
                    geometry: {
                        type: 'point',
                        longitude: buildingData.longitude,
                        latitude: buildingData.latitude,
                    },
                    symbol: labelSymbol,
                    attributes: {
                        building: buildingCode,
                        building_name: buildingData.building_name,
                        professorCount: buildingData.professorCount,
                    },
                }));
            }

            buildingGraphics.set(buildingCode, {
                pinGraphic,
                longitude: buildingData.longitude,
                latitude: buildingData.latitude,
                data: buildingData,
            });
        }

        if (selectedBuilding && !buildingGraphics.has(selectedBuilding)) {
            selectedBuilding = null;
        }

        if (isMapPopupOpen()) {
            closeMapPopup();
            stopPopupTracking();
        }
    };

    view.when(placePins);
}

registerMapHandlers({
    highlightBuilding,
    panToBuilding,
    buildBuildingPins,
    openProfessorPopup: handleOpenProfessorPopup,
    closeMapPopup: () => {
        closeMapPopup();
        stopPopupTracking();
    },
});

registerPopupPositioner(schedulePopupReposition);

function getBuildingFromHit(hit) {
    const graphic = hit.graphic;
    if (!graphic?.attributes?.building) return null;
    return graphic.attributes.building;
}

view.on('pointer-move', async (event) => {
    const hit = await view.hitTest(event);
    const buildingHit = hit.results.find(
        (result) => result.graphic?.layer === graphicsLayer && result.graphic?.attributes?.building,
    );
    setHoveredBuilding(buildingHit ? getBuildingFromHit(buildingHit) : null);
});

view.on('click', async (event) => {
    const hit = await view.hitTest(event);
    const buildingHit = hit.results.find(
        (result) => result.graphic?.layer === graphicsLayer && result.graphic?.attributes?.building,
    );

    if (!buildingHit) {
        closeMapPopup();
        stopPopupTracking();
        blurMapSurface();
        return;
    }

    const buildingCode = getBuildingFromHit(buildingHit);
    const entry = buildingGraphics.get(buildingCode);
    if (!entry) return;

    blurMapSurface();
    highlightBuilding(buildingCode);

    openBuildingPopup(entry.data, {
        onShowInList: (code) => {
            filterByBuilding(code);
        },
        onProfessorSelect: (prof) => {
            selectProfessorCard(prof.professor_id);
            if (prof.building) {
                highlightBuilding(prof.building);
            }
        },
    });

    startPopupTracking({
        longitude: entry.longitude,
        latitude: entry.latitude,
    });
});

view.when(() => {
    view.container.style.cursor = 'default';

    const surface = view.container.querySelector('.esri-view-surface');
    if (surface) {
        surface.setAttribute('tabindex', '-1');
        surface.addEventListener('focus', () => {
            surface.blur();
        });
    }
});

view.on('pointer-move', () => {
    view.container.style.cursor = hoveredBuilding ? 'pointer' : 'default';
});

const PAN_DISTANCE = 120;

document.querySelectorAll(".arrow-btn").forEach((button) => {
    button.addEventListener("click", () => {

        let x = 0;
        let y = 0;

        switch (button.dataset.dir) {
            case "up":
                y = PAN_DISTANCE;
                break;

            case "down":
                y = -PAN_DISTANCE;
                break;

            case "left":
                x = PAN_DISTANCE;
                break;

            case "right":
                x = -PAN_DISTANCE;
                break;
        }

        view.goTo({
            target: view.toMap({
                x: view.width / 2 - x,
                y: view.height / 2 - y
            })
        });

    });
});