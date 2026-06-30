const buildingFilterEl = document.getElementById('building-filter');
const departmentFilterEl = document.getElementById('department-filter');

let selectedBuildings = new Set();
let selectedDepartments = new Set();
let onChangeCallback = null;

let buildingCheckboxes = new Map();
let departmentCheckboxes = new Map();

function uniqueSorted(values) {
    return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function createDropdown(container, { id, label, placeholder, options }) {
    container.innerHTML = `
        <button type="button" class="filter-dropdown-trigger" id="${id}-trigger" aria-expanded="false" aria-haspopup="listbox">
            <span class="filter-dropdown-label">${label}</span>
            <span class="filter-dropdown-value" id="${id}-value">${placeholder}</span>
            <span class="filter-dropdown-chevron" aria-hidden="true">▾</span>
        </button>
        <div class="filter-dropdown-panel" id="${id}-panel" hidden>
            <div class="filter-dropdown-panel-header">
                <span>${label}</span>
                <button type="button" class="filter-dropdown-clear" data-clear-for="${id}">Clear</button>
            </div>
            <div class="filter-dropdown-options" id="${id}-options" role="listbox"></div>
        </div>
    `;

    const trigger = container.querySelector(`#${id}-trigger`);
    const panel = container.querySelector(`#${id}-panel`);
    const valueEl = container.querySelector(`#${id}-value`);
    const optionsEl = container.querySelector(`#${id}-options`);
    const clearBtn = container.querySelector(`[data-clear-for="${id}"]`);

    const checkboxMap = new Map();

    for (const option of options) {
        const labelEl = document.createElement('label');
        labelEl.className = 'filter-dropdown-option';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = option;
        checkbox.dataset.optionValue = option;

        const text = document.createElement('span');
        text.textContent = option;

        labelEl.append(checkbox, text);
        optionsEl.appendChild(labelEl);
        checkboxMap.set(option, checkbox);

        checkbox.addEventListener('change', () => {
            if (id === 'building-filter') {
                if (checkbox.checked) selectedBuildings.add(option);
                else selectedBuildings.delete(option);
            } else {
                if (checkbox.checked) selectedDepartments.add(option);
                else selectedDepartments.delete(option);
            }
            updateTriggerLabels();
            onChangeCallback?.();
        });
    }

    trigger.addEventListener('click', (event) => {
        event.stopPropagation();
        const isOpen = !panel.hidden;
        closeAllPanels();
        if (!isOpen) {
            panel.hidden = false;
            trigger.setAttribute('aria-expanded', 'true');
        }
    });

    panel.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    clearBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        if (id === 'building-filter') {
            selectedBuildings.clear();
        } else {
            selectedDepartments.clear();
        }
        syncCheckboxesFromSets();
        updateTriggerLabels();
        onChangeCallback?.();
    });

    return { trigger, panel, valueEl, checkboxMap, placeholder };
}

let buildingDropdown = null;
let departmentDropdown = null;

function closeAllPanels() {
    document.querySelectorAll('.filter-dropdown-panel').forEach((panel) => {
        panel.hidden = true;
    });
    document.querySelectorAll('.filter-dropdown-trigger').forEach((trigger) => {
        trigger.setAttribute('aria-expanded', 'false');
    });
}

function syncCheckboxesFromSets() {
    for (const [value, checkbox] of buildingCheckboxes) {
        checkbox.checked = selectedBuildings.has(value);
    }
    for (const [value, checkbox] of departmentCheckboxes) {
        checkbox.checked = selectedDepartments.has(value);
    }
}

export function updateTriggerLabels() {
    if (buildingDropdown) {
        buildingDropdown.valueEl.textContent = selectedBuildings.size
            ? [...selectedBuildings].sort().join(', ')
            : buildingDropdown.placeholder;
    }
    if (departmentDropdown) {
        departmentDropdown.valueEl.textContent = selectedDepartments.size
            ? [...selectedDepartments].sort().join(', ')
            : departmentDropdown.placeholder;
    }
}

export function getSelectedBuildings() {
    return new Set(selectedBuildings);
}

export function getSelectedDepartments() {
    return new Set(selectedDepartments);
}

export function setSelectedBuildings(buildings) {
    selectedBuildings = new Set(buildings);
    syncCheckboxesFromSets();
    updateTriggerLabels();
}

export function initFilterDropdowns(professors, { onChange }) {
    onChangeCallback = onChange;
    selectedBuildings = new Set();
    selectedDepartments = new Set();

    const buildingOptions = uniqueSorted(professors.map((p) => p.building));
    const departmentOptions = uniqueSorted(professors.map((p) => p.departments));

    if (buildingFilterEl) {
        buildingDropdown = createDropdown(buildingFilterEl, {
            id: 'building-filter',
            label: 'Buildings',
            placeholder: 'All buildings',
            options: buildingOptions,
        });
        buildingCheckboxes = buildingDropdown.checkboxMap;
    }

    if (departmentFilterEl) {
        departmentDropdown = createDropdown(departmentFilterEl, {
            id: 'department-filter',
            label: 'Departments',
            placeholder: 'All departments',
            options: departmentOptions,
        });
        departmentCheckboxes = departmentDropdown.checkboxMap;
    }

    document.addEventListener('click', closeAllPanels);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeAllPanels();
    });
}
