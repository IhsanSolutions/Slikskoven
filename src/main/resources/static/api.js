const API_URL = "http://localhost:8080/api";

async function fetchData(endpoint) {
    const response = await fetch(`${API_URL}/${endpoint}`);
    if (!response.ok) {
        throw new Error("Noget gik galt: " + response.status);
    }
    return response.json();
}

async function checkAdmin() {
    try {
        const response = await fetch("/api/auth/me");
        const user = await response.json();

        if (user.admin) {
            document.querySelectorAll(".admin-only").forEach(element => {
                element.style.display = "block";
            });
        }
    } catch (error) {
        console.error("Kunne ikke tjekke admin-status:", error);
    }
}

checkAdmin();