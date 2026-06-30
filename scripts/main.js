import { API_BASE_URL } from './config.js';
import { buildProfessorList } from './prof-list.js';

const response = await fetch(`${API_BASE_URL}/professors`);

if (!response.ok) {
    throw new Error(`Failed to fetch professors: ${response.status}`);
}

const professors = await response.json();

buildProfessorList(professors);