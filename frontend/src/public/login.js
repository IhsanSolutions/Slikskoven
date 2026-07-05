document.addEventListener("DOMContentLoaded", initializeLoginPage);


async function initializeLoginPage() {
    const form = document.getElementById("login-form");
    const loginButton = document.getElementById("login-button");
    const messageContainer = document.getElementById("login-message");

    showMessageFromUrl(messageContainer);

    try {
        const currentUser = await getCurrentUser();

        if (currentUser.loggedIn) {
            redirectLoggedInUser(currentUser);
            return;
        }

        const csrfToken = await getCsrfToken();

        addCsrfInputToForm(form, csrfToken);

        loginButton.disabled = false;

    } catch (error) {
        console.error(error);

        showLoginMessage(messageContainer,
            "Loginformularen kunne ikke klargøres. Prøv at genindlæse siden.",
            true
        );
    }
}


function addCsrfInputToForm(form, csrfToken) {
    const existingInput = form.querySelector(`input[name="${csrfToken.parameterName}"]`);

    if (existingInput) {
        existingInput.value = csrfToken.token;
        return;
    }

    const csrfInput = document.createElement("input");

    csrfInput.type = "hidden";
    csrfInput.name = csrfToken.parameterName;
    csrfInput.value = csrfToken.token;

    form.appendChild(csrfInput);
}


function showMessageFromUrl(messageContainer) {
    const parameters =
        new URLSearchParams(window.location.search);

    if (parameters.get("error") === "true") {
        showLoginMessage(messageContainer, "Forkert e-mail eller kodeord.", true);

        return;
    }

    if (parameters.get("registered") === "true") {
        showLoginMessage(messageContainer, "Din bruger er oprettet. Du kan nu logge ind.", false);

        return;
    }

    if (parameters.get("logout") === "true") {
        showLoginMessage(messageContainer, "Du er blevet logget ud.", false);
    }
}


function showLoginMessage(
    container,
    message,
    isError
) {
    container.textContent = message;
    container.style.display = "block";
    container.classList.toggle(
        "error-message",
        isError
    );
    container.classList.toggle(
        "success-message",
        !isError
    );
}


function redirectLoggedInUser(user) {
    if (user.admin) {
        window.location.replace("/admin/adminDashboard.html");

        return;
    }

    window.location.replace("/forside.html");
}