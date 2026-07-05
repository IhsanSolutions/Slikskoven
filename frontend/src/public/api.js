const API_URL = "/api";

document.addEventListener("DOMContentLoaded", checkAdmin);

let cachedCsrfToken = null;


// ==================================================
// CSRF
// ==================================================

async function getCsrfToken() {
    if (cachedCsrfToken) {
        return cachedCsrfToken;
    }

    const response = await fetch(`${API_URL}/auth/csrf`, {
        method: "GET",
        credentials: "same-origin",
        headers: {
            "Accept": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`Kunne ikke hente CSRF-token. HTTP-status: ${response.status}`);
    }

    const csrfToken = await response.json();

    if (
        !csrfToken.token ||
        !csrfToken.headerName ||
        !csrfToken.parameterName
    ) {
        throw new Error("Backenden returnerede et ugyldigt CSRF-token.");
    }

    cachedCsrfToken = csrfToken;

    return csrfToken;
}


function clearCsrfToken() {
    cachedCsrfToken = null;
}


function requiresCsrfToken(method) {
    const safeMethods = [
        "GET",
        "HEAD",
        "OPTIONS",
        "TRACE"
    ];

    return !safeMethods.includes(method.toUpperCase());
}


// ==================================================
// FÆLLES API-KALD
// ==================================================

async function apiRequest(url, options = {}) {
    const method = (options.method || "GET").toUpperCase();
    const headers = new Headers(options.headers || {});

    if (requiresCsrfToken(method)) {
        const csrfToken = await getCsrfToken();

        headers.set(csrfToken.headerName, csrfToken.token);
    }

    return fetch(url, {
        ...options,
        method: method,
        headers: headers,
        credentials: "same-origin"
    });
}


async function fetchData(endpoint) {
    const response = await apiRequest(`${API_URL}/${endpoint}`);

    if (!response.ok) {
        throw new Error(`Noget gik galt. HTTP-status: ${response.status}`);
    }

    return response.json();
}


async function getErrorMessage(response, fallbackMessage = "Der opstod en fejl.") {
    try {
        const errorResponse = await response.json();

        if (errorResponse.message) {
            return errorResponse.message;
        }
    } catch (error) {
        console.error("Kunne ikke læse fejlresponsen:", error);
    }

    return fallbackMessage;
}

// ==================================================
// AUTHENTICATION
// ==================================================

async function getCurrentUser() {
    const response = await apiRequest(
        `${API_URL}/auth/me`
    );

    if (!response.ok) {
        throw new Error(`Kunne ikke hente brugerstatus. HTTP-status: ${response.status}`);
    }

    return response.json();
}


async function checkAdmin() {
    try {
        const user = await getCurrentUser();

        if (!user.admin) {
            return;
        }

        document
            .querySelectorAll(".admin-only")
            .forEach(element => {
                element.style.display = "block";
            });

    } catch (error) {
        console.error(
            "Kunne ikke tjekke admin-status:",
            error
        );
    }
}


async function logout() {
    try {
        const response = await apiRequest(
            "/logout",
            {
                method: "POST"
            }
        );

        if (!response.ok) {
            const message = await getErrorMessage(
                response,
                "Du kunne ikke logges ud."
            );

            throw new Error(message);
        }

        clearCsrfToken();

        window.location.replace("/forside.html");

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}