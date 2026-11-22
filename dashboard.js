// ==========================================================
// MEETSYNC - DASHBOARD
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    if (!requireAuth()) return;

    const meetings = getMeetings();
    const notifications = getNotifications();

    const upcoming = meetings.filter(
        meeting => getMeetingStatus(meeting) === "upcoming"
    );

    const completed = meetings.filter(
        meeting => getMeetingStatus(meeting) === "completed"
    );

    const cancelled = meetings.filter(
        meeting => getMeetingStatus(meeting) === "cancelled"
    );

    const unread = notifications.filter(
        notification => !notification.read
    );

    // ---------------- STATISTICS ----------------

    const totalElement = document.getElementById("totalMeetings");
    const upcomingElement = document.getElementById("upcomingMeetings");
    const completedElement = document.getElementById("completedMeetings");
    const unreadElement = document.getElementById("unreadNotifications");

    if (totalElement) totalElement.textContent = meetings.length;
    if (upcomingElement) upcomingElement.textContent = upcoming.length;
    if (completedElement) completedElement.textContent = completed.length;
    if (unreadElement) unreadElement.textContent = unread.length;

    // ---------------- UPCOMING MEETINGS ----------------

    const table = document.getElementById("recentMeetings");

    if (table) {

        const sortedUpcoming = upcoming
            .slice()
            .sort((a, b) => meetingStartDate(a) - meetingStartDate(b))
            .slice(0, 6);

        if (!sortedUpcoming.length) {

            table.innerHTML = `
                <tr>
                    <td colspan="5">No upcoming meetings.</td>
                </tr>
            `;

        } else {

            table.innerHTML = sortedUpcoming.map(meeting => {

                const link = `join.html?id=${encodeURIComponent(meeting.id)}`;

                return `
                    <tr>
                        <td>${escapeHTML(meeting.title)}</td>
                        <td>${formatDate(meeting.date)}</td>
                        <td>${formatTime(meeting.startTime)}</td>
                        <td>${statusBadge(meeting)}</td>
                        <td>
                            <a class="btn btn-primary"
                               href="${link}">
                               Join
                            </a>
                        </td>
                    </tr>
                `;
            }).join("");
        }
    }

    // ---------------- CHART ----------------

    const canvas = document.getElementById("meetingChart");

    if (canvas && window.Chart) {

        const existingChart = Chart.getChart(canvas);

        if (existingChart) {
            existingChart.destroy();
        }

        new Chart(canvas, {
            type: "doughnut",

            data: {
                labels: ["Upcoming", "Completed", "Cancelled"],

                datasets: [{
                    data: [
                        upcoming.length,
                        completed.length,
                        cancelled.length
                    ],

                    backgroundColor: [
                        "#438cff",
                        "#35c995",
                        "#f16c80"
                    ],

                    borderWidth: 0
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        position: "bottom",

                        labels: {
                            color: "#b9c1d0",
                            padding: 18
                        }
                    }
                }
            }
        });
    }

});