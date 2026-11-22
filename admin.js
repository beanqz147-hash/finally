// ==========================================================
// MEETSYNC - ADMIN ACCOUNT MANAGEMENT
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    if (!requireAdmin()) return;

    const form = document.getElementById("registerForm");
    const message = document.getElementById("registerMessage");

    if (!form || !message) return;

    form.addEventListener("submit", event => {
        event.preventDefault();

        message.textContent = "";
        message.classList.remove("success");

        const name = document.getElementById("fullName").value.trim();
        const email = document.getElementById("newEmail").value.trim().toLowerCase();
        const password = document.getElementById("newPassword").value;
        const confirmation = document.getElementById("confirmPassword").value;

        // ---------------- VALIDATION ----------------

        if (!name || !email || !password || !confirmation) {
            message.textContent = "Please fill in all fields.";
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            message.textContent = "Enter a valid email address.";
            return;
        }

        if (password.length < 6) {
            message.textContent = "Password must be at least six characters.";
            return;
        }

        if (password !== confirmation) {
            message.textContent = "Passwords do not match.";
            return;
        }

        // ---------------- CHECK USERS ----------------

        const users = getUsers();

        const exists = users.some(user =>
            user.email?.toLowerCase() === email
        );

        if (exists) {
            message.textContent = "An account with this email already exists.";
            return;
        }

        // ---------------- CREATE ACCOUNT ----------------

        const newUser = {
            id: "user-" + Date.now(),
            name,
            email,
            password,
            role: "user",
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveUsers(users);

        // ---------------- NOTIFICATION ----------------

        addNotification(
            "Account Created",
            `An account has been created for ${name}.`,
            email
        );

        message.textContent = "Account created successfully.";
        message.classList.add("success");

        form.reset();
    });

});