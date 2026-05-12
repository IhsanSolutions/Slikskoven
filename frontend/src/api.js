const API_URL = "http://localhost:8080/api";

async function fetchData(endpoint) {
    const response = await fetch(`${API_URL}/${endpoint}`);
    if (!response.ok) {
        throw new Error("Noget gik galt: " + response.status);
    }
    return response.json();
}