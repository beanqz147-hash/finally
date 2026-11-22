// ==========================================================
// MEETSYNC - REPORTS
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    if (!requireAuth()) return;

    const meetings = getMeetings();

    const upcoming = meetings.filter(m => getMeetingStatus(m) === "upcoming");
    const completed = meetings.filter(m => getMeetingStatus(m) === "completed");
    const cancelled = meetings.filter(m => getMeetingStatus(m) === "cancelled");

    const totalElement = document.getElementById("reportTotal");
    const completedElement = document.getElementById("reportCompleted");
    const cancelledElement = document.getElementById("reportCancelled");

    if (totalElement) totalElement.textContent = meetings.length;
    if (completedElement) completedElement.textContent = completed.length;
    if (cancelledElement) cancelledElement.textContent = cancelled.length;

    // ---------------- PLATFORM BREAKDOWN ----------------

    const platformCounts = {};

    meetings.forEach(meeting => {
        const platform = meeting.platform || "MeetSync";
        platformCounts[platform] = (platformCounts[platform] || 0) + 1;
    });

    const platformTable = document.getElementById("platformBreakdown");

    if (platformTable) {
        platformTable.innerHTML =
            Object.entries(platformCounts).map(([platform, count]) => `
                <tr>
                    <td>${escapeHTML(platform)}</td>
                    <td>${count}</td>
                </tr>
            `).join("") ||
            `<tr><td colspan="2">No platform data available.</td></tr>`;
    }

    // ---------------- MEETING TABLE ----------------

    const reportTable = document.getElementById("reportMeetings");

    if (reportTable) {
        const sortedMeetings = meetings.slice().sort(
            (a, b) => meetingStartDate(a) - meetingStartDate(b)
        );

        reportTable.innerHTML = sortedMeetings.map(meeting => `
            <tr>
                <td>${escapeHTML(meeting.title || "Untitled meeting")}</td>
                <td>${formatDate(meeting.date)}</td>
                <td>${escapeHTML(meeting.platform || "MeetSync")}</td>
                <td>${statusBadge(meeting)}</td>
            </tr>
        `).join("") ||
        `<tr><td colspan="4">No meetings available.</td></tr>`;
    }

    // ---------------- CHART ----------------

    const canvas = document.getElementById("reportChart");

    if (canvas && window.Chart) {

        const existingChart = Chart.getChart(canvas);

        if (existingChart) existingChart.destroy();

        new Chart(canvas, {
            type: "bar",

            data: {
                labels: ["Upcoming", "Completed", "Cancelled"],

                datasets: [{
                    label: "Meetings",
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
                    borderRadius: 7
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        display: false
                    }
                },

                scales: {
                    x: {
                        ticks: {
                            color: "#b9c1d0"
                        },
                        grid: {
                            color: "#343945"
                        }
                    },

                    y: {
                        beginAtZero: true,

                        ticks: {
                            color: "#b9c1d0",
                            precision: 0
                        },

                        grid: {
                            color: "#343945"
                        }
                    }
                }
            }
        });
    }

    // ---------------- CSV EXPORT ----------------

    const exportButton = document.getElementById("exportReport");

    if (exportButton) {

        exportButton.addEventListener("click", () => {

            const rows = [
                ["Meeting", "Date", "Start Time", "End Time", "Platform", "Status"],

                ...meetings.map(meeting => [
                    meeting.title || "",
                    meeting.date || "",
                    meeting.startTime || "",
                    meeting.endTime || "",
                    meeting.platform || "MeetSync",
                    getMeetingStatus(meeting)
                ])
            ];

            const csv = rows.map(row =>
                row.map(value =>
                    `"${String(value ?? "").replace(/"/g, '""')}"`
                ).join(",")
            ).join("\r\n");

            const blob = new Blob(
                ["\uFEFF" + csv],
                { type: "text/csv;charset=utf-8;" }
            );

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = "meetsync-report.csv";

            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => URL.revokeObjectURL(url), 1000);
        });
    }

});