document.addEventListener("DOMContentLoaded", async () => {
    const isAdmin = await requireAdmin();

    if (!isAdmin) {
        return;
    }

    loadProducts();

    const form = document.getElementById("create-product-form");
    form.addEventListener("submit", createProduct);
});

async function loadProducts() {
    const container = document.getElementById("admin-products-container");

    try {
        const response = await fetch("/api/products");

        if (!response.ok) {
            throw new Error("Kunne ikke hente produkter");
        }

        const products = await response.json();

        container.innerHTML = "";

        if (products.length === 0) {
            container.innerHTML = "<p>Der findes ingen produkter endnu.</p>";
            return;
        }

        products.forEach(product => {
            const productElement = document.createElement("div");
            productElement.classList.add("admin-product-card");

            const image = product.imageUrl
                ? `<img src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.name)}" style="max-width: 160px;">`
                : "";

            productElement.innerHTML = `
                <h4>${escapeHtml(product.name)}</h4>
                ${image}
                <p>${escapeHtml(product.description || "")}</p>
                <p><strong>Pris:</strong> ${Number(product.price).toFixed(2)} kr. / 100g</p>
                <p><strong>Lager:</strong> ${product.stockQuantity ?? 0}</p>
                <p><strong>Kategori:</strong> ${product.category}</p>
                <p><strong>Gelatine:</strong> ${product.gelatineType}</p>
                <p><strong>Synlig:</strong> ${product.isAvailable ? "Ja" : "Nej"}</p>

                <button onclick="showEditForm(${product.productId})">Rediger</button>
                <button onclick="deleteProduct(${product.productId})">Slet</button>
            `;

            container.appendChild(productElement);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = "<p>Kunne ikke hente produkter.</p>";
    }
}

async function createProduct(event) {
    event.preventDefault();

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

    try {
        const response = await fetch("/api/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(product)
        });

        if (!response.ok) {
            throw new Error("Kunne ikke oprette produkt");
        }

        document.getElementById("create-product-form").reset();
        loadProducts();

    } catch (error) {
        console.error(error);
        alert("Produktet kunne ikke oprettes.");
    }
}

async function showEditForm(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);

        if (!response.ok) {
            throw new Error("Kunne ikke hente produkt");
        }

        const product = await response.json();

        const container = document.getElementById("admin-products-container");

        container.innerHTML = `
            <h3>Rediger produkt</h3>

            <form id="edit-product-form">
                <input type="text" id="edit-name" value="${escapeHtml(product.name)}" required>

                <textarea id="edit-description">${escapeHtml(product.description || "")}</textarea>

                <input type="number" id="edit-price" value="${product.price}" step="0.01" min="0" required>

                <input type="number" id="edit-stockQuantity" value="${product.stockQuantity ?? 0}" min="0" required>

                <input type="text" id="edit-imageUrl" value="${escapeHtml(product.imageUrl || "")}" placeholder="Billede URL">

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
                    <input type="checkbox" id="edit-isAvailable" ${product.isAvailable ? "checked" : ""}>
                    Produktet skal vises offentligt
                </label>

                <button type="submit">Gem ændringer</button>
                <button type="button" onclick="loadProducts()">Annuller</button>
            </form>
        `;

        document.getElementById("edit-product-form").addEventListener("submit", function(event) {
            updateProduct(event, productId);
        });

    } catch (error) {
        console.error(error);
        alert("Kunne ikke åbne redigering.");
    }
}

async function updateProduct(event, productId) {
    event.preventDefault();

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

    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(product)
        });

        if (!response.ok) {
            throw new Error("Kunne ikke opdatere produkt");
        }

        loadProducts();

    } catch (error) {
        console.error(error);
        alert("Produktet kunne ikke opdateres.");
    }
}

async function deleteProduct(productId) {
    const confirmDelete = confirm("Er du sikker på, at du vil slette dette produkt?");

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Kunne ikke slette produkt");
        }

        loadProducts();

    } catch (error) {
        console.error(error);
        alert("Produktet kunne ikke slettes.");
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

function categoryOption(value, label, selectedValue) {
    return `<option value="${value}" ${value === selectedValue ? "selected" : ""}>${label}</option>`;
}

function gelatineOption(value, label, selectedValue) {
    return `<option value="${value}" ${value === selectedValue ? "selected" : ""}>${label}</option>`;
}

function escapeHtml(text) {
    if (text === null || text === undefined) {
        return "";
    }

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}