let allProducts = [];

async function loadProducts() {
    const container = document.getElementById("product-container");

    try {
        allProducts = await fetchData("products");
        showProducts(allProducts);
    } catch (error) {
        container.innerHTML = `<p class="ingen-nyheder">Kunne ikke hente produkter.</p>`;
        console.error(error);
    }
}

function showProducts(products) {
    const container = document.getElementById("product-container");

    if (products.length === 0) {
        container.innerHTML = `<p class="ingen-nyheder">Ingen produkter fundet.</p>`;
        return;
    }

    container.innerHTML = "";

    products.forEach(product => {
        const gelatineTag = product.gelatineType === "WITHOUT_GELATINE"
            ? `<span class="product-tag">🌱 Gelatinefri</span>`
            : "";

        container.innerHTML += `
            <div class="product-card">
                <h3>${product.name}</h3>
                <p>${product.description || ""}</p>
                <div class="product-price">${product.price.toFixed(2)} kr. / 100g</div>
                ${gelatineTag}
            </div>
        `;
    });
}

async function filterCategory(category) {
    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
    event.target.classList.add("active");

    if (category === "alle") {
        showProducts(allProducts);
    } else {
        try {
            const products = await fetchData(`products/category/${category}`);
            showProducts(products);
        } catch (error) {
            console.error(error);
        }
    }
}

async function filterGelatineFree() {
    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
    event.target.classList.add("active");

    try {
        const products = await fetchData("products/gelatine-free");
        showProducts(products);
    } catch (error) {
        console.error(error);
    }
}

loadProducts();