document.addEventListener("DOMContentLoaded", initializeRegisterPage);


function initializeRegisterPage() {
    const form = document.getElementById("register-form");

    form.addEventListener("submit", registerUser);
}


async function registerUser(event) {
    event.preventDefault();

    const registerButton = document.getElementById("register-button");
    const messageContainer = document.getElementById("register-message");
    const password = document.getElementById("password").value;
    const confirmedPassword = document.getElementById("confirm-password").value;

    hideRegisterMessage(messageContainer);

    if (password !== confirmedPassword) {
        showRegisterMessage(messageContainer, "Kodeordene er ikke ens.", true);

        return;
    }

    const request = {
        name: document.getElementById("name").value.trim(),

        email: document.getElementById("email").value.trim(),

        phone: document.getElementById("phone").value.trim(),

        password: password
    };

    registerButton.disabled = true;
    registerButton.textContent = "Opretter...";

    try {
        const response = await apiRequest(
            "/api/auth/register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },

                body: JSON.stringify(request)
            }
        );

        if (!response.ok) {
            await handleRegistrationError(response, messageContainer);

            return;
        }

        window.location.replace("/login.html?registered=true");

    } catch (error) {
        console.error(error);

        showRegisterMessage(messageContainer, "Der opstod en fejl. Prøv igen.", true);

    } finally {
        registerButton.disabled = false;
        registerButton.textContent = "Opret bruger";
    }
}


async function handleRegistrationError(response, messageContainer) {
    try {
        const errorResponse = await response.json();

        if (errorResponse.fieldErrors && Object.keys(errorResponse.fieldErrors).length > 0
        ) {
            const messages = Object.values(errorResponse.fieldErrors);

            showRegisterMessage(messageContainer, messages.join(" "), true);

            return;
        }

        showRegisterMessage(
            messageContainer, errorResponse.message || "Brugeren kunne ikke oprettes.", true
        );

    } catch (error) {
        console.error("Kunne ikke læse fejlrespons:", error);

        showRegisterMessage(messageContainer, "Brugeren kunne ikke oprettes.", true);
    }
}


function showRegisterMessage(container, message, isError) {
    container.textContent = message;
    container.style.display = "block";

    container.classList.toggle("error-message", isError);

    container.classList.toggle("success-message", !isError);
}


function hideRegisterMessage(container) {
    container.textContent = "";
    container.style.display = "none";
}