async function requireAdmin() {
    try {
        const response = await apiRequest("/api/auth/me");

        if (!response.ok) {
            redirectToLogin();
            return false;
        }

        const user = await response.json();

        if (!user.admin) {
            redirectToLogin();
            return false;
        }

        document.body.style.display = "block";

        return true;

    } catch (error) {
        console.error("Kunne ikke tjekke admin-status:", error);

        redirectToLogin();
        return false;
    }
}


function redirectToLogin() {
    window.location.replace("/log-ind");
}