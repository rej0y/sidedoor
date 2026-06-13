
import { buildProfessorList } from './prof-list.js';


// ----- Sample API request (temp/one-time) ----- //
// Send a fetch request to the API
const response = await fetch("http://66.112.209.106:3000/professors");
// It returns a huge string, which needs to be parsed as JSON data
const professors = await response.json();


// --- Hard-coded mock API response for testing purposes --- //
// import professors from './mock_api_response.js';


// Build out the appropriate DOM elements using the API fetch results
buildProfessorList(professors);
