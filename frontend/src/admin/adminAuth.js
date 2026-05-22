async function requireAdmin() {
    try {
        console.log("Tjekker admin-status...");

        const response = await fetch("/api/auth/me");
        console.log("Auth response status:", response.status);

        if (!response.ok) {
            console.log("Ikke logget ind. Sender til login.");
            window.location.replace("/login.html");
            return false;
        }

        const user = await response.json();
        console.log("Bruger:", user);

        if (!user.admin) {
            console.log("Bruger er ikke admin. Sender til login.");
            window.location.replace("/login.html");
            return false;
        }

        console.log("Bruger er admin. Viser siden.");
        document.body.style.display = "block";
        return true;

    } catch (error) {
        console.error("Kunne ikke tjekke admin-status:", error);
        window.location.replace("/login.html");
        return false;
    }
}

requireAdmin();