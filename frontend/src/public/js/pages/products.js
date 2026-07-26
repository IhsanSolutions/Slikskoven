let allProducts = [];

const PRODUCT_CATEGORY_KEYS = new Set([
    "BLAND_SELV",
    "CANDY",
    "ICE_CREAM",
    "SOFT_ICE",
    "SLUSH_ICE",
    "COFFEE",
    "PANCAKE",
    "BEN_AND_JERRYS"
]);


async function initializeProductsPage() {
    await loadProducts();

    window.addEventListener(
        "popstate",
        applyCatalogStateFromUrl
    );
}


async function loadProducts() {
    const container = document.getElementById("product-container");

    if (!container) {
        console.error("Containeren #product-container blev ikke fundet.");
        return;
    }

    try {
        const products = await fetchData("products");

        allProducts = Array.isArray(products)
            ? products
            : [];

        applyCatalogStateFromUrl();

    } catch (error) {
        container.innerHTML = `
            <p class="ingen-nyheder">
                Kunne ikke hente produkter.
            </p>
        `;

        console.error(error);
    }
}


function applyCatalogStateFromUrl() {
    const parameters =
        new URLSearchParams(window.location.search);

    const category =
        parameters
            .get("category")
            ?.trim()
            .toUpperCase();

    const filter =
        parameters
            .get("filter")
            ?.trim()
            .toLowerCase();

    if (filter === "gelatine-free") {
        filterGelatineFree({
            updateUrl: false
        });

        return;
    }

    if (
        category &&
        PRODUCT_CATEGORY_KEYS.has(category)
    ) {
        filterCategory(category, {
            updateUrl: false
        });

        return;
    }

    filterCategory("alle", {
        updateUrl: false
    });
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
                        onerror="handleBrokenProductImage(this)"
                    >
                </div>
            `
            : createProductImagePlaceholder(product.name);

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

    const quantityToAdd = isWeightedProduct(product) ? 100 : 1;

    let bag = JSON.parse(localStorage.getItem("slikpose")) || [];

    const existing = bag.find(item =>
            String(item.productId) ===
            String(productId)
    );

    if (existing) {
        existing.quantity = getStoredQuantity(existing, product.category) + quantityToAdd;
        existing.category = product.category;
        existing.imageUrl = normalizeImageUrl(product.imageUrl);

        delete existing.quantityGrams;

    } else {
        bag.push({
            productId: product.productId,
            name: product.name,
            price: product.price,
            category: product.category,
            imageUrl: normalizeImageUrl(product.imageUrl),
            quantity: quantityToAdd
        });
    }

    localStorage.setItem("slikpose", JSON.stringify(bag));

    showToast(`${product.name} blev tilføjet til din pose!`);
}


function openProductModal(productId) {
    const product = allProducts.find(p => String(p.productId) === String(productId));

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
                onerror="this.remove()"
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
                    <span>${formatProductPrice(product)}</span>
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
    document
        .querySelectorAll(".category-btn")
        .forEach(button => {
            const isActive =
                button.dataset.category === category;

            button.classList.toggle(
                "active",
                isActive
            );

            button.setAttribute(
                "aria-pressed",
                String(isActive)
            );
        });
}


function filterCategory(category, options = {}) {
    const {
        updateUrl = true
    } = options;

    const selectedCategory =
        category === "alle" ||
        PRODUCT_CATEGORY_KEYS.has(category)
            ? category
            : "alle";

    updateActiveButton(selectedCategory);

    const visibleProducts =
        selectedCategory === "alle"
            ? allProducts
            : allProducts.filter(
                product =>
                    product.category === selectedCategory
            );

    showProducts(visibleProducts);

    if (updateUrl) {
        updateCatalogUrl({
            category:
                selectedCategory === "alle"
                    ? ""
                    : selectedCategory
        });
    }
}


function filterGelatineFree(options = {}) {
    const {
        updateUrl = true
    } = options;

    updateActiveButton("gelatine-free");

    const visibleProducts =
        allProducts.filter(
            product =>
                product.gelatineType ===
                "WITHOUT_GELATINE"
        );

    showProducts(visibleProducts);

    if (updateUrl) {
        updateCatalogUrl({
            filter: "gelatine-free"
        });
    }
}


function updateCatalogUrl({
                              category = "",
                              filter = ""
                          } = {}) {
    const url = new URL(window.location.href);

    url.searchParams.delete("category");
    url.searchParams.delete("filter");

    if (category) {
        url.searchParams.set(
            "category",
            category
        );
    }

    if (filter) {
        url.searchParams.set(
            "filter",
            filter
        );
    }

    url.hash = "product-catalog";

    const nextUrl = `${url.pathname}${url.search}${url.hash}`;

    const currentUrl =
        `${window.location.pathname}` +
        `${window.location.search}` +
        `${window.location.hash}`;

    if (nextUrl !== currentUrl) {
        window.history.pushState(
            {},
            "",
            nextUrl
        );
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

function createProductImagePlaceholder(productName = "Produkt") {
    const firstLetter = String(productName || "P")
        .charAt(0)
        .toUpperCase();

    return `
        <div class="product-image-wrapper product-image-placeholder">
            <span aria-hidden="true">
                ${escapeHtml(firstLetter)}
            </span>
        </div>
    `;
}


function handleBrokenProductImage(imageElement) {
    const wrapper = imageElement.closest(".product-image-wrapper");

    if (!wrapper) {
        imageElement.remove();
        return;
    }

    const productCard = imageElement.closest(".product-card");
    const productName =
        productCard?.querySelector("h3")?.textContent || "Produkt";

    wrapper.outerHTML = createProductImagePlaceholder(productName);
}


function normalizeImageUrl(imageUrl) {
    const value = String(imageUrl || "").trim();

    if (!value) {
        return "";
    }

    if (
        value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/assets/")
    ) {
        return value;
    }

    if (value.startsWith("assets/")) {
        return `/${value}`;
    }

    const isImageFilename = /\.(png|jpe?g|webp|gif)$/i.test(value);

    if (isImageFilename && !value.includes("/")) {
        return `/assets/products/${value}`;
    }

    return "";
}


function formatPrice(price) {
    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
        return "0.00";
    }

    return numericPrice.toFixed(2);
}

function formatProductPrice(product) {
    const price = formatPrice(product?.price);

    if (product?.category === "BLAND_SELV") {
        return `${price} kr. / 100 g`;
    }

    return `${price} kr.`;
}

function isWeightedProduct(product) {
    return product?.category === "BLAND_SELV";
}


function getStoredQuantity(item, category) {
    const currentQuantity = Number(item?.quantity);

    if (Number.isFinite(currentQuantity) && currentQuantity > 0) {
        return currentQuantity;
    }

    const legacyQuantity = Number(item?.quantityGrams);

    if (!Number.isFinite(legacyQuantity) || legacyQuantity <= 0) {
        return category === "BLAND_SELV" ? 100 : 1;
    }

    if (category === "BLAND_SELV") {
        return legacyQuantity;
    }

    return Math.max(1, Math.round(legacyQuantity / 100));
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

initializeProductsPage();