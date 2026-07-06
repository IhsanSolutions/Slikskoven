const NEWS_API_URL = "/api/news";

document.addEventListener("DOMContentLoaded", async () => {
    const isAdmin = await requireAdmin();

    if (!isAdmin) {
        return;
    }

    const form = document.getElementById("create-news-form");

    if (!form) {
        console.error("Formularen #create-news-form blev ikke fundet.");
        return;
    }

    form.addEventListener("submit", createNews);

    await loadNews();
});


async function loadNews() {
    const container = document.getElementById("admin-news-container");

    if (!container) {
        console.error("Containeren #admin-news-container blev ikke fundet.");
        return;
    }

    container.innerHTML = "<p>Henter nyheder...</p>";

    try {
        const response = await apiRequest(NEWS_API_URL);

        if (!response.ok) {
            throw await createApiError(response, "Kunne ikke hente nyheder.");
        }

        const newsList = await response.json();

        container.innerHTML = "";

        if (!Array.isArray(newsList) || newsList.length === 0) {
            container.innerHTML = "<p>Der findes ingen nyheder endnu.</p>";
            return;
        }

        newsList.forEach(news => {
            const newsElement = document.createElement("div");
            newsElement.classList.add("admin-news-card");

            newsElement.innerHTML = `
                <h4>${escapeHtml(news.title)}</h4>

                <p>${escapeHtml(news.content)}</p>

                ${
                news.imageUrl
                    ? `<img src="${escapeHtml(news.imageUrl)}"
                                alt="${escapeHtml(news.title)}"
                                style="max-width: 200px;">`
                    : ""
            }

                <p>
                    <strong>Dato:</strong>
                    ${news.publishDate ? formatDate(news.publishDate) : "Ingen dato"}
                </p>

                <button type="button" onclick="showEditForm(${news.newsId})">Rediger</button>

                <button type="button" onclick="deleteNews(${news.newsId})">Slet</button>
            `;

            container.appendChild(newsElement);
        });

    } catch (error) {
        console.error("Fejl ved hentning af nyheder:", error);

        if (handleAuthorizationError(error)) {
            return;
        }

        container.innerHTML = `
            <p>${escapeHtml(error.message || "Der skete en fejl ved hentning af nyheder.")}</p>
        `;
    }
}


async function createNews(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const submitButton = form.querySelector('button[type="submit"]');

    const newNews = {
        title: document.getElementById("title").value.trim(),
        content: document.getElementById("content").value.trim(),
        imageUrl: document.getElementById("imageUrl").value.trim()
    };

    setButtonLoading(submitButton, true, "Opretter...");

    try {
        const response = await apiRequest(NEWS_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newNews)
        });

        if (!response.ok) {
            throw await createApiError(response, "Kunne ikke oprette nyheden.");
        }

        form.reset();

        await loadNews();

    } catch (error) {
        console.error("Fejl ved oprettelse af nyhed:", error);

        if (!handleAuthorizationError(error)) {
            alert(error.message || "Nyheden kunne ikke oprettes.");
        }

    } finally {
        setButtonLoading(submitButton, false);
    }
}


async function deleteNews(newsId) {
    const confirmDelete = confirm("Er du sikker på, at du vil slette denne nyhed?");

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await apiRequest(`${NEWS_API_URL}/${newsId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw await createApiError(response, "Kunne ikke slette nyheden.");
        }

        await loadNews();

    } catch (error) {
        console.error("Fejl ved sletning af nyhed:", error);

        if (!handleAuthorizationError(error)) {
            alert(error.message || "Nyheden kunne ikke slettes.");
        }
    }
}


async function showEditForm(newsId) {
    try {
        const response = await apiRequest(`${NEWS_API_URL}/${newsId}`);

        if (!response.ok) {
            throw await createApiError(response, "Kunne ikke hente nyheden.");
        }

        const news = await response.json();

        const container = document.getElementById("admin-news-container");

        container.innerHTML = `
            <h3>Rediger nyhed</h3>

            <form id="edit-news-form">
                <input type="text" id="edit-title" value="${escapeHtml(news.title)}" required>

                <textarea
                    id="edit-content"
                    required
                >${escapeHtml(news.content)}</textarea>

                <input
                    type="text"
                    id="edit-imageUrl"
                    value="${escapeHtml(news.imageUrl || "")}"
                    placeholder="Billede URL"
                >

                <button type="submit">Gem ændringer</button>

                <button type="button" id="cancel-edit-button">Annuller</button>
            </form>
        `;

        document
            .getElementById("edit-news-form")
            .addEventListener("submit", event => updateNews(event, newsId));

        document
            .getElementById("cancel-edit-button")
            .addEventListener("click", loadNews);

    } catch (error) {
        console.error("Fejl ved åbning af redigering:", error);

        if (!handleAuthorizationError(error)) {
            alert(error.message || "Kunne ikke åbne redigering.");
        }
    }
}


async function updateNews(event, newsId) {
    event.preventDefault();

    const form = event.currentTarget;
    const submitButton = form.querySelector('button[type="submit"]');

    const updatedNews = {
        title: document.getElementById("edit-title").value.trim(),
        content: document.getElementById("edit-content").value.trim(),
        imageUrl: document.getElementById("edit-imageUrl").value.trim()
    };

    setButtonLoading(submitButton, true, "Gemmer...");

    try {
        const response = await apiRequest(`${NEWS_API_URL}/${newsId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedNews)
        });

        if (!response.ok) {
            throw await createApiError(response, "Kunne ikke opdatere nyheden.");
        }

        await loadNews();

    } catch (error) {
        console.error("Fejl ved opdatering af nyhed:", error);

        if (!handleAuthorizationError(error)) {
            alert(error.message || "Nyheden kunne ikke opdateres.");
        }

    } finally {
        setButtonLoading(submitButton, false);
    }
}


async function createApiError(response, fallbackMessage) {
    let message = fallbackMessage;

    if (typeof getErrorMessage === "function") {
        message = await getErrorMessage(response, fallbackMessage);
    }

    const error = new Error(message);
    error.status = response.status;

    return error;
}


function handleAuthorizationError(error) {
    if (error.status === 401) {
        alert("Din session er udløbet. Log ind igen.");
        window.location.replace("/login.html");
        return true;
    }

    if (error.status === 403) {
        alert("Du har ikke administratoradgang til denne handling.");
        window.location.replace("/forside.html");
        return true;
    }

    return false;
}


function setButtonLoading(button, isLoading, loadingText = "") {
    if (!button) {
        return;
    }

    if (isLoading) {
        button.dataset.originalText = button.textContent;
        button.disabled = true;
        button.textContent = loadingText;
        return;
    }

    button.disabled = false;
    button.textContent = button.dataset.originalText || button.textContent;
    delete button.dataset.originalText;
}


function formatDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Ugyldig dato";
    }

    return date.toLocaleString("da-DK");
}


function escapeHtml(text) {
    return String(text || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}