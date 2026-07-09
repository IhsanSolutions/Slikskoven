let allProducts = [];


async function loadProducts() {
    const container = document.getElementById("product-container");

    try {
        allProducts = await fetchData("products");
        showProducts(allProducts);

    } catch (error) {
        container.innerHTML = `
            <p class="ingen-nyheder">
                Kunne ikke hente produkter.
            </p>
        `;

        console.error(error);
    }
}


function showProducts(products) {
    const container = document.getElementById("product-container");

    if (!Array.isArray(products) || products.length === 0) {
        container.innerHTML = `
            <p class="ingen-nyheder">
                Ingen produkter fundet.
            </p>
        `;

        return;
    }

    container.innerHTML = "";

    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");

        const clickArea = document.createElement("div");
        clickArea.classList.add("product-card-click-area");

        clickArea.addEventListener("click", () => {
            openProductModal(product.productId);
        });

        const imageUrl = normalizeImageUrl(product.imageUrl);

        const imageHtml = imageUrl
            ? `
                <div class="product-image-wrapper">
                    <img
                        class="product-image"
                        src="${escapeHtml(imageUrl)}"
                        alt="${escapeHtml(product.name)}"
                        loading="lazy"
                    >
                </div>
            `
            : "";

        const gelatineTag = product.gelatineType === "WITHOUT_GELATINE"
            ? `<span class="product-tag">Vegansk</span>`
            : "";

        clickArea.innerHTML = `
            ${imageHtml}

            <h3>${escapeHtml(product.name)}</h3>

            <p>${escapeHtml(product.description || "")}</p>

            <div class="product-price">
                ${formatPrice(product.price)} kr. / 100g
            </div>

            ${gelatineTag}
        `;

        const addButton = document.createElement("button");
        addButton.classList.add("add-to-bag-btn");
        addButton.type = "button";
        addButton.textContent = "Tilføj til pose";

        addButton.addEventListener("click", event => {
            addToBag(event, product.productId);
        });

        productCard.appendChild(clickArea);
        productCard.appendChild(addButton);

        container.appendChild(productCard);
    });
}


function addToBag(event, productId) {
    event.stopPropagation();

    const product = allProducts.find(
        p => String(p.productId) === String(productId)
    );

    if (!product) {
        return;
    }

    let bag = JSON.parse(
        localStorage.getItem("slikpose")
    ) || [];

    const existing = bag.find(
        item => String(item.productId) === String(productId)
    );

    if (existing) {
        existing.quantityGrams += 100;

    } else {
        bag.push({
            productId: product.productId,
            name: product.name,
            price: product.price,
            imageUrl: normalizeImageUrl(product.imageUrl),
            quantityGrams: 100
        });
    }

    localStorage.setItem(
        "slikpose",
        JSON.stringify(bag)
    );

    showToast(`${product.name} blev tilføjet til din pose!`);
}


function openProductModal(productId) {
    const product = allProducts.find(
        p => String(p.productId) === String(productId)
    );

    if (!product) {
        return;
    }

    const modal = document.getElementById("product-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalDetails = document.getElementById("modal-details");

    const imageUrl = normalizeImageUrl(product.imageUrl);

    const imageHtml = imageUrl
        ? `
            <img
                class="modal-product-image"
                src="${escapeHtml(imageUrl)}"
                alt="${escapeHtml(product.name)}"
            >
        `
        : "";

    const gelatineLabel = formatGelatineType(product.gelatineType);

    const stockLabel = product.stockQuantity > 0
        ? `På lager (${product.stockQuantity} enheder)`
        : "Ikke på lager";

    modalTitle.textContent = product.name;

    modalDetails.innerHTML = `
        ${imageHtml}

        <div class="modal-section">
            <h4>Beskrivelse</h4>
            <p>${escapeHtml(product.description || "Ingen beskrivelse tilgængelig")}</p>
        </div>

        <div class="modal-section">
            <h4>Produktinformation</h4>

            <div class="modal-info">
                <div class="info-item">
                    <strong>Pris:</strong>
                    <span>${formatPrice(product.price)} kr. / 100g</span>
                </div>

                <div class="info-item">
                    <strong>Kategori:</strong>
                    <span>${escapeHtml(formatCategory(product.category))}</span>
                </div>

                <div class="info-item">
                    <strong>Gelatine:</strong>
                    <span>${escapeHtml(gelatineLabel)}</span>
                </div>

                <div class="info-item">
                    <strong>Lager:</strong>
                    <span>${escapeHtml(stockLabel)}</span>
                </div>
            </div>
        </div>
    `;

    modal.style.display = "block";
}


function closeProductModal() {
    const modal = document.getElementById("product-modal");
    modal.style.display = "none";
}


window.onclick = function(event) {
    const modal = document.getElementById("product-modal");

    if (event.target === modal) {
        modal.style.display = "none";
    }
};


function updateActiveButton(category) {
    document.querySelectorAll(".category-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    const activeBtn = document.querySelector(
        `[data-category="${category}"]`
    );

    if (activeBtn) {
        activeBtn.classList.add("active");
    }
}


async function filterCategory(category) {
    updateActiveButton(category);

    if (category === "alle") {
        showProducts(allProducts);
        return;
    }

    try {
        const products = await fetchData(
            `products/category/${category}`
        );

        showProducts(products);

    } catch (error) {
        console.error(error);
    }
}


async function filterGelatineFree() {
    updateActiveButton("gelatine-free");

    try {
        const products = await fetchData(
            "products/gelatine-free"
        );

        showProducts(products);

    } catch (error) {
        console.error(error);
    }
}


function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}


function normalizeImageUrl(imageUrl) {
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


function formatPrice(price) {
    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
        return "0.00";
    }

    return numericPrice.toFixed(2);
}


function escapeHtml(text) {
    return String(text || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatCategory(category) {
    const categories = {
        CANDY: "Slik",
        ICE_CREAM: "Is",
        COFFEE: "Kaffe",
        SLUSH_ICE: "Slush ice",
        SOFT_ICE: "Softice",
        BLAND_SELV: "Bland selv",
        PANCAKE: "Pandekager",
        BEN_AND_JERRYS: "Ben & Jerry's"
    };

    return categories[category] || category || "";
}


function formatGelatineType(gelatineType) {
    const gelatineTypes = {
        WITH_GELATINE: "Med gelatine",
        WITHOUT_GELATINE: "Uden gelatine"
    };

    return gelatineTypes[gelatineType] || gelatineType || "";
}

loadProducts();