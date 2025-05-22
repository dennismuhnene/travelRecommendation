document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const clearButton = document.getElementById("clear-button");
    const resultsContainer = document.getElementById("results");

    // Load JSON data
    let travelData = [];

    fetch('travel_recommendation_api.json')
        .then(response => response.json())
        .then(data => {
            travelData = data.places; // assuming the JSON root has a "places" array
            console.log("Data loaded:", travelData);
        })
        .catch(error => console.error("Error loading JSON:", error));

    // Normalize keywords
    function normalizeKeyword(keyword) {
        const lower = keyword.toLowerCase();
        if (["beach", "beaches"].includes(lower)) return "beach";
        if (["temple", "temples"].includes(lower)) return "temple";
        return "country"; // fallback
    }

    // Get time in timezone
    function getTimeByZone(timeZone) {
        try {
            const options = {
                timeZone: timeZone,
                hour12: true,
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            };
            return new Date().toLocaleTimeString('en-US', options);
        } catch (e) {
            return "Time zone not available";
        }
    }

    // Display results
    function displayResults(filteredData, keyword) {
        resultsContainer.innerHTML = ""; // clear previous

        if (filteredData.length === 0) {
            resultsContainer.innerHTML = "<p>No results found.</p>";
            return;
        }

        filteredData.slice(0, 2).forEach(place => {
            const card = document.createElement("div");
            card.className = "place-card";

            card.innerHTML = `
                <h3>${place.name}</h3>
                <img src="${place.imageUrl}" alt="${place.name}" />
                <p>${place.description}</p>
                ${place.timeZone ? `<p><strong>Local Time:</strong> ${getTimeByZone(place.timeZone)}</p>` : ""}
            `;
            resultsContainer.appendChild(card);
        });
    }

    // Handle search
    searchButton.addEventListener("click", () => {
        const keyword = normalizeKeyword(searchInput.value.trim());

        let filteredResults = [];
        if (keyword === "beach") {
            filteredResults = travelData.filter(place =>
                place.description.toLowerCase().includes("beach")
            );
        } else if (keyword === "temple") {
            filteredResults = travelData.filter(place =>
                place.description.toLowerCase().includes("temple")
            );
        } else {
            filteredResults = travelData.filter(place =>
                place.country.toLowerCase().includes(searchInput.value.trim().toLowerCase())
            );
        }

        displayResults(filteredResults, keyword);
    });

    // Handle clear
    clearButton.addEventListener("click", () => {
        resultsContainer.innerHTML = "";
        searchInput.value = "";
    });
});
