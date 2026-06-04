
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

    // Store useful data from the professor JSON object as HTML dataset attributes
    // Most of the data will be stored in the DOM somewhere already as there own elements, generated below
    newCard.dataset.id = prof.id;
    newCard.dataset.dept = prof.department; // ("department" just makes more sense than "college" tbh)

    // Put the actual HTML content we want into the newCard element
    // *** THIS IS VERY INCOMPLETE but functional, it will need a lot of expanding/polishing
    newCard.innerHTML = `
        <span class="prof-title">${prof.title}</span>
        <span class="prof-name">${prof.name}</span>
        <span class="prof-loc">${prof.office_location}</span>
    `
    // Finally, attach the newCard div to the DOM
    profList.appendChild(newCard);
}



