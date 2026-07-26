let selectedMethod = "MANUAL";
let orderLines = [];
let allProducts = [];
let productsLoadPromise = null;
let orderSubmitted = false;

// ==================================================
// LOAD PRODUCTS
// ==================================================

async function loadProducts() {
    if (productsLoadPromise) {
        return productsLoadPromise;
    }

    productsLoadPromise = (async () => {
        try {
            const products = await fetchData("products");

            allProducts = Array.isArray(products) ? products : [];

            showProductList(allProducts);

            return allProducts;

        } catch (error) {
            allProducts = [];

            const productList = document.getElementById("product-list");

            if (productList) {
                productList.innerHTML = "<p>Kunne ikke hente produkter.</p>";
            }

            console.error("Kunne ikke hente produkter:", error);

            return [];

        } finally {
            productsLoadPromise = null;
        }
    })();

    return productsLoadPromise;
}

// ==================================================
// OPTIONAL PRODUCT LIST
// ==================================================

function showProductList(products) {
    const container = document.getElementById("product-list");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    products.forEach(product => {
        container.innerHTML += `
            <div class="product-select-card">
                <h4>${escapeHtml(product.name)}</h4>

                <p>
                    ${formatProductPrice(product)}
                </p>

                <input
                    type="number"
                    id="gram-${product.productId}"
                    placeholder="gram"
                    min="1"
                >

                <button
                    type="button"
                    onclick="addToOrder(${product.productId})"
                >
                    Tilføj
                </button>
            </div>
        `;
    });
}


// ==================================================
// ADD TO ORDER
// ==================================================

function addToOrder(productId) {
    const gramInput = document.getElementById(`gram-${productId}`);

    if (!gramInput) {
        return;
    }

    const grams = parseInt(gramInput.value, 10);

    if (!grams || grams <= 0) {
        alert("Indtast et gyldigt antal gram.");
        return;
    }

    const product = allProducts.find(
        p => String(p.productId) === String(productId)
    );

    if (!product) {
        alert("Produktet blev ikke fundet.");
        return;
    }

    addProductLine(product, grams);

    gramInput.value = "";
    updateOrderSummary();
}


function addProductLine(product, grams) {
    const linePrice = (grams / 100) * Number(product.price);

    const existing = orderLines.find(
        line => String(line.product.productId) === String(product.productId)
    );

    if (existing) {
        existing.quantityGrams += grams;
        existing.linePrice += linePrice;

        return;
    }

    orderLines.push({
        product: {
            productId: product.productId,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl
        },
        quantityGrams: grams,
        linePrice: linePrice
    });
}


// ==================================================
// LOAD BAG FROM LOCALSTORAGE
// ==================================================

function loadBagFromStorage() {
    const bag =
        JSON.parse(localStorage.getItem("slikpose")) ||
        [];

    orderLines = bag.map(item => ({
        product: {
            productId: item.productId,
            name: item.name,
            price: Number(item.price),
            imageUrl: item.imageUrl || ""
        },
        quantityGrams: Number(item.quantityGrams),
        linePrice: (Number(item.quantityGrams) / 100) * Number(item.price)
    }));

    updateOrderSummary();
}


// ==================================================
// REMOVE ITEM
// ==================================================

function removeFromOrder(productId) {
    orderLines = orderLines.filter(line => String(line.product.productId) !== String(productId));

    let bag = JSON.parse(localStorage.getItem("slikpose")) || [];

    bag = bag.filter(item => String(item.productId) !== String(productId));

    localStorage.setItem("slikpose", JSON.stringify(bag));

    updateOrderSummary();
}


// ==================================================
// UPDATE UI
// ==================================================

