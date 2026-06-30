import { departmentToColor } from './department-colors.js';

const popup = document.getElementById('map-popup');
const popupTitle = document.getElementById('map-popup-title');
const popupSubtitle = document.getElementById('map-popup-subtitle');
const popupBody = document.getElementById('map-popup-body');
const popupActions = document.getElementById('map-popup-actions');
const showInListBtn = document.getElementById('map-popup-show-in-list');
const closeBtn = document.getElementById('map-popup-close');

let currentBuilding = null;
let onShowInList = null;
let onProfessorSelect = null;
let positionCallback = null;

function formatRoom(prof) {
    const parts = [];
    if (prof.building) parts.push(prof.building);
    if (prof.room_number) parts.push(prof.room_number);
    return parts.join(' ') || '—';
}

function buildProfessorRow(prof) {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'map-popup-row';
    row.dataset.professorId = prof.professor_id;

    const dot = document.createElement('span');
    dot.className = 'modal-dept-dot';
    dot.style.backgroundColor = departmentToColor(prof.departments);

    const name = document.createElement('span');
    name.className = 'map-popup-row-name';
    name.textContent = `${prof.first_name} ${prof.last_name}`;

    const dept = document.createElement('span');
    dept.className = 'map-popup-row-dept';
    dept.textContent = prof.departments || 'Unknown';

    const room = document.createElement('span');
    room.className = 'map-popup-row-room';
    room.textContent = formatRoom(prof);

    row.append(dot, name, dept, room);

    row.addEventListener('click', (event) => {
        event.stopPropagation();
        onProfessorSelect?.(prof);
    });

    return row;
}

export function registerPopupPositioner(callback) {
    positionCallback = callback;
}

export function openBuildingPopup(buildingData, callbacks = {}) {
    if (!popup) return;

    currentBuilding = buildingData.building;
    onShowInList = callbacks.onShowInList;
    onProfessorSelect = callbacks.onProfessorSelect;

    const displayName = buildingData.building_name || buildingData.building;
    const code = buildingData.building || '';
    popupTitle.textContent = code ? `${displayName} (${code})` : displayName;

    const count = buildingData.professorCount ?? buildingData.professors?.length ?? 0;
    popupSubtitle.textContent = count === 1 ? '1 professor' : `${count} professors`;
    popupSubtitle.hidden = false;

    popupBody.replaceChildren();
    popupBody.classList.remove('map-popup-body--single');

    for (const prof of buildingData.professors || []) {
        popupBody.appendChild(buildProfessorRow(prof));
    }

    if (count === 0) {
        const empty = document.createElement('p');
        empty.className = 'map-popup-empty';
        empty.textContent = 'No professors listed for this building.';
        popupBody.appendChild(empty);
    }

    popupActions.hidden = false;
    popup.hidden = false;
    positionCallback?.();
}

export function openProfessorPopup(prof, callbacks = {}) {
    if (!popup) return;

    currentBuilding = prof.building || null;
    onShowInList = null;
    onProfessorSelect = callbacks.onProfessorSelect;

    popupTitle.textContent = `${prof.first_name} ${prof.last_name}`;
    popupSubtitle.hidden = true;

    popupBody.replaceChildren();
    popupBody.classList.add('map-popup-body--single');
    popupBody.appendChild(buildProfessorRow(prof));

    popupActions.hidden = true;
    popup.hidden = false;
    positionCallback?.();
}

export function closeMapPopup() {
    if (!popup) return;
    popup.hidden = true;
    currentBuilding = null;
    onShowInList = null;
    onProfessorSelect = null;
}

export function isMapPopupOpen() {
    return popup && !popup.hidden;
}

function initPopupListeners() {
    closeBtn?.addEventListener('click', (event) => {
        event.stopPropagation();
        closeMapPopup();
    });

    popup?.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    showInListBtn?.addEventListener('click', (event) => {
        event.stopPropagation();
        if (currentBuilding) {
            onShowInList?.(currentBuilding);
            closeMapPopup();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && isMapPopupOpen()) {
            closeMapPopup();
        }
    });
}

initPopupListeners();
