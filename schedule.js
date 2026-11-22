// ==========================================================
// MEETSYNC - SCHEDULE MEETING
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    if (!requireAuth()) return;

    const form = document.getElementById("scheduleForm");
    const message = document.getElementById("scheduleMessage");

    if (!form || !message) return;

    form.noValidate = true;

    form.addEventListener("submit", event => {
        event.preventDefault();

        message.textContent = "";
        message.classList.remove("success");

        const title = document.getElementById("title").value.trim();
        const description = document.getElementById("description").value.trim();
        const date = document.getElementById("date").value;
        const startTime = document.getElementById("startTime").value;
        const endTime = document.getElementById("endTime").value;

        // ---------------- VALIDATION ----------------

        if (!title || !date || !startTime || !endTime) {
            message.textContent = "Please fill in all required fields.";
            return;
        }

        if (startTime >= endTime) {
            message.textContent = "The end time must be later than the start time.";
            return;
        }

        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(`${date}T${endTime}`);

        if (
            Number.isNaN(startDateTime.getTime()) ||
            Number.isNaN(endDateTime.getTime())
        ) {
            message.textContent = "Please enter a valid date and time.";
            return;
        }

        if (startDateTime <= new Date()) {
            message.textContent = "Please schedule a meeting in the future.";
            return;
        }

        // ---------------- SAVE MEETING ----------------

        const user = currentUser();

        if (!user) return;

        const meetings = getMeetings();
        const meetingId = "meeting-" + Date.now();

        const meeting = {
            id: meetingId,
            title,
            description,
            date,
            startTime,
            endTime,
            platform: "MeetSync",
            participants: [user.email],
            meetingLink: new URL(
                `join.html?id=${encodeURIComponent(meetingId)}`,
                window.location.href
            ).href,
            createdBy: user.email,
            createdByName: user.name,
            cancelled: false,
            createdAt: new Date().toISOString()
        };

        meetings.push(meeting);
        saveMeetings(meetings);

        // ---------------- NOTIFICATION ----------------

        addNotification(
            "Meeting Scheduled",
            `"${title}" has been scheduled for ${formatDate(date)} at ${formatTime(startTime)}.`,
            user.email
        );

        message.textContent = "Meeting scheduled successfully!";
        message.classList.add("success");

        form.reset();

        // ---------------- REDIRECT ----------------

        setTimeout(() => {
            window.location.href = "meetings.html";
        }, 1000);

    });

});