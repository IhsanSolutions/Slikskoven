async function requireAdmin() {
    try {
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
            window.location.replace("/login.html");
            return false;
        }

        const user = await response.json();

        if (!user.admin) {
            window.location.replace("/login.html");
            return false;
        }

        document.body.style.display = "block";
        return true;

    } catch (error) {
        console.error("Kunne ikke tjekke admin-status:", error);
        window.location.replace("/login.html");
        return false;
    }
}

requireAdmin();