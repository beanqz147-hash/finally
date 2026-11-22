// ==========================================================
// MEETSYNC - CORE SYSTEM
// ==========================================================

const DB = {
    users: "meetsync_users",
    session: "meetsync_session",
    meetings: "meetsync_meetings",
    notifications: "meetsync_notifications"
};

// ---------------- STORAGE ----------------

function readStore(key, fallback = []) {
    try {
        const data = localStorage.getItem(key);
        if (data === null) return fallback;

        const parsed = JSON.parse(data);
        return parsed ?? fallback;
    } catch (error) {
        console.error("Storage read error:", error);
        return fallback;
    }
}

function saveStore(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() {
    const users = readStore(DB.users, []);
    return Array.isArray(users) ? users : [];
}

function saveUsers(users) {
    saveStore(DB.users, users);
}

function getMeetings() {
    const meetings = readStore(DB.meetings, []);
    return Array.isArray(meetings) ? meetings : [];
}

function saveMeetings(meetings) {
    saveStore(DB.meetings, meetings);
}

function getNotifications() {
    const notifications = readStore(DB.notifications, []);
    return Array.isArray(notifications) ? notifications : [];
}

function saveNotifications(notifications) {
    saveStore(DB.notifications, notifications);
}

// ---------------- ADMIN ----------------

function initializeAdmin() {
    const users = getUsers();
    const adminEmail = "admin@meetsync.local";

    let admin = users.find(user =>
        user.email?.toLowerCase() === adminEmail
    );

    if (!admin) {
        admin = {
            id: "admin-001",
            name: "System Administrator",
            email: adminEmail,
            password: "Admin@123",
            role: "admin"
        };

        users.push(admin);
    } else {
        admin.name = "System Administrator";
        admin.password = "Admin@123";
        admin.role = "admin";
    }

    saveUsers(users);
}

// ---------------- AUTHENTICATION ----------------

function currentUser() {
    return readStore(DB.session, null);
}

function setSession(user) {
    saveStore(DB.session, {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    });
}

function logout() {
    localStorage.removeItem(DB.session);
    window.location.replace("index.html");
}

function requireAuth() {
    const user = currentUser();

    if (!user) {
        window.location.replace("index.html");
        return null;
    }

    return user;
}

function requireAdmin() {
    const user = requireAuth();

    if (!user) return null;

    if (user.role !== "admin") {
        alert("Administrator access required.");
        window.location.replace("dashboard.html");
        return null;
    }

    return user;
}

// ---------------- DATE AND TIME ----------------

function formatDate(date) {
    if (!date) return "";

    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function formatTime(time) {
    if (!time) return "";

    const parts = time.split(":");
    const hour = Number(parts[0]);
    const minute = Number(parts[1]);

    if (Number.isNaN(hour) || Number.isNaN(minute)) {
        return time;
    }

    const date = new Date();
    date.setHours(hour, minute, 0, 0);

    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });
}

function meetingStartDate(meeting) {
    return new Date(`${meeting.date}T${meeting.startTime}`);
}

// ---------------- MEETING STATUS ----------------

function getMeetingStatus(meeting) {
    if (meeting.cancelled) return "cancelled";

    const end = new Date(`${meeting.date}T${meeting.endTime}`);

    if (Number.isNaN(end.getTime())) return "upcoming";

    return end < new Date() ? "completed" : "upcoming";
}

function statusBadge(meeting) {
    const status = getMeetingStatus(meeting);

    return `
        <span class="status ${status}">
            ${status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    `;
}

// ---------------- SECURITY HELPERS ----------------

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// ---------------- NOTIFICATIONS ----------------

function addNotification(title, message, userEmail = "") {
    const notifications = getNotifications();

    notifications.unshift({
        id: "notice-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
        title,
        message,
        userEmail,
        date: new Date().toISOString(),
        read: false
    });

    saveNotifications(notifications);
}

// ---------------- CONFLICT DETECTION ----------------

function checkConflict(
    date,
    startTime,
    endTime,
    participants = [],
    ignoreId = null
) {
    const requestedParticipants = participants.map(email =>
        String(email).trim().toLowerCase()
    );

    return getMeetings().find(meeting => {
        if (
            meeting.id === ignoreId ||
            meeting.cancelled ||
            meeting.date !== date
        ) {
            return false;
        }

        const existingParticipants = (meeting.participants || []).map(email =>
            String(email).trim().toLowerCase()
        );

        const sharedParticipants = requestedParticipants.some(email =>
            existingParticipants.includes(email)
        );

        return sharedParticipants &&
            startTime < meeting.endTime &&
            endTime > meeting.startTime;
    });
}

// ---------------- PAGE INITIALIZATION ----------------

function initializePage() {
    initializeAdmin();

    const user = currentUser();

    if (document.body.classList.contains("auth-page")) {
        return;
    }

    if (!user) {
        window.location.replace("index.html");
        return;
    }

    const nameElement = document.getElementById("userName");
    const avatar = document.getElementById("userAvatar");

    if (nameElement) {
        nameElement.textContent = user.name;
    }

    if (avatar) {
        avatar.textContent = user.name
            ? user.name.charAt(0).toUpperCase()
            : "U";
    }

    const adminLink = document.getElementById("adminNav");

    if (adminLink && user.role !== "admin") {
        adminLink.style.display = "none";
    }

    const logoutLink = document.getElementById("logoutLink");

    if (logoutLink) {
        logoutLink.addEventListener("click", event => {
            event.preventDefault();
            logout();
        });
    }
}

document.addEventListener("DOMContentLoaded", initializePage);