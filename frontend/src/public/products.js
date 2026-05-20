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
            ? `<span class="product-tag"> Vegansk</span>`
            : "";

        container.innerHTML += `
            <div class="product-card">
                <div onclick="openProductModal(
                    ${product.productId},
                    '${product.name}',
                    '${product.description || ''}',
                    ${product.price},
                    '${product.category}',
                    '${product.gelatineType}',
                    ${product.stockQuantity}
                )">
                    <h3>${product.name}</h3>
                    <p>${product.description || ""}</p>
                    <div class="product-price">${product.price.toFixed(2)} kr. / 100g</div>
                    ${gelatineTag}
                </div>

                <button 
                    class="add-to-bag-btn"
                    onclick="addToBag(event, ${product.productId})"
                >
                    Tilføj til pose
                </button>
            </div>
        `;
    });
}

function addToBag(event, productId) {
    event.stopPropagation();

    const product = allProducts.find(p => p.productId === productId);

    if (!product) return;

    let bag = JSON.parse(localStorage.getItem("slikpose")) || [];

    const existing = bag.find(item => item.productId === productId);

    if (existing) {
        existing.quantityGrams += 100;
    } else {
        bag.push({
            productId: product.productId,
            name: product.name,
            price: product.price,
            quantityGrams: 100
        });
    }

    localStorage.setItem("slikpose", JSON.stringify(bag));

    showToast(`${product.name} blev tilføjet til din pose! `);
}

function openProductModal(id, name, description, price, category, gelatineType, stock) {
    const modal = document.getElementById("product-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalDetails = document.getElementById("modal-details");

    const gelatineLabel = gelatineType === "WITHOUT_GELATINE" ? " Vegansk" : "Indeholder gelatine";
    const stockLabel = stock > 0 ? ` På lager (${stock} enheder)` : " Ikke på lager";

    modalTitle.textContent = name;
    modalDetails.innerHTML = `
        <div class="modal-section">
            <h4>Beskrivelse</h4>
            <p>${description || "Ingen beskrivelse tilgængelig"}</p>
        </div>
        <div class="modal-section">
            <h4>Produktinformation</h4>
            <div class="modal-info">
                <div class="info-item">
                    <strong>Pris:</strong>
                    <span>${price.toFixed(2)} kr. / 100g</span>
                </div>
                <div class="info-item">
                    <strong>Kategori:</strong>
                    <span>${category}</span>
                </div>
                <div class="info-item">
                    <strong>Type:</strong>
                    <span>${gelatineLabel}</span>
                </div>
                <div class="info-item">
                    <strong>Lager:</strong>
                    <span>${stockLabel}</span>
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

// Close modal when clicking outside the content
window.onclick = function(event) {
    const modal = document.getElementById("product-modal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
}

function updateActiveButton(category) {
    document.querySelectorAll(".category-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    const activeBtn = document.querySelector(`[data-category="${category}"]`);
    if (activeBtn) {
        activeBtn.classList.add("active");
    }
}

async function filterCategory(category) {
    updateActiveButton(category);

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
    updateActiveButton("gelatine-free");

    try {
        const products = await fetchData("products/gelatine-free");
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

loadProducts();