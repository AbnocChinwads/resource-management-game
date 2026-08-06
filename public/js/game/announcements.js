export async function checkAnnouncements() {
  try {
    const response = await fetch("/api/announcements", {
      credentials: "include",
    });

    const data = await response.json();

    if (!data.announcements.length) {
      return;
    }

    const announcement = data.announcements[0];

    const titleEl = document.getElementById("announcementTitle");

    const messageEl = document.getElementById("announcementMessage");

    const modalEl = document.getElementById("announcementModal");

    const confirmEl = document.getElementById("announcementConfirm");

    if (!titleEl || !messageEl || !modalEl || !confirmEl) {
      return;
    }

    titleEl.textContent = announcement.title;
    messageEl.textContent = announcement.message;

    const modal = new bootstrap.Modal(modalEl);

    modal.show();

    confirmEl.onclick = async () => {
      await fetch(`/api/announcements/${announcement.id}/seen`, {
        method: "POST",
        credentials: "include",
      });

      modal.hide();
    };
  } catch (err) {
    console.error("Announcement check failed: ", err);
  }
}
