async function loadNews() {
    const container = document.getElementById("news-container");

    try {
        const newsList = await fetchData("news");

        if (newsList.length === 0) {
            container.innerHTML = `<p class="ingen-nyheder">Der er ingen nyheder lige nu.</p>`;
            return;
        }

        container.innerHTML = "";

        newsList.forEach(news => {
            const dato = new Date(news.publishDate).toLocaleDateString("da-DK", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });

            const billede = news.imageUrl
                ? `<img src="${news.imageUrl}" alt="${news.title}">`
                : "";

            container.innerHTML += `
                <div class="news-card">
                    ${billede}
                    <div class="news-card-body">
                        <h3>${news.title}</h3>
                        <p>${news.content}</p>
                        <span class="news-date">${dato}</span>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        container.innerHTML = `<p class="ingen-nyheder">Kunne ikke hente nyheder.</p>`;
        console.error(error);
    }
}

loadNews();