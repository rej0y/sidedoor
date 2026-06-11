
// import { buildProfessorList} from './prof-list.js';

// /* ----- Sample API request (temp/one-time) ----- */
// // Send a fetch request to the API
// const response = await fetch(/* "https://whatever-the-api-url-is.com" */);
// // It returns a huge string, which needs to be parsed as JSON data
// const professors = await response.json();

// // Build out the appropriate DOM elements using the API fetch results
// buildProfessorList(professors);


import { buildProfessorList } from './prof-list.js';

/* ----- Sample API request (temp/one-time) ----- */

try {
    const response = await fetch(/* "https://whatever-the-api-url-is.com" */);
    const professors = await response.json();

    buildProfessorList(professors);
} catch (error) {
    console.log("API not connected yet:", error);
}

/* ==================================================
   MOBILE SECTION SWITCHING
================================================== */

const listSection = document.getElementById("list-section");
const mapSection = document.getElementById("map-section");

const listBtn = document.getElementById("list-section-tab");
const mapBtn = document.getElementById("map-section-tab");

function showList() {
    listSection.classList.remove("mobile-hidden");
    mapSection.classList.add("mobile-hidden");
}

function showMap() {
    mapSection.classList.remove("mobile-hidden");
    listSection.classList.add("mobile-hidden");
}

/* Only activate on mobile */

if (window.innerWidth <= 900) {

    // Start on list view
    showList();

    listBtn?.addEventListener("click", showList);
    mapBtn?.addEventListener("click", showMap);
}