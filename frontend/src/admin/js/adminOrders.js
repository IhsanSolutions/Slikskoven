const ORDERS_API_URL = "/api/orders";

let allOrders = [];
let activeOrderFilter = "ALL";

document.addEventListener("DOMContentLoaded", async () => {
    const isAdmin = await requireAdmin();

    if (!isAdmin) {
        return;
    }

    setupOrderFilters();
    await loadOrders();
});


async function loadOrders() {
    const container = document.getElementById("admin-orders-container");

    if (!container) {
        console.error("Containeren #admin-orders-container blev ikke fundet.");
        return;
    }

    container.innerHTML = "<p>Henter ordrer...</p>";

    try {
        const response = await apiRequest(ORDERS_API_URL);

        if (!response.ok) {
            throw await createApiError(response, "Kunne ikke hente ordrer.");
        }

        const orders = await response.json();

        allOrders = Array.isArray(orders)
            ? orders.sort((a, b) => {
                return new Date(b.createdAt || 0) -
                    new Date(a.createdAt || 0);
            })
            : [];

        updateOrderCounts();
        renderOrders();

    } catch (error) {
        console.error("Fejl ved hentning af ordrer:", error);

        if (handleAuthorizationError(error)) {
            return;
        }

        container.innerHTML = `
            <p>${escapeHtml(error.message || "Kunne ikke hente ordrer.")}</p>
        `;
    }
}

function setupOrderFilters() {
    const filterButtons = document.querySelectorAll(
        ".order-filter-button"
    );

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            activeOrderFilter =
                button.dataset.orderStatus || "ALL";

            filterButtons.forEach(filterButton => {
                filterButton.classList.remove("active");
            });

            button.classList.add("active");

            renderOrders();
        });
    });
}


function renderOrders() {
    const container = document.getElementById(
        "admin-orders-container"
    );

    if (!container) {
        return;
    }

    const visibleOrders =
        activeOrderFilter === "ALL"
            ? allOrders
            : allOrders.filter(order =>
                order.status === activeOrderFilter
            );

    container.innerHTML = "";

    if (visibleOrders.length === 0) {
        container.innerHTML = `
            <p class="empty-orders-message">
                ${getEmptyFilterMessage()}
            </p>
        `;

        return;
    }

    visibleOrders.forEach(order => {
        container.appendChild(createOrderCard(order));
    });
}


function updateOrderCounts() {
    const counts = {
        ALL: allOrders.length,
        MODTAGET: 0,
        KLAR: 0,
        AFHENTET: 0
    };

    allOrders.forEach(order => {
        if (Object.hasOwn(counts, order.status)) {
            counts[order.status]++;
        }
    });

    setOrderCount("order-count-all", counts.ALL);
    setOrderCount(
        "order-count-modtaget",
        counts.MODTAGET
    );
    setOrderCount("order-count-klar", counts.KLAR);
    setOrderCount(
        "order-count-afhentet",
        counts.AFHENTET
    );
}


function setOrderCount(elementId, count) {
    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = count;
    }
}


function getEmptyFilterMessage() {
    const messages = {
        ALL: "Der findes ingen ordrer endnu.",
        MODTAGET: "Der er ingen modtagne ordrer.",
        KLAR: "Der er ingen ordrer klar til afhentning.",
        AFHENTET: "Der er ingen afhentede ordrer."
    };

    return messages[activeOrderFilter] ||
        "Der findes ingen ordrer.";
}

