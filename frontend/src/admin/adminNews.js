document.addEventListener("DOMContentLoaded", async () => {
    const isAdmin = await requireAdmin();

    if (!isAdmin) {
        return;
    }

    loadNews();

    const form = document.getElementById("create-news-form");
    form.addEventListener("submit", createNews);
});

const NEWS_API_URL = "/api/news";

document.addEventListener("DOMContentLoaded", () => {
    loadNews();

    const form = document.getElementById("create-news-form");
    form.addEventListener("submit", createNews);
});

async function loadNews() {
    const container = document.getElementById("admin-news-container");

    try {
        const response = await fetch(NEWS_API_URL);

        if (!response.ok) {
            throw new Error("Kunne ikke hente nyheder");
        }

        const newsList = await response.json();

        container.innerHTML = "";

        if (newsList.length === 0) {
            container.innerHTML = "<p>Der findes ingen nyheder endnu.</p>";
            return;
        }

        newsList.forEach(news => {
            const newsElement = document.createElement("div");
            newsElement.classList.add("admin-news-card");

            newsElement.innerHTML = `
                <h4>${news.title}</h4>
                <p>${news.content}</p>

                ${news.imageUrl ? `<img src="${news.imageUrl}" alt="${news.title}" style="max-width: 200px;">` : ""}

                <p><strong>Dato:</strong> ${news.publishDate ? formatDate(news.publishDate) : "Ingen dato"}</p>

                <button onclick="showEditForm(${news.newsId})">Rediger</button>
                <button onclick="deleteNews(${news.newsId})">Slet</button>
            `;

            container.appendChild(newsElement);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = "<p>Der skete en fejl ved hentning af nyheder.</p>";
    }
}

async function createNews(event) {
    event.preventDefault();

    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const imageUrl = document.getElementById("imageUrl").value;

    const newNews = {
        title: title,
        content: content,
        imageUrl: imageUrl
    };

    try {
        const response = await fetch(NEWS_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newNews)
        });

        if (!response.ok) {
            throw new Error("Kunne ikke oprette nyhed");
        }

        document.getElementById("create-news-form").reset();
        loadNews();

    } catch (error) {
        console.error(error);
        alert("Nyheden kunne ikke oprettes.");
    }
}

async function deleteNews(newsId) {
    const confirmDelete = confirm("Er du sikker på, at du vil slette denne nyhed?");

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`${NEWS_API_URL}/${newsId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Kunne ikke slette nyhed");
        }

        loadNews();

    } catch (error) {
        console.error(error);
        alert("Nyheden kunne ikke slettes.");
    }
}

async function showEditForm(newsId) {
    try {
        const response = await fetch(`${NEWS_API_URL}/${newsId}`);

        if (!response.ok) {
            throw new Error("Kunne ikke hente nyheden");
        }

        const news = await response.json();

        const container = document.getElementById("admin-news-container");

        container.innerHTML = `
            <h3>Rediger nyhed</h3>

            <form id="edit-news-form">
                <input type="text" id="edit-title" value="${escapeHtml(news.title)}" required>

                <textarea id="edit-content" required>${escapeHtml(news.content)}</textarea>

                <input type="text" id="edit-imageUrl" value="${news.imageUrl ? escapeHtml(news.imageUrl) : ""}" placeholder="Billede URL">

                <button type="submit">Gem ændringer</button>
                <button type="button" onclick="loadNews()">Annuller</button>
            </form>
        `;

        document.getElementById("edit-news-form").addEventListener("submit", function(event) {
            updateNews(event, newsId);
        });

    } catch (error) {
        console.error(error);
        alert("Kunne ikke åbne redigering.");
    }
}

async function updateNews(event, newsId) {
    event.preventDefault();

    const updatedNews = {
        title: document.getElementById("edit-title").value,
        content: document.getElementById("edit-content").value,
        imageUrl: document.getElementById("edit-imageUrl").value
    };

    try {
        const response = await fetch(`${NEWS_API_URL}/${newsId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedNews)
        });

        if (!response.ok) {
            throw new Error("Kunne ikke opdatere nyhed");
        }

        loadNews();

    } catch (error) {
        console.error(error);
        alert("Nyheden kunne ikke opdateres.");
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString("da-DK");
}

function escapeHtml(text) {
    if (!text) {
        return "";
    }

    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}