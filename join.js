// ==========================================================
// MEETSYNC - MEETING ROOM
// ==========================================================

document.addEventListener("DOMContentLoaded", async () => {

    if (!requireAuth()) return;

    const params = new URLSearchParams(window.location.search);
    const meetingId = params.get("id");

    const codeElement = document.getElementById("meetingCode");
    const video = document.getElementById("localVideo");
    const placeholder = document.getElementById("cameraPlaceholder");
    const message = document.getElementById("roomMessage");

    const microphoneButton = document.getElementById("microphoneButton");
    const cameraButton = document.getElementById("cameraButton");
    const copyButton = document.getElementById("copyButton");
    const copyLinkButton = document.getElementById("copyLink");
    const leaveButton = document.getElementById("leaveButton");

    let localStream = null;
    let microphoneEnabled = true;
    let cameraEnabled = true;

    // ---------------- VALIDATE MEETING ----------------

    const meeting = getMeetings().find(item => item.id === meetingId);

    if (!meetingId || !meeting || meeting.cancelled) {

        if (message) {
            message.textContent = "This meeting does not exist or has been cancelled.";
        }

        if (microphoneButton) microphoneButton.disabled = true;
        if (cameraButton) cameraButton.disabled = true;

        return;
    }

    if (codeElement) {
        codeElement.textContent = meetingId;
    }

    if (message) {
        message.textContent = `Welcome to ${meeting.title}.`;
    }

    // ---------------- CAMERA ----------------

    async function startCamera() {

        try {

            if (!navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia) {

                throw new Error("Camera access requires HTTPS or localhost.");
            }

            localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            if (video) {
                video.srcObject = localStream;
                video.muted = true;
                video.play().catch(() => {});
            }

            if (placeholder) {
                placeholder.style.display = "none";
            }

            if (message) {
                message.textContent = "Your camera and microphone are ready.";
            }

        } catch (error) {

            console.error(error);

            if (message) {
                message.textContent =
                    "Camera or microphone unavailable. You can still view the meeting room.";
            }
        }
    }

    // ---------------- MICROPHONE ----------------

    if (microphoneButton) {

        microphoneButton.addEventListener("click", () => {

            if (!localStream) {
                if (message) {
                    message.textContent = "Microphone is unavailable.";
                }
                return;
            }

            microphoneEnabled = !microphoneEnabled;

            localStream.getAudioTracks().forEach(track => {
                track.enabled = microphoneEnabled;
            });

            microphoneButton.textContent = microphoneEnabled
                ? "🎤 Mute Microphone"
                : "🔇 Unmute Microphone";
        });
    }

    // ---------------- CAMERA ----------------

    if (cameraButton) {

        cameraButton.addEventListener("click", () => {

            if (!localStream) {
                if (message) {
                    message.textContent = "Camera is unavailable.";
                }
                return;
            }

            cameraEnabled = !cameraEnabled;

            localStream.getVideoTracks().forEach(track => {
                track.enabled = cameraEnabled;
            });

            if (placeholder) {
                placeholder.style.display = cameraEnabled
                    ? "none"
                    : "flex";
            }

            cameraButton.textContent = cameraEnabled
                ? "📷 Turn Camera Off"
                : "📷 Turn Camera On";
        });
    }

    // ---------------- COPY LINK ----------------

    async function copyMeetingLink() {

        const link = window.location.href;

        try {

            await navigator.clipboard.writeText(link);

            if (message) {
                message.textContent = "Meeting link copied successfully.";
            }

        } catch (error) {

            prompt("Copy your meeting link:", link);
        }
    }

    if (copyButton) {
        copyButton.addEventListener("click", copyMeetingLink);
    }

    if (copyLinkButton) {
        copyLinkButton.addEventListener("click", copyMeetingLink);
    }

    // ---------------- LEAVE ----------------

    function leaveMeeting() {

        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }

        window.location.href = "meetings.html";
    }

    if (leaveButton) {
        leaveButton.addEventListener("click", leaveMeeting);
    }

    // ---------------- START ----------------

    await startCamera();

});