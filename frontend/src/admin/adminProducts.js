const PRODUCTS_API_URL = "/api/products";

document.addEventListener("DOMContentLoaded", async () => {
    const isAdmin = await requireAdmin();

    if (!isAdmin) {
        return;
    }

    const form = document.getElementById("create-product-form");

    if (!form) {
        console.error("Formularen #create-product-form blev ikke fundet.");
        return;
    }

    form.addEventListener("submit", createProduct);

    await loadProducts();
});


async function loadProducts() {
    const container = document.getElementById("admin-products-container");

    if (!container) {
        console.error("Containeren #admin-products-container blev ikke fundet.");
        return;
    }

    container.innerHTML = "<p>Henter produkter...</p>";

    try {
        const response = await apiRequest(PRODUCTS_API_URL);

        if (!response.ok) {
            throw await createApiError(response, "Kunne ikke hente produkter.");
        }

        const products = await response.json();

        container.innerHTML = "";

        if (!Array.isArray(products) || products.length === 0) {
            container.innerHTML = "<p>Der findes ingen produkter endnu.</p>";
            return;
        }

        products.forEach(product => {
            const productElement = document.createElement("div");
            productElement.classList.add("admin-product-card");

            const image = product.imageUrl
                ? `<img
                        src="${escapeHtml(product.imageUrl)}"
                        alt="${escapeHtml(product.name)}"
                        style="max-width: 160px;"
                   >`
                : "";

            productElement.innerHTML = `
                <h4>${escapeHtml(product.name)}</h4>

                ${image}

                <p>${escapeHtml(product.description || "")}</p>

                <p>
                    <strong>Pris:</strong>
                    ${formatPrice(product.price)} kr. / 100g
                </p>

                <p>
                    <strong>Lager:</strong>
                    ${product.stockQuantity ?? 0}
                </p>

                <p>
                    <strong>Kategori:</strong>
                    ${escapeHtml(product.category)}
                </p>

                <p>
                    <strong>Gelatine:</strong>
                    ${escapeHtml(product.gelatineType)}
                </p>

                <p>
                    <strong>Synlig:</strong>
                    ${product.isAvailable ? "Ja" : "Nej"}
                </p>

                <button type="button" onclick="showEditForm(${product.productId})">Rediger</button>

                <button type="button" onclick="deleteProduct(${product.productId})">Slet</button>
            `;

            container.appendChild(productElement);
        });

    } catch (error) {
        console.error("Fejl ved hentning af produkter:", error);

        if (handleAuthorizationError(error)) {
            return;
        }

        container.innerHTML = `
            <p>${escapeHtml(error.message || "Kunne ikke hente produkter.")}</p>
        `;
    }
}


async function createProduct(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const submitButton = form.querySelector('button[type="submit"]');

    const product = {
        name: document.getElementById("name").value.trim(),
        description: document.getElementById("description").value.trim(),
        price: Number(document.getElementById("price").value),
        stockQuantity: Number(document.getElementById("stockQuantity").value),
        imageUrl: document.getElementById("imageUrl").value.trim(),
        category: document.getElementById("category").value,
        gelatineType: document.getElementById("gelatineType").value
    };

    if (!validateProduct(product)) {
        return;
    }

    setButtonLoading(submitButton, true, "Opretter...");

    try {
        const response = await apiRequest(PRODUCTS_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(product)
        });

        if (!response.ok) {
            throw await createApiError(response, "Kunne ikke oprette produktet.");
        }

        form.reset();

        await loadProducts();

    } catch (error) {
        console.error("Fejl ved oprettelse af produkt:", error);

        if (!handleAuthorizationError(error)) {
            alert(error.message || "Produktet kunne ikke oprettes.");
        }

    } finally {
        setButtonLoading(submitButton, false);
    }
}