function createOrderCard(order) {
    const card = document.createElement("article");
    card.classList.add("admin-order-card");

    const orderLinesHtml = createOrderLinesHtml(order);
    const commentHtml = createCommentHtml(order);
    const nextStatus = getNextStatus(order.status);

    card.innerHTML = `
        <div class="admin-order-header">
            <div>
                <h3>Ordre #${order.orderId}</h3>

                <p>
                    <strong>Status:</strong>
                    <span class="order-status-badge order-status-${escapeHtml(order.status || "").toLowerCase()}">
                        ${escapeHtml(formatOrderStatus(order.status))}
                    </span>
                </p>
            </div>

            <div class="admin-order-date">
                ${formatDate(order.createdAt)}
            </div>
        </div>

        <div class="admin-order-grid">
            <div>
                <h4>Kunde</h4>

                <p>
                    <strong>Navn:</strong>
                    ${escapeHtml(order.customer?.name || "Ukendt")}
                </p>

                <p>
                    <strong>Telefon:</strong>
                    ${escapeHtml(order.customer?.phone || "Ukendt")}
                </p>
            </div>

            <div>
                <h4>Bestilling</h4>

                <p>
                    <strong>Metode:</strong>
                    ${escapeHtml(formatOrderMethod(order.orderMethod))}
                </p>

                <p>
                    <strong>Total:</strong>
                    ${formatPrice(order.totalPrice)} kr.
                </p>
            </div>
        </div>

        ${commentHtml}

        ${orderLinesHtml}

        <div class="admin-order-actions">
            ${
        nextStatus
            ? `
                        <button
                            type="button"
                            onclick="updateOrderStatus(${order.orderId}, '${nextStatus}')"
                        >
                            Markér som ${escapeHtml(formatOrderStatus(nextStatus))}
                        </button>
                    `
            : `
                        <span class="order-complete-text">
                            Ordren er afsluttet.
                        </span>
                    `
    }
        </div>
    `;

    return card;
}


function createCommentHtml(order) {
    if (!order.comment) {
        return "";
    }

    return `
        <div class="admin-order-section">
            <h4>Kommentar</h4>
            <p>${escapeHtml(order.comment)}</p>
        </div>
    `;
}


function createOrderLinesHtml(order) {
    if (!Array.isArray(order.orderLines) || order.orderLines.length === 0) {
        return `
            <div class="admin-order-section">
                <h4>Ordrelinjer</h4>
                <p>Ingen konkrete produkter valgt.</p>
            </div>
        `;
    }

    const rows = order.orderLines.map(line => {
        const productName = line.product?.name || "Ukendt produkt";

        return `
            <tr>
                <td>${escapeHtml(productName)}</td>
                <td>${line.quantityGrams ?? 0}g</td>
                <td>${formatPrice(line.linePrice)} kr.</td>
            </tr>
        `;
    }).join("");

    return `
        <div class="admin-order-section">
            <h4>Ordrelinjer</h4>

            <div class="admin-order-table-wrapper">
                <table class="admin-order-table">
                    <thead>
                        <tr>
                            <th>Produkt</th>
                            <th>Mængde</th>
                            <th>Pris</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}


async function updateOrderStatus(orderId, status) {
    try {
        const response = await apiRequest(
            `${ORDERS_API_URL}/${orderId}/status?status=${encodeURIComponent(status)}`,
            {
                method: "PATCH"
            }
        );

        if (!response.ok) {
            throw await createApiError(
                response,
                "Kunne ikke opdatere ordrestatus."
            );
        }

        await loadOrders();

    } catch (error) {
        console.error("Fejl ved opdatering af ordrestatus:", error);

        if (!handleAuthorizationError(error)) {
            alert(error.message || "Ordrestatus kunne ikke opdateres.");
        }
    }
}


function getNextStatus(status) {
    if (status === "MODTAGET") {
        return "KLAR";
    }

    if (status === "KLAR") {
        return "AFHENTET";
    }

    return null;
}


function formatOrderStatus(status) {
    const statuses = {
        MODTAGET: "Modtaget",
        KLAR: "Klar til afhentning",
        AFHENTET: "Afhentet"
    };

    return statuses[status] || status || "";
}


function formatOrderMethod(method) {
    const methods = {
        MANUAL: "Valgt selv",
        COMMENT: "Kommentar"
    };

    return methods[method] || method || "";
}


function formatPrice(price) {
    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
        return "0.00";
    }

    return numericPrice.toFixed(2);
}


function formatDate(dateString) {
    if (!dateString) {
        return "Ingen dato";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Ugyldig dato";
    }

    return date.toLocaleString("da-DK");
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


function escapeHtml(text) {
    return String(text || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}