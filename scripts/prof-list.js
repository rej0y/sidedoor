
const profList = document.getElementById('prof-list');


// Creates DOM elements for each prof in the JSON list
// It currently does this in the same order the objects are given
export function buildProfessorList(professors) {
    // For each professor (which we name "prof") in the professor list:
    professors.forEach(prof => {
        buildProfessorCard(prof);
    })
}

// *** It's VERY POSSIBLE that the JSON property names will have to changed to match the actual ones!!
function buildProfessorCard(prof) {
    // Create a new blank div element to work with
    const newCard = document.createElement("div");
    // Give it the desired HTML classes
    newCard.className = "card professor-card";

    // Store the professor's database id inside the HTML element as a dataset attribute
    // This will be useful for when the user clicks on a specific professor and we want to ask the database about that professor again
    newCard.dataset.id = prof.professor_id;

    // Set the border color based on the professor's department
    const borderColor = departmentToColor(prof.departments);
    newCard.style.borderLeftColor = borderColor;

    // Put the actual HTML content we want into the newCard element
    // *** THIS IS VERY INCOMPLETE but functional, it will need a lot of expanding/polishing
    newCard.innerHTML = `
        <span class="prof-dept">${prof.departments ? prof.departments : 'Unknown'}</span>
        <span class="prof-name">${prof.first_name} ${prof.last_name}</span>
        <span class="prof-loc">${prof.building ? prof.building : 'Unknown'} ${prof.room_number ? prof.room_number : ''}</span>
    `
    // Finally, attach the newCard div to the DOM
    profList.appendChild(newCard);
}

// Maps department names to CSS color variables for visual categorization
// Tries to maximize the variety of colors used across all 6 department categories
function departmentToColor(department) {
    if (!department) {
        return 'var(--dept-other)';
    }

    const dept = department.toLowerCase();

    // ==========================================
    // CSE (Computing & Digital Technology)
    // ==========================================
    if (
        dept.includes('computer science') ||
        dept.includes('software engineering') ||
        dept.includes('cyber') ||
        dept.includes('information systems') ||
        dept.includes('network') ||
        dept.includes('database') ||
        dept.includes('web') ||
        dept.includes('cloud') ||
        dept.includes('data science') ||
        dept.includes('computer engineering') ||
        dept.includes('electrical engineering')
    ) {
        return 'var(--dept-cse)';
    }

    // ==========================================
    // STEM
    // ==========================================
    if (
        dept.includes('mathematics') ||
        dept.includes('physics') ||
        dept.includes('chemistry') ||
        dept.includes('biochemistry') ||
        dept.includes('biology') ||
        dept.includes('geology') ||
        dept.includes('environmental science') ||
        dept.includes('agriculture') ||
        dept.includes('manufacturing') ||
        dept.includes('mechanical') ||
        dept.includes('civil engineering') ||
        dept.includes('construction management') ||
        dept.includes('design and construction')
    ) {
        return 'var(--dept-stem)';
    }

    // ==========================================
    // Business
    // ==========================================
    if (
        dept.includes('business') ||
        dept.includes('accounting') ||
        dept.includes('finance') ||
        dept.includes('economics') ||
        dept.includes('marketing') ||
        dept.includes('communication')
    ) {
        return 'var(--dept-business)';
    }

    // ==========================================
    // Education
    // ==========================================
    if (
        dept.includes('education') ||
        dept.includes('special education') ||
        dept.includes('sped') ||
        dept.includes('home and family')
    ) {
        return 'var(--dept-education)';
    }

    // ==========================================
    // Humanities & Languages
    // ==========================================
    if (
        dept.includes('english') ||
        dept.includes('language') ||
        dept.includes('international studies') ||
        dept.includes('humanities') ||
        dept.includes('philosophy') ||
        dept.includes('history') ||
        dept.includes('political science')
    ) {
        return 'var(--dept-humanities)';
    }

    // ==========================================
    // Health & Social Sciences
    // ==========================================
    if (
        dept.includes('psychology') ||
        dept.includes('sociology') ||
        dept.includes('social work') ||
        dept.includes('public health') ||
        dept.includes('nursing') ||
        dept.includes('human performance') ||
        dept.includes('recreation')
    ) {
        return 'var(--dept-health)';
    }

    // ==========================================
    // Arts & Performing Arts
    // ==========================================
    if (
        dept.includes('art') ||
        dept.includes('dance') ||
        dept.includes('music') ||
        dept.includes('theatre') ||
        dept.includes('theater')
    ) {
        return 'var(--dept-arts)';
    }

    // ==========================================
    // Faculty / Staff
    // ==========================================
    if (
        dept === 'faculty' ||
        dept.includes('staff') ||
        dept.includes('administration') ||
        dept.includes('office')
    ) {
        return 'var(--dept-faculty)';
    }

    // ==========================================
    // Uncategorized / Faculty / Staff
    // ==========================================
    return 'var(--dept-other)';
}