function updateOrderSummary() {
    const container = document.getElementById("order-lines");

    const totalContainer = document.getElementById("total-price");

    if (!container || !totalContainer) {
        return;
    }

    if (orderLines.length === 0) {
        container.innerHTML = `
            <div class="mix-empty-bag">
                <div class="mix-empty-bag-icon" aria-hidden="true">
                    <svg viewBox="0 0 64 64">
                        <path d="M18 22h28l-3 31H21z"></path>
                        <path d="M24 22c0-9 4-14 8-14s8 5 8 14"></path>
                    </svg>
                </div>

                <strong>Din pose er tom</strong>

                <p>Tilføj nogle af dine favoritter for at starte bestillingen.</p>

                <button type="button" onclick="openSelectModal()">Vælg produkter</button>
            </div>
        `;

        totalContainer.textContent = "0.00 kr.";

        updateProgressState();
        return;
    }

    let total = 0;

    container.innerHTML = orderLines
        .map(line => {
            total += Number(line.linePrice);

            const productName = String(line.product.name || "Produkt");

            const imageUrl = normalizeImageUrl(line.product.imageUrl);

            const visual = imageUrl
                ? `
                    <img 
                        src="${escapeHtml(imageUrl)}" 
                        alt="" 
                        loading="lazy"
                        onerror="handleBrokenOrderImage(this, '${escapeHtml(
                    productName.charAt(0).toUpperCase()
                )}')"
                        >
                `
                : `
                    <span aria-hidden="true">
                        ${escapeHtml(productName.charAt(0).toUpperCase())}
                    </span>
                `;

            return `
                <article class="order-line-item">
                    <div class="order-item-visual">
                        ${visual}
                    </div>

                    <div class="order-item-details">
                        <strong>
                            ${escapeHtml(productName)}
                        </strong>

                        <span> ${line.quantityGrams} g</span>
                    </div>

                    <strong class="order-item-price">
                        ${formatPrice(line.linePrice)} kr.
                    </strong>

                    <button
                        type="button"
                        class="order-item-remove"
                        onclick="removeFromOrder('${line.product.productId}')"
                        aria-label="Fjern ${escapeHtml(productName)} fra posen"
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                </article>
            `;
        })
        .join("");

    totalContainer.textContent = `${formatPrice(total)} kr.`;

    updateProgressState();
}


// ==================================================
// METHOD SELECT
// ==================================================

function setOrderMethod(method) {
    selectedMethod =
        method === "COMMENT"
            ? "COMMENT"
            : "MANUAL";

    orderSubmitted = false;

    const manualSection = document.getElementById("manual-section");
    const commentSection = document.getElementById("comment-section");
    const confirmation = document.getElementById("confirmation");
    const submitButton = document.getElementById("submit-btn");

    if (manualSection) {
        manualSection.style.display =
            selectedMethod === "MANUAL"
                ? "block"
                : "none";
    }

    if (commentSection) {
        commentSection.style.display =
            selectedMethod === "COMMENT"
                ? "block"
                : "none";
    }

    if (confirmation) {
        confirmation.style.display = "none";
    }

    if (submitButton) {
        submitButton.style.display = "";
    }

    document
        .querySelectorAll(".method-btn")
        .forEach(button => {
            const buttonMethod =
                button.classList.contains(
                    "mix-method-comment"
                )
                    ? "COMMENT"
                    : "MANUAL";

            const isSelected = buttonMethod === selectedMethod;

            button.classList.toggle("active", isSelected);

            button.setAttribute("aria-pressed", String(isSelected));
        });

    updateOrderFlow();
}


function updateOrderFlow() {
    const contentTitle = document.getElementById("progress-content-title");

    const contentDescription = document.getElementById("progress-content-description");

    if (contentTitle) {
        contentTitle.textContent =
            selectedMethod === "COMMENT"
                ? "Beskriv posen"
                : "Vælg produkter";
    }

    if (contentDescription) {
        contentDescription.textContent =
            selectedMethod === "COMMENT"
                ? "Skriv vægt, smage og ønsker"
                : "Sammensæt posens indhold";
    }

    updateProgressState();
}


function updateProgressState() {
    const contentComplete =
        selectedMethod === "COMMENT"
            ? Boolean(getOrderComment())
            : orderLines.length > 0;

    setProgressStepState(
        "progress-step-method",
        false,
        true
    );

    setProgressStepState(
        "progress-step-content",
        !contentComplete,
        contentComplete
    );

    setProgressStepState(
        "progress-step-contact",
        contentComplete && !orderSubmitted,
        orderSubmitted
    );
}


function setProgressStepState(
    elementId,
    isActive,
    isComplete
) {
    const step = document.getElementById(elementId);

    if (!step) {
        return;
    }

    step.classList.toggle(
        "mix-progress-active",
        isActive
    );

    step.classList.toggle(
        "mix-progress-complete",
        isComplete
    );

    if (isActive) {
        step.setAttribute(
            "aria-current",
            "step"
        );
    } else {
        step.removeAttribute("aria-current");
    }
}


function initializeOrderFlowListeners() {
    const commentInput = document.getElementById("comment-input");
    const modalComment = document.getElementById("modal-comment");
    const customerName = document.getElementById("customer-name");
    const customerPhone = document.getElementById("customer-phone");

    if (commentInput) {
        commentInput.addEventListener(
            "input",
            () => {
                localStorage.setItem(
                    "orderComment",
                    commentInput.value
                );

                if (modalComment) {
                    modalComment.value =
                        commentInput.value;
                }

                updateProgressState();
            }
        );
    }

    if (modalComment) {
        modalComment.addEventListener(
            "input",
            updateProgressState
        );
    }

    [customerName, customerPhone]
        .filter(Boolean)
        .forEach(input => {
            input.addEventListener(
                "input",
                updateProgressState
            );
        });
}


