let allNews =[];
async function loadNews() {
    const container = document.getElementById("news-container");

    container.innerHTML = `
        <div class="loading-state">
        <div class="spinner"></div>
        <p>Henter nyheder...</p>
    </div>
    `;

    try {
        const newsList = await fetchData("news");
        allNews = newsList;

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
        container.innerHTML = `<p class="ingen-nyheder"> Kunne ikke hente nyheder.</p>
        <button onclick="loadNews()"> Prøv igen</button>
            `
        ;
        console.error(error);
    }
}

loadNews();

const searchInput = document.getElementById("search");

searchInput.addEventListener("input", function (){
    console.log("User is typing")
})