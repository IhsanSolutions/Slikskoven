let selectedMethod = "MANUAL";
let orderLines = [];
let allProducts = [];

/* =========================
   LOAD PRODUCTS (optional)
   ========================= */
async function loadProducts() {
    try {
        allProducts = await fetchData("products");
        showProductList(allProducts);
    } catch (error) {
        document.getElementById("product-list").innerHTML =
            `<p>Kunne ikke hente produkter.</p>`;
        console.error(error);
    }
}

/* =========================
   MANUAL PRODUCT LIST (optional fallback)
   ========================= */
function showProductList(products) {
    const container = document.getElementById("product-list");
    if (!container) return;

    container.innerHTML = "";

    products.forEach(product => {
        container.innerHTML += `
            <div class="product-select-card">
                <h4>${product.name}</h4>
                <p>${product.price.toFixed(2)} kr. / 100g</p>
                <input type="number" id="gram-${product.productId}" placeholder="gram" min="1">
                <button onclick="addToOrder(${product.productId})">Tilføj</button>
            </div>
        `;
    });
}

/* =========================
   ADD TO ORDER (manual mode)
   ========================= */
function addToOrder(productId) {
    const gramInput = document.getElementById(`gram-${productId}`);
    const grams = parseInt(gramInput.value);

    if (!grams || grams <= 0) {
        alert("Indtast et gyldigt antal gram.");
        return;
    }

    const product = allProducts.find(p => p.productId === productId);
    const linePrice = (grams / 100) * product.price;

    const existing = orderLines.find(l => l.product.productId === productId);

    if (existing) {
        existing.quantityGrams += grams;
        existing.linePrice += linePrice;
    } else {
        orderLines.push({
            product,
            quantityGrams: grams,
            linePrice
        });
    }

    gramInput.value = "";
    updateOrderSummary();
}

/* =========================
   LOAD BAG FROM LOCALSTORAGE
   ========================= */
function loadBagFromStorage() {
    const bag = JSON.parse(localStorage.getItem("slikpose")) || [];

    orderLines = bag.map(item => ({
        product: {
            productId: item.productId,
            name: item.name,
            price: item.price
        },
        quantityGrams: item.quantityGrams,
        linePrice: (item.quantityGrams / 100) * item.price
    }));

    updateOrderSummary();
}

/* =========================
   REMOVE ITEM
   ========================= */
function removeFromOrder(productId) {
    orderLines = orderLines.filter(l => l.product.productId !== productId);
    updateOrderSummary();
}

/* =========================
   UPDATE UI
   ========================= */
function updateOrderSummary() {
    const container = document.getElementById("order-lines");
    const totalContainer = document.getElementById("total-price");

    if (!container || !totalContainer) return;

    if (orderLines.length === 0) {
        container.innerHTML = `<p class="ingen-nyheder">Ingen produkter valgt endnu.</p>`;
        totalContainer.textContent = "Total: 0.00 kr.";
        return;
    }

    container.innerHTML = "";
    let total = 0;

    orderLines.forEach(line => {
        total += line.linePrice;

        container.innerHTML += `
            <div class="order-line-item">
                <span>${line.product.name}</span>
                <span>${line.quantityGrams}g</span>
                <span>${line.linePrice.toFixed(2)} kr.</span>
                <button onclick="removeFromOrder(${line.product.productId})">Fjern</button>
            </div>
        `;
    });

    totalContainer.textContent = `Total: ${total.toFixed(2)} kr.`;
}

/* =========================
   METHOD SELECT (FIXED)
   ========================= */
function selectMethod(method, event) {
    selectedMethod = method;

    document.querySelectorAll(".method-btn").forEach(btn =>
        btn.classList.remove("active")
    );

    if (event) event.target.classList.add("active");

    document.getElementById("manual-section").style.display =
        method === "MANUAL" ? "block" : "none";

    document.getElementById("comment-section").style.display =
        method === "COMMENT" ? "block" : "none";
}

/* =========================
   COMMENT MODAL (NEW)
   ========================= */
