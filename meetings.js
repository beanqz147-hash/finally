// ==========================================================
// MEETSYNC - MEETING MANAGEMENT
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    if (!requireAuth()) return;

    const list = document.getElementById("meetingsList");
    const searchInput = document.getElementById("meetingSearch");
    const filterInput = document.getElementById("meetingFilter");

    if (!list) return;

    function render() {
        let meetings = getMeetings();

        const search = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        const filter = filterInput
            ? filterInput.value
            : "all";

        meetings = meetings.filter(meeting => {
            const matchesSearch = meeting.title
                .toLowerCase()
                .includes(search);

            const matchesFilter =
                filter === "all" ||
                getMeetingStatus(meeting) === filter;

            return matchesSearch && matchesFilter;
        });

        meetings.sort((a, b) =>
            meetingStartDate(a) - meetingStartDate(b)
        );

        if (!meetings.length) {
            list.innerHTML = `
                <div class="panel empty-state">
                    No meetings found.
                </div>
            `;
            return;
        }

        list.innerHTML = meetings.map(meeting => `
            <article class="meeting-card">
                <div class="meeting-card-header">
                    <h3>${escapeHTML(meeting.title)}</h3>
                    ${statusBadge(meeting)}
                </div>

                <p>${escapeHTML(meeting.description || "No description provided.")}</p>

                <div class="meeting-details">
                    <span><strong>Date:</strong> ${formatDate(meeting.date)}</span>
                    <span><strong>Start:</strong> ${formatTime(meeting.startTime)}</span>
                    <span><strong>End:</strong> ${formatTime(meeting.endTime)}</span>
                    <span><strong>Organizer:</strong> ${escapeHTML(meeting.createdByName || "Unknown")}</span>
                    <span><strong>Platform:</strong> ${escapeHTML(meeting.platform || "MeetSync")}</span>
                </div>

                <div class="meeting-actions">
                    ${
                        getMeetingStatus(meeting) === "upcoming"
                        ? `<button class="btn btn-primary" data-join="${escapeHTML(meeting.id)}">Join</button>`
                        : ""
                    }

                    ${
                        meeting.createdBy === currentUser().email &&
                        getMeetingStatus(meeting) !== "cancelled"
                        ? `
                            <button class="btn btn-secondary" data-edit="${escapeHTML(meeting.id)}">Edit</button>
                            <button class="btn btn-danger" data-cancel="${escapeHTML(meeting.id)}">Cancel</button>
                          `
                        : ""
                    }

                    <button class="btn btn-secondary" data-copy="${escapeHTML(meeting.id)}">Copy Link</button>
                </div>
            </article>
        `).join("");
    }

    // ---------------- ACTIONS ----------------

    list.addEventListener("click", event => {

        const joinId = event.target.dataset.join;
        const editId = event.target.dataset.edit;
        const cancelId = event.target.dataset.cancel;
        const copyId = event.target.dataset.copy;

        if (joinId) {
            const meeting = getMeetings().find(m => m.id === joinId);

            if (!meeting || meeting.cancelled) {
                alert("This meeting is unavailable.");
                return;
            }

            window.location.href =
                `join.html?id=${encodeURIComponent(joinId)}`;
        }

        if (copyId) {
            const meeting = getMeetings().find(m => m.id === copyId);

            if (!meeting) return;

            const link = new URL(
                `join.html?id=${encodeURIComponent(copyId)}`,
                window.location.href
            ).href;

            navigator.clipboard.writeText(link)
                .then(() => alert("Meeting link copied."))
                .catch(() => prompt("Copy this meeting link:", link));
        }

        if (cancelId) {
            if (!confirm("Cancel this meeting?")) return;

            const meetings = getMeetings();
            const meeting = meetings.find(m => m.id === cancelId);

            if (!meeting) return;

            meeting.cancelled = true;
            saveMeetings(meetings);

            addNotification(
                "Meeting Cancelled",
                `"${meeting.title}" has been cancelled.`,
                meeting.createdBy
            );

            render();
        }

        if (editId) {
            editMeeting(editId);
        }
    });

    // ---------------- EDIT ----------------

    function editMeeting(id) {
        const meetings = getMeetings();
        const meeting = meetings.find(m => m.id === id);

        if (!meeting) return;

        const title = prompt("Meeting title:", meeting.title);

        if (title === null) return;

        const description = prompt(
            "Meeting description:",
            meeting.description || ""
        );

        if (description === null) return;

        const date = prompt("Meeting date (YYYY-MM-DD):", meeting.date);

        if (date === null) return;

        const startTime = prompt(
            "Start time (HH:MM):",
            meeting.startTime
        );

        if (startTime === null) return;

        const endTime = prompt(
            "End time (HH:MM):",
            meeting.endTime
        );

        if (endTime === null) return;

        if (!title.trim() || !date || !startTime || !endTime) {
            alert("All required fields must be filled.");
            return;
        }

        if (startTime >= endTime) {
            alert("End time must be later than start time.");
            return;
        }

        if (new Date(`${date}T${startTime}`) <= new Date()) {
            alert("Choose a future date and time.");
            return;
        }

        meeting.title = title.trim();
        meeting.description = description.trim();
        meeting.date = date;
        meeting.startTime = startTime;
        meeting.endTime = endTime;

        saveMeetings(meetings);

        addNotification(
            "Meeting Updated",
            `"${meeting.title}" has been updated.`,
            meeting.createdBy
        );

        render();
    }

    // ---------------- SEARCH AND FILTER ----------------

    if (searchInput) {
        searchInput.addEventListener("input", render);
    }

    if (filterInput) {
        filterInput.addEventListener("change", render);
    }

    render();

});