document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const clearButton = document.getElementById("clear-button");
  
    // Create and insert results container after nav
    let resultsContainer = document.createElement("div");
    resultsContainer.id = "results-container";
    resultsContainer.style.padding = "20px";
    resultsContainer.style.maxWidth = "900px";
    resultsContainer.style.margin = "30px auto";
    resultsContainer.style.background = "rgba(255, 255, 255, 0.85)";
    resultsContainer.style.borderRadius = "10px";
    resultsContainer.style.boxShadow = "0 0 10px rgba(0,0,0,0.1)";
    document.body.insertBefore(resultsContainer, document.querySelector(".carousel"));
  
    let recommendationsData = [];
  
    // Fetch the recommendations JSON data
    fetch("travel_recommendation_api.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch recommendation data");
        }
        return response.json();
      })
      .then((data) => {
        recommendationsData = data;
        console.log("Recommendations data loaded:", recommendationsData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        resultsContainer.innerHTML = `<p style="color:red;">Failed to load recommendations data.</p>`;
      });
  
    // Normalize keywords mapping for search
    const keywordsMap = {
      beach: ["beach", "beaches"],
      temple: ["temple", "temples"],
      country: [] // special case, we'll treat country search differently
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
        second: "numeric",
      };
      const timeString = new Date().toLocaleTimeString("en-US", options);
      return `<p><strong>Current local time:</strong> ${timeString}</p>`;
    }
  
    function filterRecommendations(keyword) {
      if (!keyword) return [];
  
      keyword = keyword.toLowerCase().trim();
  
      // Check if it's one of the predefined categories
      for (const key in keywordsMap) {
        if (keywordsMap[key].includes(keyword) || key === keyword) {
          // Filter by type matching the key (beach or temple)
          if (key === "country") {
            // For countries, filter by country name matching keyword
            return recommendationsData.filter((place) =>
              place.country.toLowerCase().includes(keyword)
            );
          }
          return recommendationsData.filter(
            (place) => place.type.toLowerCase() === key
          );
        }
      }
  
      // If keyword doesn't match, check if it matches any country name in data
      return recommendationsData.filter((place) =>
        place.country.toLowerCase().includes(keyword)
      );
    }
  
    function renderRecommendations(results, keyword) {
      clearResults();
  
      if (results.length === 0) {
        resultsContainer.innerHTML = `<p>No recommendations found for "<strong>${keyword}</strong>". Please try beach, temple, or a country name.</p>`;
        return;
      }
  
      // Limit results to 2 per spec
      const displayed = results.slice(0, 2);
  
      displayed.forEach((place) => {
        const placeCard = document.createElement("div");
        placeCard.style.display = "flex";
        placeCard.style.gap = "20px";
        placeCard.style.marginBottom = "30px";
        placeCard.style.alignItems = "center";
  
        const img = document.createElement("img");
        img.src = `images/${place.imageUrl}`; // Assuming images are inside /images folder
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
  
    searchButton.addEventListener("click", () => {
      const keyword = searchInput.value;
      if (!keyword) {
        alert("Please enter a keyword to search (e.g., beach, temple, Japan).");
        return;
      }
  
      const results = filterRecommendations(keyword.toLowerCase());
      renderRecommendations(results, keyword);
    });
  
    clearButton.addEventListener("click", () => {
      searchInput.value = "";
      clearResults();
    });
  });
  