function selectMethod(method, event) {
    event?.preventDefault();

    setOrderMethod(method);

    if (selectedMethod === "COMMENT") {
        const commentSection = document.getElementById("comment-section");

        const commentInput = document.getElementById("comment-input");

        commentSection?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        window.setTimeout(
            () => commentInput?.focus(),
            350
        );

        return;
    }

    openSelectModal();
}


// ==================================================
// COMMENT MODAL
// ==================================================

function openCommentModal() {
    setOrderMethod("COMMENT");

    const commentInput = document.getElementById("comment-input");

    const modalComment = document.getElementById("modal-comment");

    const currentComment =
        commentInput?.value ||
        localStorage.getItem("orderComment") ||
        "";

    if (modalComment) {
        modalComment.value = currentComment;
    }

    const modal = document.getElementById("comment-modal");

    if (modal) {
        modal.style.display = "block";

        window.setTimeout(
            () => modalComment?.focus(),
            100
        );
    }
}


function closeCommentModal() {
    document.getElementById("comment-modal").style.display = "none";
}


function saveComment() {
    const modalComment = document.getElementById("modal-comment");

    const commentInput = document.getElementById("comment-input");

    const value =
        modalComment
            ? modalComment.value.trim()
            : "";

    localStorage.setItem("orderComment", value);

    if (commentInput) {
        commentInput.value = value;
    }

    updateProgressState();
    closeCommentModal();
}


// ==================================================
// SELECT MODAL
// ==================================================

async function openSelectModal() {
    setOrderMethod("MANUAL");

    const modal = document.getElementById("select-modal");

    const container = document.getElementById("select-modal-items");

    if (!modal || !container) {
        return;
    }

    modal.style.display = "block";

    container.innerHTML = `
        <div class="select-products-state">
            <span class="select-products-spinner" aria-hidden="true"></span>

            <strong>Henter produkter</strong>

            <p> Et øjeblik – vi finder butikkens udvalg.</p>
        </div>
    `;

    const products = allProducts.length > 0 ? allProducts : await loadProducts();

    if (!Array.isArray(products) || products.length === 0) {
        container.innerHTML = `
            <div class="select-products-state select-products-error">
                <strong>Produkterne kunne ikke hentes</strong>

                <p> Prøv at hente butikkens udvalg igen.</p>

                <button type="button" class="select-products-retry" onclick="openSelectModal()">Prøv igen</button>
            </div>
        `;

        return;
    }

    container.innerHTML = products
        .map(product => `
            <div class="modal-product-card">
                <div class="modal-product-information">
                    <strong>
                        ${escapeHtml(product.name)}
                    </strong>

                    <p>
                        ${formatPrice(product.price)}
                        kr. / 100 g
                    </p>
                </div>

                <div class="add-box">
                    <label class="visually-hidden" for="modal-gram-${product.productId}">
                        Antal gram af ${escapeHtml(product.name)}
                    </label>

                    <input type="number" id="modal-gram-${product.productId}" placeholder="Gram" min="1">

                    <button type="button" onclick="addFromModal(${product.productId})">Tilføj</button>
                </div>
            </div>
        `)
        .join("");
}


function closeSelectModal() {
    document.getElementById("select-modal").style.display = "none";
}


function addFromModal(productId) {
    const input = document.getElementById(`modal-gram-${productId}`);

    if (!input) {
        return;
    }

    const grams = parseInt(input.value, 10);

    if (!grams || grams <= 0) {
        alert("Indtast gram først.");
        return;
    }

    const product = allProducts.find(
        p => String(p.productId) === String(productId)
    );

    if (!product) {
        alert("Produktet blev ikke fundet.");
        return;
    }

    let bag = JSON.parse(localStorage.getItem("slikpose")) || [];

    const existing = bag.find(
        item => String(item.productId) === String(productId)
    );

    if (existing) {
        existing.quantityGrams += grams;

    } else {
        bag.push({
            productId: product.productId,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl || "",
            quantityGrams: grams
        });
    }

    localStorage.setItem("slikpose", JSON.stringify(bag));

    input.value = "";

    loadBagFromStorage();
}


// ==================================================
// CLOSE MODALS ON OUTSIDE CLICK
// ==================================================

window.onclick = function(event) {
    const selectModal = document.getElementById("select-modal");

    const commentModal = document.getElementById("comment-modal");

    if (event.target === selectModal) {
        selectModal.style.display = "none";
    }

    if (event.target === commentModal) {
        commentModal.style.display = "none";
    }
};


// ==================================================
// SUBMIT ORDER
// ==================================================

