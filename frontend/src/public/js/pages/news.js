let allNews = [];
let activeNewsQuery = "";

document.addEventListener("DOMContentLoaded", initializeNewsPage);


function initializeNewsPage() {
    const searchInput = document.getElementById("search");
    const clearButton = document.getElementById("news-search-clear");

    if (searchInput) {
        searchInput.addEventListener("input", event => {
            activeNewsQuery = event.target.value
                .trim()
                .toLocaleLowerCase("da-DK");

            updateClearButton();
            renderNews();
        });
    }

    if (clearButton) {
        clearButton.addEventListener("click", clearNewsSearch);
    }

    loadNews();
}


async function loadNews() {
    const container = document.getElementById("news-container");

    if (!container) {
        console.error("Containeren #news-container blev ikke fundet.");
        return;
    }

    showNewsLoadingState();

    try {
        const newsList = await fetchData("news");

        allNews = Array.isArray(newsList)
            ? [...newsList].sort(sortNewsByNewest)
            : [];

        renderNews();

    } catch (error) {
        console.error("Kunne ikke hente nyheder:", error);
        showNewsErrorState();
    }
}


function renderNews() {
    const container = document.getElementById("news-container");

    if (!container) {
        return;
    }

    const visibleNews = getVisibleNews();
    updateResultCount(visibleNews.length);

    if (visibleNews.length === 0) {
        showNewsEmptyState();
        return;
    }

    container.innerHTML = visibleNews
        .map((news, index) => createNewsCard(news, index))
        .join("");
}


function getVisibleNews() {
    if (!activeNewsQuery) {
        return allNews;
    }

    return allNews.filter(news => {
        const searchableText = [
            news.title,
            news.content
        ]
            .filter(Boolean)
            .join(" ")
            .toLocaleLowerCase("da-DK");

        return searchableText.includes(activeNewsQuery);
    });
}


function createNewsCard(news, index) {
    const isFeatured = index === 0 && !activeNewsQuery;
    const cardClass = isFeatured
        ? "news-card news-card-featured"
        : "news-card";

    const title = escapeHtml(news.title || "Nyhed");
    const content = escapeHtml(news.content || "");
    const date = formatNewsDate(news.publishDate);
    const image = createNewsImage(news, title);

    return `
        <article class="${cardClass}">
            <div class="news-card-media">
                ${image}
            </div>

            <div class="news-card-content">
                <div class="news-card-meta">
                    <span class="news-card-type">
                        ${isFeatured ? "Seneste nyt" : "Fra butikken"}
                    </span>

                    <time
                        class="news-date"
                        datetime="${escapeHtml(news.publishDate || "")}"
                    >
                        ${escapeHtml(date)}
                    </time>
                </div>

                <h3>${title}</h3>

                <p class="news-card-text">
                    ${content}
                </p>

                <span class="news-card-accent" aria-hidden="true"></span>
            </div>
        </article>
    `;
}


function createNewsImage(news, escapedTitle) {
    const imageUrl = normalizeNewsImageUrl(news.imageUrl);

    if (!imageUrl) {
        return `
            <div class="news-card-placeholder" aria-hidden="true">
                <span class="news-placeholder-board">S</span>
            </div>
        `;
    }

    return `
        <img
            src="${escapeHtml(imageUrl)}"
            alt="${escapedTitle}"
            loading="lazy"
        >
    `;
}


function normalizeNewsImageUrl(imageUrl) {
    const value = String(imageUrl || "").trim();

    if (!value) {
        return "";
    }

    if (
        value.startsWith("/") ||
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {
        return value;
    }

    return `/${value}`;
}


function sortNewsByNewest(firstNews, secondNews) {
    const firstDate = new Date(firstNews.publishDate || 0);
    const secondDate = new Date(secondNews.publishDate || 0);

    return secondDate.getTime() - firstDate.getTime();
}


function formatNewsDate(dateValue) {
    if (!dateValue) {
        return "Dato ikke angivet";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Dato ikke angivet";
    }

    return date.toLocaleDateString("da-DK", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


function clearNewsSearch() {
    const searchInput = document.getElementById("search");

    activeNewsQuery = "";

    if (searchInput) {
        searchInput.value = "";
        searchInput.focus();
    }

    updateClearButton();
    renderNews();
}


function updateClearButton() {
    const clearButton = document.getElementById("news-search-clear");

    if (clearButton) {
        clearButton.hidden = activeNewsQuery.length === 0;
    }
}


function updateResultCount(resultCount) {
    const resultElement = document.getElementById("news-result-count");

    if (!resultElement) {
        return;
    }

    if (allNews.length === 0) {
        resultElement.textContent = "Ingen nyheder endnu";
        return;
    }

    if (activeNewsQuery) {
        resultElement.textContent = resultCount === 1 ? "1 resultat fundet" : `${resultCount} resultater fundet`;

        return;
    }

    resultElement.textContent = allNews.length === 1 ? "1 nyhed i alt" : `${allNews.length} nyheder i alt`;
}


function showNewsLoadingState() {
    const container = document.getElementById("news-container");
    const resultElement = document.getElementById("news-result-count");

    if (resultElement) {
        resultElement.textContent = "Henter nyheder…";
    }

    if (container) {
        container.innerHTML = `
            <div class="news-loading-state">
                <span
                    class="news-loading-spinner"
                    aria-hidden="true"
                ></span>

                <strong>Henter nyheder</strong>

                <p>
                    Et øjeblik – vi finder det seneste fra Slikskoven.
                </p>
            </div>
        `;
    }
}


function showNewsEmptyState() {
    const container = document.getElementById("news-container");

    if (!container) {
        return;
    }

    const hasSearch = activeNewsQuery.length > 0;

    container.innerHTML = `
        <div class="news-empty-state">
            <span class="news-state-icon" aria-hidden="true">S</span>

            <strong>
                ${
        hasSearch ? "Ingen nyheder matcher søgningen" : "Der er ingen nyheder lige nu"
    }
            </strong>

            <p>
                ${
        hasSearch
            ? "Prøv et andet søgeord, eller ryd søgningen."
            : "Kom tilbage senere for at se nyt fra butikken."
    }
            </p>

            ${
        hasSearch
            ? `
                        <button type="button" class="news-state-button" onclick="clearNewsSearch()">
                            Ryd søgningen
                        </button>
                    `
            : ""
    }
        </div>
    `;
}


function showNewsErrorState() {
    const container = document.getElementById("news-container");
    const resultElement = document.getElementById("news-result-count");

    if (resultElement) {
        resultElement.textContent = "Nyheder kunne ikke hentes";
    }

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="news-error-state">
            <span class="news-state-icon" aria-hidden="true">!</span>

            <strong>Nyhederne kunne ikke hentes</strong>

            <p>
                Der opstod en fejl under indlæsningen.
                Prøv igen om et øjeblik.
            </p>

            <button
                type="button"
                class="news-state-button"
                onclick="loadNews()"
            >
                Prøv igen
            </button>
        </div>
    `;
}