function openCommentModal() {
    document.getElementById("comment-modal").style.display = "block";
}

function closeCommentModal() {
    document.getElementById("comment-modal").style.display = "none";
}

function saveComment() {
    const value = document.getElementById("modal-comment").value;
    localStorage.setItem("orderComment", value);
    closeCommentModal();
}

/* =========================
   SELECT MODAL (VIEW BAG)
   ========================= */
function openSelectModal() {
    const modal = document.getElementById("select-modal");
    const container = document.getElementById("select-modal-items");

    container.innerHTML = "";

    allProducts.forEach(product => {
        container.innerHTML += `
            <div class="modal-product-card">
                <div>
                    <strong>${product.name}</strong>
                    <p>${product.price.toFixed(2)} kr / 100g</p>
                </div>

                <div class="add-box">
                    <input type="number" id="modal-gram-${product.productId}" placeholder="gram" min="1">
                    <button onclick="addFromModal(${product.productId})"> Tilføj</button>
                </div>
            </div>
        `;
    });

    modal.style.display = "block";
}

function closeSelectModal() {
    document.getElementById("select-modal").style.display = "none";
}

function addFromModal(productId) {
    const input = document.getElementById(`modal-gram-${productId}`);
    const grams = parseInt(input.value);

    if (!grams || grams <= 0) {
        alert("Indtast gram først");
        return;
    }

    const product = allProducts.find(p => p.productId === productId);

    let bag = JSON.parse(localStorage.getItem("slikpose")) || [];

    const existing = bag.find(i => i.productId === productId);

    if (existing) {
        existing.quantityGrams += grams;
    } else {
        bag.push({
            productId: product.productId,
            name: product.name,
            price: product.price,
            quantityGrams: grams
        });
    }

    localStorage.setItem("slikpose", JSON.stringify(bag));

    input.value = "";

    loadBagFromStorage(); // refresh order page instantly
}

/* =========================
   CLOSE MODALS ON OUTSIDE CLICK
   ========================= */
window.onclick = function (event) {
    const selectModal = document.getElementById("select-modal");
    const commentModal = document.getElementById("comment-modal");

    if (event.target === selectModal) {
        selectModal.style.display = "none";
    }

    if (event.target === commentModal) {
        commentModal.style.display = "none";
    }
};

/* =========================
   SUBMIT ORDER
   ========================= */
async function submitOrder() {
    const name = document.getElementById("customer-name").value.trim();
    const phone = document.getElementById("customer-phone").value.trim();
    const comment = localStorage.getItem("orderComment");

    const errorDiv = document.getElementById("error-message");
    errorDiv.style.display = "none";

    if (!name) return showError("Navn skal være udfyldt.");
    if (!phone) return showError("Telefonnummer skal være udfyldt.");

    if (selectedMethod === "MANUAL" && orderLines.length === 0) {
        return showError("Tilføj mindst ét produkt til din pose.");
    }

    if (selectedMethod === "COMMENT" && !comment) {
        return showError("Skriv en kommentar til din bestilling.");
    }

    const order = {
        customer: { name, phone },
        orderMethod: selectedMethod,
        comment: selectedMethod === "COMMENT" ? comment : null,
        orderLines: selectedMethod === "MANUAL"
            ? orderLines.map(l => ({
                product: { productId: l.product.productId },
                quantityGrams: l.quantityGrams
            }))
            : null
    };

    try {
        const response = await fetch("http://localhost:8080/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(order)
        });

        if (!response.ok) throw new Error();

        document.getElementById("confirmation").style.display = "block";
        document.getElementById("submit-btn").style.display = "none";

        localStorage.removeItem("slikpose");
        localStorage.removeItem("orderComment");

        orderLines = [];
        updateOrderSummary();

    } catch (err) {
        showError("Noget gik galt. Prøv igen.");
        console.error(err);
    }
}

/* =========================
   ERROR HANDLING
   ========================= */
function showError(message) {
    const errorDiv = document.getElementById("error-message");
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
}

/* =========================
   INIT
   ========================= */
loadProducts();
loadBagFromStorage();