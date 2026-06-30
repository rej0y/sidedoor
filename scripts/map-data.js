import { buildingList } from './buildings.js';

function sortProfessorsByName(professors) {
    return [...professors].sort((a, b) => {
        const last = (a.last_name || '').localeCompare(b.last_name || '');
        if (last !== 0) return last;
        return (a.first_name || '').localeCompare(b.first_name || '');
    });
}

export function buildBuildingMap(professors) {
    const professorsByBuilding = new Map();

    for (const prof of professors) {
        const code = prof.building;
        if (!code) continue;
        if (!professorsByBuilding.has(code)) {
            professorsByBuilding.set(code, []);
        }
        professorsByBuilding.get(code).push(prof);
    }

    for (const [code, buildingProfs] of professorsByBuilding) {
        professorsByBuilding.set(code, sortProfessorsByName(buildingProfs));
    }

    const buildingMap = new Map();

    for (const building of buildingList) {
        const buildingProfs = professorsByBuilding.get(building.code) || [];
        if (buildingProfs.length === 0) continue;
        if (!building.latitude || !building.longitude) continue;

        buildingMap.set(building.code, {
            building: building.code,
            building_name: building.name,
            latitude: building.latitude,
            longitude: building.longitude,
            professors: buildingProfs,
            professorCount: buildingProfs.length,
        });
    }

    return buildingMap;
}
