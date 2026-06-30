let highlightBuildingHandler = null;
let panToBuildingHandler = null;
let buildBuildingPinsHandler = null;
let filterByBuildingHandler = null;
let selectProfessorCardHandler = null;
let openProfessorPopupHandler = null;
let closeMapPopupHandler = null;
let pendingProfessors = null;

export function registerMapHandlers({
    highlightBuilding,
    panToBuilding,
    buildBuildingPins,
    openProfessorPopup,
    closeMapPopup,
}) {
    highlightBuildingHandler = highlightBuilding;
    panToBuildingHandler = panToBuilding;
    buildBuildingPinsHandler = buildBuildingPins;
    openProfessorPopupHandler = openProfessorPopup;
    closeMapPopupHandler = closeMapPopup;

    if (pendingProfessors) {
        buildBuildingPins(pendingProfessors);
        pendingProfessors = null;
    }
}

export function registerListHandlers({ filterByBuilding, selectProfessorCard }) {
    filterByBuildingHandler = filterByBuilding;
    selectProfessorCardHandler = selectProfessorCard;
}

export function highlightBuilding(buildingCode) {
    highlightBuildingHandler?.(buildingCode);
}

export function panToBuilding(buildingCode) {
    panToBuildingHandler?.(buildingCode);
}

export function buildBuildingPins(professors) {
    if (buildBuildingPinsHandler) {
        buildBuildingPinsHandler(professors);
    } else {
        pendingProfessors = professors;
    }
}

export function filterByBuilding(buildingCode) {
    filterByBuildingHandler?.(buildingCode);
}

export function selectProfessorCard(professorId) {
    selectProfessorCardHandler?.(professorId);
}

export function openProfessorPopup(prof) {
    openProfessorPopupHandler?.(prof);
}

export function closeMapPopup() {
    closeMapPopupHandler?.();
}
