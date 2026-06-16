
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

    // Put the actual HTML content we want into the newCard element
    // *** THIS IS VERY INCOMPLETE but functional, it will need a lot of expanding/polishing
    newCard.innerHTML = `
        <span class="prof-dept">${prof.departments}</span>
        <span class="prof-name">${prof.first_name} ${prof.last_name}</span>
        <span class="prof-loc">${prof.building} ${prof.room_number}</span>
    `
    // Finally, attach the newCard div to the DOM
    profList.appendChild(newCard);
}



