document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const clearButton = document.getElementById("clear-button");

  let resultsContainer = document.createElement("div");
  resultsContainer.id = "results-container";
  resultsContainer.style.padding = "20px";
  resultsContainer.style.maxWidth = "900px";
  resultsContainer.style.margin = "30px auto";
  resultsContainer.style.background = "rgba(255, 255, 255, 0.85)";
  resultsContainer.style.borderRadius = "10px";
  resultsContainer.style.boxShadow = "0 0 10px rgba(0,0,0,0.1)";
  document.body.insertBefore(resultsContainer, document.querySelector(".carousel"));

  let flatRecommendations = [];

  // Load and flatten JSON data
  fetch("travel_recommendation_api.json")
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch recommendation data");
      return response.json();
    })
    .then((data) => {
      flatRecommendations = flattenRecommendations(data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      resultsContainer.innerHTML = `<p style="color:red;">Failed to load recommendations data.</p>`;
    });

  function flattenRecommendations(data) {
    const flatList = [];

    // Flatten countries -> cities
    data.countries.forEach((country) => {
      country.cities.forEach((city) => {
        flatList.push({
          type: "country",
          country: country.name,
          name: city.name,
          imageUrl: city.imageUrl,
          description: city.description,
          timeZone: null // Optional: add actual timezones if available
        });
      });
    });

    // Flatten temples
    data.temples.forEach((temple) => {
      flatList.push({
        type: "temple",
        country: temple.name.split(", ").pop(),
        name: temple.name,
        imageUrl: temple.imageUrl,
        description: temple.description,
        timeZone: null
      });
    });

    // Flatten beaches
    data.beaches.forEach((beach) => {
      flatList.push({
        type: "beach",
        country: beach.name.split(", ").pop(),
        name: beach.name,
        imageUrl: beach.imageUrl,
        description: beach.description,
        timeZone: null
      });
    });

    // --- NEW: Flatten africanDestinations ---
    if (data.africanDestinations && Array.isArray(data.africanDestinations)) {
      data.africanDestinations.forEach((region) => {
        region.places.forEach((place) => {
          flatList.push({
            type: "africanDestination",
            region: region.region,          // Region name, e.g. "East Africa"
            country: null,                  // Could be added if you want; currently null
            name: place.name,
            imageUrl: place.imageUrl,
            description: place.description,
            timeZone: null
          });
        });
      });
    }

    return flatList;
  }

  const keywordsMap = {
    beach: ["beach", "beaches"],
    temple: ["temple", "temples"]
    // You can add more type mappings if you want
  };

  function clearResults() {
    resultsContainer.innerHTML = "";
  }

  function showTimeForTimeZone(timeZone) {
    if (!timeZone) return "";
    const options = {
      timeZone: timeZone,
      hour12: true,
      hour: "numeric",
      minute: "numeric",
      second: "numeric"
    };
    const timeString = new Date().toLocaleTimeString("en-US", options);
    return `<p><strong>Current local time:</strong> ${timeString}</p>`;
  }

  function filterRecommendations(keyword) {
    if (!keyword) return [];

    keyword = keyword.toLowerCase().trim();

    // Check keyword mapping
    for (const key in keywordsMap) {
      if (keywordsMap[key].includes(keyword)) {
        return flatRecommendations.filter(
          (place) => place.type.toLowerCase() === key
        );
      }
    }

    // Additional: if keyword matches any african region name, filter by that region
    const africanRegions = flatRecommendations
      .filter(p => p.type === "africanDestination" && p.region)
      .map(p => p.region.toLowerCase());

    if (africanRegions.includes(keyword)) {
      return flatRecommendations.filter(
        (place) =>
          place.type === "africanDestination" &&
          place.region.toLowerCase() === keyword
      );
    }

    // Fallback: match country, region (for African destinations), or name
    return flatRecommendations.filter(
      (place) =>
        (place.country && place.country.toLowerCase().includes(keyword)) ||
        (place.region && place.region.toLowerCase().includes(keyword)) ||
        (place.name && place.name.toLowerCase().includes(keyword))
    );
  }

  function renderRecommendations(results, keyword) {
    clearResults();

    if (results.length === 0) {
      resultsContainer.innerHTML = `<p>No recommendations found for "<strong>${keyword}</strong>". Please try beach, temple, or a country name.</p>`;
      return;
    }

    const displayed = results.slice(0, 4);
    displayed.forEach((place) => {
      const placeCard = document.createElement("div");
      placeCard.style.display = "flex";
      placeCard.style.gap = "20px";
      placeCard.style.marginBottom = "30px";
      placeCard.style.alignItems = "center";

      const img = document.createElement("img");
      img.src = `images/${place.imageUrl}`;
      img.alt = place.name;
      img.style.width = "200px";
      img.style.height = "130px";
      img.style.objectFit = "cover";
      img.style.borderRadius = "8px";
      img.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";

      const infoDiv = document.createElement("div");
      infoDiv.style.flex = "1";

      const nameEl = document.createElement("h2");
      nameEl.textContent = place.name;

      const descEl = document.createElement("p");
      descEl.textContent = place.description;

      const timeEl = document.createElement("div");
      timeEl.innerHTML = showTimeForTimeZone(place.timeZone);

      infoDiv.appendChild(nameEl);
      infoDiv.appendChild(descEl);
      infoDiv.appendChild(timeEl);

      placeCard.appendChild(img);
      placeCard.appendChild(infoDiv);

      resultsContainer.appendChild(placeCard);
    });
  }

  // Common search function to call from button or enter key
  function performSearch() {
    const keyword = searchInput.value.trim();
    if (!keyword) {
      alert("Please enter a keyword to search (e.g., beach, temple, Japan, Africa).");
      return;
    }

    const results = filterRecommendations(keyword);
    renderRecommendations(results, keyword);
  }

  searchButton.addEventListener("click", performSearch);

  // *** Added: Trigger search on Enter key ***
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      performSearch();
    }
  });

  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    clearResults();
  });
});
