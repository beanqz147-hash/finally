// ==========================================================
// MEETSYNC - LOGIN
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    initializeAdmin();

    const form = document.getElementById("loginForm");
    const message = document.getElementById("loginMessage");

    if (!form || !message) return;

    form.addEventListener("submit", event => {
        event.preventDefault();

        message.textContent = "";
        message.classList.remove("success");

        const email = document.getElementById("email")
            .value.trim().toLowerCase();

        const password = document.getElementById("password").value;

        if (!email || !password) {
            message.textContent = "Enter your email and password.";
            return;
        }

        const users = getUsers();

        const user = users.find(account =>
            account.email?.toLowerCase() === email &&
            account.password === password
        );

        if (!user) {
            message.textContent = "Incorrect email or password.";
            return;
        }

        setSession(user);

        window.location.replace("dashboard.html");
    });

});