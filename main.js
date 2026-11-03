const searchBtn = document.getElementById("search-btn");
const countryInp = document.getElementById("country-inp");
const result = document.getElementById("result");

searchBtn.addEventListener("click", searchCountry);

// search with the Enter key too
countryInp.addEventListener("keyup", (e) => {
  if (e.key === "Enter") searchCountry();
});

async function searchCountry() {
  const countryName = countryInp.value.trim();

  if (countryName === "") {
    result.innerHTML = "";
    showModal({
      type: "error",
      icon: "✏️",
      title: "No country entered",
      message: "Please type a country name to search.",
      buttonText: "OK",
    });
    return;
  }

  result.innerHTML = `<p class="status">Searching...</p>`;

  // step 1: get the data from the API
  let countries;
  try {
    countries = await fetchCountries(countryName);
  } catch (error) {
    console.error("Search failed:", error);
    result.innerHTML = "";
    showModal({
      type: "error",
      icon: "🌍",
      title: "Country not found",
      message: "Please check the spelling and try again.",
      buttonText: "Try again",
    });
    return;
  }

  // step 2: show the data on the page
  try {
    showCountry(countries[0]);
  } catch (error) {
    console.error("Display failed:", error);
    result.innerHTML = "";
    showModal({
      type: "error",
      icon: "⚠️",
      title: "Something went wrong",
      message: "We found the country but could not display its data. Check the console for details.",
      buttonText: "OK",
    });
  }
}

async function fetchCountries(name) {
  const encoded = encodeURIComponent(name);

  // exact match first
  let response = await fetch(
    `https://restcountries.com/v3.1/name/${encoded}?fullText=true`
  );

  // fallback: partial match (for example "egy" or "united")
  if (!response.ok) {
    response = await fetch(`https://restcountries.com/v3.1/name/${encoded}`);
  }

  if (!response.ok) {
    throw new Error(`API returned status ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("No country data returned");
  }
  return data;
}

function showCountry(country) {
  // safe fallbacks for countries that are missing some data
  const capital = country.capital?.[0] ?? "N/A";
  const continent = country.continents?.[0] ?? "N/A";
  const population = country.population.toLocaleString();

  const currencyCode = country.currencies ? Object.keys(country.currencies)[0] : null;
  const currency = currencyCode
    ? `${country.currencies[currencyCode].name} (${currencyCode})`
    : "N/A";

  const languages = country.languages
    ? Object.values(country.languages).join(", ")
    : "N/A";

  result.innerHTML = `
    <img src="${country.flags.svg}" alt="Flag of ${country.name.common}" class="flag-img">
    <h2>${country.name.common}</h2>

    <div class="wrapper">
      <div class="data-wrapper">
        <h4>Capital</h4>
        <span>${capital}</span>
      </div>
    </div>

    <div class="wrapper">
      <div class="data-wrapper">
        <h4>Continent</h4>
        <span>${continent}</span>
      </div>
    </div>

    <div class="wrapper">
      <div class="data-wrapper">
        <h4>Population</h4>
        <span>${population}</span>
      </div>
    </div>

    <div class="wrapper">
      <div class="data-wrapper">
        <h4>Currency</h4>
        <span>${currency}</span>
      </div>
    </div>

    <div class="wrapper">
      <div class="data-wrapper">
        <h4>Common Languages</h4>
        <span>${languages}</span>
      </div>
    </div>
  `;
}
function showModal({ type = "info", icon = "ℹ️", title, message, buttonText = "OK", onClose }) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
        <div class="modal modal-${type}" role="dialog" aria-modal="true">
            <div class="modal-icon">${icon}</div>
            <h2 class="modal-title">${title}</h2>
            <p class="modal-message">${message}</p>
            <button class="modal-btn">${buttonText}</button>
        </div>`;

    document.body.appendChild(overlay);

    const btn = overlay.querySelector(".modal-btn");
    btn.focus();

    function close() {
        overlay.remove();
        document.removeEventListener("keydown", onKey);
        if (onClose) onClose();
    }

    function onKey(e) {
        if (e.key === "Enter" || e.key === "Escape") close();
    }

    btn.addEventListener("click", close);
    overlay.addEventListener("click", e => {
        if (e.target === overlay) close();
    });
    document.addEventListener("keydown", onKey);
}