async function showEditForm(productId) {
    try {
        const response = await apiRequest(`${PRODUCTS_API_URL}/${productId}`);

        if (!response.ok) {
            throw await createApiError(response, "Kunne ikke hente produktet.");
        }

        const product = await response.json();

        const container = document.getElementById("admin-products-container");

        container.innerHTML = `
            <h3>Rediger produkt</h3>

            <form id="edit-product-form">
                <input
                    type="text"
                    id="edit-name"
                    value="${escapeHtml(product.name)}"
                    required
                >

                <textarea id="edit-description">${escapeHtml(product.description || "")}</textarea>

                <input
                    type="number"
                    id="edit-price"
                    value="${product.price}"
                    step="0.01"
                    min="0"
                    required
                >

                <input
                    type="number"
                    id="edit-stockQuantity"
                    value="${product.stockQuantity ?? 0}"
                    min="0"
                    required
                >

                <input
                    type="text"
                    id="edit-imageUrl"
                    value="${escapeHtml(product.imageUrl || "")}"
                    placeholder="Billede URL"
                >

                <select id="edit-category" required>
                    ${categoryOption("CANDY", "Slik", product.category)}
                    ${categoryOption("ICE_CREAM", "Is", product.category)}
                    ${categoryOption("COFFEE", "Kaffe", product.category)}
                    ${categoryOption("SLUSH_ICE", "Slush ice", product.category)}
                    ${categoryOption("SOFT_ICE", "Softice", product.category)}
                    ${categoryOption("BLAND_SELV", "Bland selv", product.category)}
                    ${categoryOption("PANCAKE", "Pandekager", product.category)}
                    ${categoryOption("BEN_AND_JERRYS", "Ben & Jerry's", product.category)}
                </select>

                <select id="edit-gelatineType" required>
                    ${gelatineOption("WITH_GELATINE", "Med gelatine", product.gelatineType)}
                    ${gelatineOption("WITHOUT_GELATINE", "Uden gelatine", product.gelatineType)}
                </select>

                <label>
                    <input
                        type="checkbox"
                        id="edit-isAvailable"
                        ${product.isAvailable ? "checked" : ""}
                    >
                    Produktet skal vises offentligt
                </label>

                <button type="submit">Gem ændringer</button>

                <button type="button" id="cancel-edit-button">Annuller</button>
            </form>
        `;

        document
            .getElementById("edit-product-form")
            .addEventListener("submit", event => updateProduct(event, productId));

        document
            .getElementById("cancel-edit-button")
            .addEventListener("click", loadProducts);

    } catch (error) {
        console.error("Fejl ved åbning af redigering:", error);

        if (!handleAuthorizationError(error)) {
            alert(error.message || "Kunne ikke åbne redigering.");
        }
    }
}


async function updateProduct(event, productId) {
    event.preventDefault();

    const form = event.currentTarget;
    const submitButton = form.querySelector('button[type="submit"]');

    const product = {
        name: document.getElementById("edit-name").value.trim(),
        description: document.getElementById("edit-description").value.trim(),
        price: Number(document.getElementById("edit-price").value),
        stockQuantity: Number(document.getElementById("edit-stockQuantity").value),
        imageUrl: document.getElementById("edit-imageUrl").value.trim(),
        category: document.getElementById("edit-category").value,
        gelatineType: document.getElementById("edit-gelatineType").value,
        isAvailable: document.getElementById("edit-isAvailable").checked
    };

    if (!validateProduct(product)) {
        return;
    }

    setButtonLoading(submitButton, true, "Gemmer...");

    try {
        const response = await apiRequest(`${PRODUCTS_API_URL}/${productId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(product)
        });

        if (!response.ok) {
            throw await createApiError(response, "Kunne ikke opdatere produktet.");
        }

        await loadProducts();

    } catch (error) {
        console.error("Fejl ved opdatering af produkt:", error);

        if (!handleAuthorizationError(error)) {
            alert(error.message || "Produktet kunne ikke opdateres.");
        }

    } finally {
        setButtonLoading(submitButton, false);
    }
}


async function deleteProduct(productId) {
    const confirmDelete = confirm("Er du sikker på, at du vil slette dette produkt?");

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await apiRequest(`${PRODUCTS_API_URL}/${productId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw await createApiError(response, "Kunne ikke slette produktet.");
        }

        await loadProducts();

    } catch (error) {
        console.error("Fejl ved sletning af produkt:", error);

        if (!handleAuthorizationError(error)) {
            alert(error.message || "Produktet kunne ikke slettes.");
        }
    }
}


function validateProduct(product) {
    if (!product.name) {
        alert("Produktnavn skal udfyldes.");
        return false;
    }

    if (product.price < 0 || Number.isNaN(product.price)) {
        alert("Pris skal være 0 eller højere.");
        return false;
    }

    if (product.stockQuantity < 0 || Number.isNaN(product.stockQuantity)) {
        alert("Lagerantal skal være 0 eller højere.");
        return false;
    }

    if (!Number.isInteger(product.stockQuantity)) {
        alert("Lagerantal skal være et helt tal.");
        return false;
    }

    if (!product.category) {
        alert("Kategori skal vælges.");
        return false;
    }

    if (!product.gelatineType) {
        alert("Gelatinetype skal vælges.");
        return false;
    }

    return true;
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


function formatPrice(price) {
    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
        return "0.00";
    }

    return numericPrice.toFixed(2);
}


function categoryOption(value, label, selectedValue) {
    return `
        <option
            value="${escapeHtml(value)}"
            ${value === selectedValue ? "selected" : ""}
        >
            ${escapeHtml(label)}
        </option>
    `;
}


function gelatineOption(value, label, selectedValue) {
    return `
        <option
            value="${escapeHtml(value)}"
            ${value === selectedValue ? "selected" : ""}
        >
            ${escapeHtml(label)}
        </option>
    `;
}


function escapeHtml(text) {
    return String(text || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
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