async function submitOrder() {
    const name = document.getElementById("customer-name").value.trim();
    const phone = document.getElementById("customer-phone").value.trim();
    const comment = getOrderComment();
    const errorDiv = document.getElementById("error-message");

    errorDiv.style.display = "none";

    if (!name) {
        return showError("Navn skal være udfyldt.");
    }

    if (!phone) {
        return showError("Telefonnummer skal være udfyldt.");
    }

    if (!isValidPhoneNumber(phone)) {
        return showError("Telefonnummer skal være mindst 8 cifre.");
    }

    if (selectedMethod === "MANUAL" && orderLines.length === 0) {
        return showError("Tilføj mindst ét produkt til din pose.");
    }

    if (selectedMethod === "COMMENT" && !comment) {
        return showError("Skriv en kommentar til din bestilling.");
    }

    const order = {
        customer: {
            name,
            phone
        },

        orderMethod: selectedMethod,

        comment: selectedMethod === "COMMENT" ? comment : null,

        orderLines:
            selectedMethod === "MANUAL"
                ? orderLines.map(line => ({
                    product: {
                        productId: line.product.productId
                    },
                    quantityGrams: line.quantityGrams
                }))
                : null
    };

    try {
        const response = await apiRequest("/api/orders", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(order)
        });

        if (!response.ok) {
            const message = await getErrorMessage(response, "Bestillingen kunne ikke sendes.");

            throw new Error(message);
        }

        clearOrderState();
        showConfirmation();

    } catch (error) {
        showError(error.message || "Noget gik galt. Prøv igen.");
        console.error("Fejl ved bestilling:", error);
    }
}


function getOrderComment() {
    const commentInput = document.getElementById("comment-input");

    const modalComment = document.getElementById("modal-comment");

    const localStorageComment = localStorage.getItem("orderComment") || "";

    if (commentInput && commentInput.value.trim()) {
        return commentInput.value.trim();
    }

    if (modalComment && modalComment.value.trim()) {
        return modalComment.value.trim();
    }

    return localStorageComment.trim();
}


function showConfirmation() {
    orderSubmitted = true;

    const confirmation = document.getElementById("confirmation");

    const submitButton = document.getElementById("submit-btn");

    if (confirmation) {
        confirmation.style.display = "flex";
    }

    if (submitButton) {
        submitButton.style.display = "none";
    }

    setProgressStepState(
        "progress-step-method",
        false,
        true
    );

    setProgressStepState(
        "progress-step-content",
        false,
        true
    );

    setProgressStepState(
        "progress-step-contact",
        false,
        true
    );
}


function clearOrderState() {
    localStorage.removeItem("slikpose");
    localStorage.removeItem("orderComment");

    orderLines = [];

    const commentInput = document.getElementById("comment-input");

    const modalComment = document.getElementById("modal-comment");

    if (commentInput) {
        commentInput.value = "";
    }

    if (modalComment) {
        modalComment.value = "";
    }

    updateOrderSummary();
}


// ==================================================
// ERROR HANDLING
// ==================================================

function showError(message) {
    const errorDiv = document.getElementById("error-message");

    errorDiv.textContent = message;
    errorDiv.style.display = "block";
}


// ==================================================
// HELPERS
// ==================================================

function normalizeImageUrl(imageUrl) {
    const value = String(imageUrl || "").trim();

    if (!value) return "";

    if (
        value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("/assets/")
    ) {
        return value;
    }

    if (value.startsWith("assets/")) {
        return `/${value}`;
    }

    if (
        /\.(png|jpe?g|webp|gif)$/i.test(value) &&
        !value.includes("/")
    ) {
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

function isValidPhoneNumber(phone) {
    const digitsOnly = String(phone || "").replace(/\D/g, "");

    return digitsOnly.length >= 8;
}

function escapeHtml(text) {
    return String(text || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function handleBrokenOrderImage(imageElement, fallbackLetter) {
    const visual = imageElement.closest(".order-item-visual");

    if (!visual) {
        imageElement.remove();
        return;
    }

    visual.innerHTML = `
        <span aria-hidden="true">
            ${escapeHtml(fallbackLetter || "P")}
        </span>
    `;
}


// ==================================================
// INIT
// ==================================================

document.addEventListener("DOMContentLoaded", initializeOrderPage);


async function initializeOrderPage() {
    await loadProducts();

    loadBagFromStorage();
    initializeOrderFlowListeners();

    const savedComment = localStorage.getItem("orderComment") || "";

    const commentInput = document.getElementById("comment-input");

    const modalComment = document.getElementById("modal-comment");

    if (commentInput) {
        commentInput.value = savedComment;
    }

    if (modalComment) {
        modalComment.value = savedComment;
    }

    setOrderMethod("MANUAL");
}