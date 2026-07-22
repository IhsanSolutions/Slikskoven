const API_URL = "/api";

let cachedCsrfToken = null;

document.addEventListener("DOMContentLoaded", initializeAuthUi);


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
    const url = endpoint.startsWith("/")
        ? endpoint
        : `${API_URL}/${endpoint}`;

    const response = await apiRequest(url);

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
    const response = await apiRequest(`${API_URL}/auth/me`);

    if (!response.ok) {
        throw new Error(`Kunne ikke hente brugerstatus. HTTP-status: ${response.status}`);
    }

    return response.json();
}


async function initializeAuthUi() {
    try {
        const user = await getCurrentUser();

        showAdminOnlyElements(user);
        updateNavigation(user);

    } catch (error) {
        console.error("Kunne ikke initialisere auth UI:", error);
    }
}


async function checkAdmin() {
    try {
        const user = await getCurrentUser();

        showAdminOnlyElements(user);

    } catch (error) {
        console.error("Kunne ikke tjekke admin-status:", error);
    }
}


function showAdminOnlyElements(user) {
    document
        .querySelectorAll(".admin-only")
        .forEach(element => {
            element.style.display = user && user.admin
                ? "block"
                : "none";
        });
}


function updateNavigation(user) {
    const isAdminPage = window.location.pathname.startsWith("/admin/");

    if (isAdminPage) {
        return;
    }

    document.querySelectorAll("header nav").forEach(nav => {
        const existingAuthLinks = nav.querySelector(".auth-nav-links");

        if (existingAuthLinks) {
            existingAuthLinks.remove();
        }

        const authLinks = document.createElement("span");
        authLinks.classList.add("auth-nav-links");

        if (!user || !user.loggedIn) {
            authLinks.innerHTML = `
                <a href="/login.html">Log ind</a>
            `;

            nav.appendChild(authLinks);
            return;
        }

        if (user.admin) {
            authLinks.innerHTML = `
                <a href="/admin/adminDashboard.html">Admin-dashboard</a>
                <button type="button" onclick="logout()">Log ud</button>
            `;

            nav.appendChild(authLinks);
            return;
        }

        authLinks.innerHTML = `
            <span class="nav-user-name">${escapeHtml(user.name || user.email)}</span>
            <button type="button" onclick="logout()">Log ud</button>
        `;

        nav.appendChild(authLinks);
    });
}


async function logout() {
    try {
        const response = await apiRequest("/logout", {
            method: "POST"
        });

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
        alert(error.message || "Du kunne ikke logges ud.");
    }
}


// ==================================================
// HJÆLPEFUNKTIONER
// ==================================================

function escapeHtml(text) {
    return String(text || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}