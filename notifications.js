// ==========================================================
// MEETSYNC - NOTIFICATIONS
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    if (!requireAuth()) return;

    const list = document.getElementById("notificationsList");
    const markAllButton = document.getElementById("markAllRead");
    const clearButton = document.getElementById("clearNotifications");

    if (!list) return;

    function render() {

        const items = getNotifications();

        if (!items.length) {
            list.innerHTML = `
                <div class="panel empty-state">
                    You have no notifications.
                </div>
            `;
            return;
        }

        list.innerHTML = items.map(item => `
            <article class="notification-card ${item.read ? "read" : ""}">
                <span class="notification-dot"></span>

                <div>
                    <h3>${escapeHTML(item.title || "Notification")}</h3>

                    <p>${escapeHTML(item.message || "")}</p>

                    <p>
                        ${item.date
                            ? escapeHTML(new Date(item.date).toLocaleString())
                            : ""}
                    </p>

                    ${
                        !item.read
                        ? `<button class="btn btn-secondary"
                                   data-read="${escapeHTML(item.id)}">
                               Mark as read
                           </button>`
                        : ""
                    }
                </div>
            </article>
        `).join("");
    }

    // ---------------- MARK INDIVIDUAL READ ----------------

    list.addEventListener("click", event => {

        const button = event.target.closest("[data-read]");

        if (!button) return;

        const id = button.dataset.read;
        const items = getNotifications();

        const notification = items.find(item => item.id === id);

        if (!notification) return;

        notification.read = true;

        saveNotifications(items);

        render();
    });

    // ---------------- MARK ALL READ ----------------

    if (markAllButton) {

        markAllButton.addEventListener("click", () => {

            const items = getNotifications().map(item => ({
                ...item,
                read: true
            }));

            saveNotifications(items);

            render();
        });
    }

    // ---------------- CLEAR ----------------

    if (clearButton) {

        clearButton.addEventListener("click", () => {

            if (!confirm("Are you sure you want to clear all notifications?")) {
                return;
            }

            saveNotifications([]);

            render();
        });
    }

    render();

});