let selectedMethod = "MANUAL";
let orderLines = [];
let allProducts = [];

async function loadProducts() {
    try {
        allProducts = await fetchData("products");
        showProductList(allProducts);
    } catch (error) {
        document.getElementById("product-list").innerHTML = `<p>Kunne ikke hente produkter.</p>`;
        console.error(error);
    }
}

function showProductList(products) {
    const container = document.getElementById("product-list");
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

function addToOrder(productId) {
    const gramInput = document.getElementById(`gram-${productId}`);
    const grams = parseInt(gramInput.value);

    if (!grams || grams <= 0) {
        alert("Indtast et gyldigt antal gram.");
        return;
    }

    const product = allProducts.find(p => p.productId === productId);
    const linePrice = (grams / 100) * product.price;

    const existingLine = orderLines.find(line => line.product.productId === productId);
    if (existingLine) {
        existingLine.quantityGrams += grams;
        existingLine.linePrice += linePrice;
    } else {
        orderLines.push({
            product: product,
            quantityGrams: grams,
            linePrice: linePrice
        });
    }

    gramInput.value = "";
    updateOrderSummary();
}

function removeFromOrder(productId) {
    orderLines = orderLines.filter(line => line.product.productId !== productId);
    updateOrderSummary();
}

function updateOrderSummary() {
    const container = document.getElementById("order-lines");
    const totalContainer = document.getElementById("total-price");

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

function selectMethod(method) {
    selectedMethod = method;

    document.querySelectorAll(".method-btn").forEach(btn => btn.classList.remove("active"));
    event.target.classList.add("active");

    if (method === "MANUAL") {
        document.getElementById("manual-section").style.display = "block";
        document.getElementById("comment-section").style.display = "none";
    } else {
        document.getElementById("manual-section").style.display = "none";
        document.getElementById("comment-section").style.display = "block";
    }
}

async function submitOrder() {
    const name = document.getElementById("customer-name").value.trim();
    const phone = document.getElementById("customer-phone").value.trim();
    const comment = document.getElementById("comment-input")?.value.trim();
    const errorDiv = document.getElementById("error-message");

    errorDiv.style.display = "none";

    if (!name) {
        showError("Navn skal være udfyldt.");
        return;
    }

    if (!phone) {
        showError("Telefonnummer skal være udfyldt.");
        return;
    }

    if (selectedMethod === "MANUAL" && orderLines.length === 0) {
        showError("Tilføj mindst ét produkt til din pose.");
        return;
    }

    if (selectedMethod === "COMMENT" && !comment) {
        showError("Skriv en kommentar til din bestilling.");
        return;
    }

    const order = {
        customer: { name, phone },
        orderMethod: selectedMethod,
        comment: selectedMethod === "COMMENT" ? comment : null,
        orderLines: selectedMethod === "MANUAL" ? orderLines.map(line => ({
            product: { productId: line.product.productId },
            quantityGrams: line.quantityGrams
        })) : null
    };

    try {
        const response = await fetch("http://localhost:8080/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(order)
        });

        if (!response.ok) {
            throw new Error("Fejl ved afsendelse.");
        }

        document.getElementById("confirmation").style.display = "block";
        document.getElementById("submit-btn").style.display = "none";
        orderLines = [];
        updateOrderSummary();

    } catch (error) {
        showError("Noget gik galt. Prøv igen.");
        console.error(error);
    }
}

function showError(message) {
    const errorDiv = document.getElementById("error-message");
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
}

loadProducts();