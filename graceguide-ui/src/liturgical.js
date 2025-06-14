export async function fetchLiturgicalDay() {
  const litBanner = document.getElementById("litBanner");
  const litBody = document.getElementById("litBody");
  try {
    const res = await fetch("/liturgical-day");
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    const title = data.celebrations?.[0]?.title || "";
    if (litBanner) {
      litBanner.textContent = title;
      litBanner.classList.remove("hidden");
    }
    if (litBody) litBody.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    console.error("liturgical-day", err);
  }
}
