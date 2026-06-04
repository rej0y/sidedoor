
import { buildProfessorList } from './prof-list.js';

/*
// ----- Sample API request (temp/one-time) ----- //
// Send a fetch request to the API
const response = await fetch("https://whatever-the-api-url-is.com");
// It returns a huge string, which needs to be parsed as JSON data
const professors = await response.json();
*/

// --- Temporarily using this mock API response instead --- //
import professors from './mock_api_response.js';


// Build out the appropriate DOM elements using the API fetch results
buildProfessorList(professors);
