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
const searchForm = document.getElementById('search-form');
const searchBar = document.getElementById('search-bar');
const searchButton = document.getElementById('search-button');
const sortableHeaders = document.querySelectorAll('[data-sortfor]');

let allProfessors = [];
let searchTerm = '';
let activeSort = {
    field: null,
    direction: 'asc',
};

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

function normalizeSearchValue(value) {
    return String(value || '').trim().toLowerCase();
}

function getProfessorSearchText(prof) {
    return [
        prof.departments,
        prof.first_name,
        prof.last_name,
        `${prof.first_name || ''} ${prof.last_name || ''}`,
        prof.building,
        prof.room_number,
        `${prof.building || ''} ${prof.room_number || ''}`,
    ]
        .map(normalizeSearchValue)
        .join(' ');
}

function professorMatchesSearch(prof) {
    if (!searchTerm) return true;

    const searchText = getProfessorSearchText(prof);
    return searchTerm
        .split(/\s+/)
        .every((term) => searchText.includes(term));
}

function getProfessorName(prof) {
    return `${prof.first_name || ''} ${prof.last_name || ''}`.trim();
}

function getProfessorLocation(prof) {
    return `${prof.building || ''} ${prof.room_number || ''}`.trim();
}

function getSortValue(prof, field) {
    if (field === 'dept') return prof.departments || '';
    if (field === 'name') return getProfessorName(prof);
    if (field === 'loc') return getProfessorLocation(prof);
    return '';
}

function sortProfessors(professors) {
    if (!activeSort.field) return professors;

    const direction = activeSort.direction === 'desc' ? -1 : 1;

    return [...professors].sort((a, b) => {
        const sortResult = getSortValue(a, activeSort.field)
            .localeCompare(getSortValue(b, activeSort.field), undefined, {
                numeric: true,
                sensitivity: 'base',
            });

        if (sortResult !== 0) return sortResult * direction;

        return String(a.professor_id).localeCompare(String(b.professor_id), undefined, {
            numeric: true,
        });
    });
}

function getVisibleProfessors() {
    const buildings = getSelectedBuildings();
    const departments = getSelectedDepartments();

    return allProfessors.filter((prof) => {
        if (buildings.size && !buildings.has(prof.building)) return false;
        if (departments.size && !departments.has(prof.departments)) return false;
        if (!professorMatchesSearch(prof)) return false;
        return true;
    });
}

function reorderProfessorCards(professors) {
    const orderedCards = sortProfessors(professors)
        .map((prof) => profList.querySelector(`.professor-card[data-id="${prof.professor_id}"]`))
        .filter(Boolean);

    profList.append(...orderedCards);
}

function applyFilters() {
    const visibleProfessors = getVisibleProfessors();
    const visibleIds = new Set(visibleProfessors.map((p) => String(p.professor_id)));

    reorderProfessorCards(visibleProfessors);

    profList.querySelectorAll('.professor-card').forEach((card) => {
        card.classList.toggle('filtered-out', !visibleIds.has(card.dataset.id));
    });

    buildBuildingPins(visibleProfessors);
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

function updateSearchTerm() {
    searchTerm = normalizeSearchValue(searchBar?.value);
    applyFilters();
}

searchBar?.addEventListener('input', updateSearchTerm);
searchButton?.addEventListener('click', updateSearchTerm);
searchForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    updateSearchTerm();
});

sortableHeaders.forEach((header) => {
    header.addEventListener('click', () => {
        const field = header.getAttribute('data-sortfor');

        if (activeSort.field === field) {
            activeSort.direction = activeSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            activeSort = {
                field,
                direction: 'asc',
            };
        }

        applyFilters();
    });
});

registerListHandlers({ filterByBuilding, selectProfessorCard });
