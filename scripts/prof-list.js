import { departmentToColor } from './department-colors.js';
import {
    highlightBuilding,
    panToBuilding,
    buildBuildingPins,
    openProfessorPopup,
    registerListHandlers,
} from './map-bridge.js';
import {
    initFilterDropdowns,
    getSelectedBuildings,
    getSelectedDepartments,
    setSelectedBuildings,
} from './filter-dropdowns.js';

const profList = document.getElementById('prof-list');

let allProfessors = [];

export function buildProfessorList(professors) {
    allProfessors = professors;
    profList.replaceChildren();
    professors.forEach((prof) => {
        buildProfessorCard(prof);
    });
    initFilterDropdowns(professors, { onChange: applyFilters });
    applyFilters();
}

function buildProfessorCard(prof) {
    const newCard = document.createElement('div');
    newCard.className = 'card professor-card';
    newCard.dataset.id = prof.professor_id;
    newCard.dataset.building = prof.building || '';
    newCard.dataset.departments = prof.departments || '';

    const borderColor = departmentToColor(prof.departments);
    newCard.style.borderLeftColor = borderColor;

    newCard.innerHTML = `
        <span class="prof-dept">${prof.departments ? prof.departments : 'Unknown'}</span>
        <span class="prof-name">${prof.first_name} ${prof.last_name}</span>
        <span class="prof-loc">${prof.building ? prof.building : 'Unknown'} ${prof.room_number ? prof.room_number : ''}</span>
    `;

    newCard.addEventListener('click', () => {
        selectProfessorCard(prof.professor_id);
        if (prof.building) {
            highlightBuilding(prof.building);
            panToBuilding(prof.building);
            openProfessorPopup(prof);
        }
    });

    profList.appendChild(newCard);
}

function getVisibleProfessors() {
    const buildings = getSelectedBuildings();
    const departments = getSelectedDepartments();

    return allProfessors.filter((prof) => {
        if (buildings.size && !buildings.has(prof.building)) return false;
        if (departments.size && !departments.has(prof.departments)) return false;
        return true;
    });
}

function applyFilters() {
    const visibleIds = new Set(getVisibleProfessors().map((p) => String(p.professor_id)));

    profList.querySelectorAll('.professor-card').forEach((card) => {
        card.classList.toggle('filtered-out', !visibleIds.has(card.dataset.id));
    });

    buildBuildingPins(getVisibleProfessors());
}

export function filterByBuilding(buildingCode) {
    setSelectedBuildings(new Set([buildingCode]));
    applyFilters();
    highlightBuilding(buildingCode);
}

export function selectProfessorCard(professorId) {
    profList.querySelectorAll('.professor-card').forEach((card) => {
        card.classList.toggle('selected', card.dataset.id === String(professorId));
    });

    const selected = profList.querySelector(`.professor-card[data-id="${professorId}"]`);
    if (selected && !selected.classList.contains('filtered-out')) {
        selected.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

registerListHandlers({ filterByBuilding, selectProfessorCard });
