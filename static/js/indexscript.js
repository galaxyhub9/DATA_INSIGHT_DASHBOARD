let cofferData = [];
let filteredData = [];
let currentPage = 0;
const rowsPerPage = 5;
let selectedCountry = "India";
let defaultSector = "Energy";
let chartInstance = null;
let trendingChartInstance = null;
let countryChart = null;




fetch("http://127.0.0.1:8000/api/cofferData/")
  .then((response) => response.json())
  .then((data) => {
    cofferData = data;
    filteredData = data;
    displayTable();
    updateDoughnutChart(selectedCountry);
    updateTrendingTopicsChart(selectedCountry);
    applySectorFilter(defaultSector);
  })
  .catch((error) => console.error("Error fetching data:", error));

console.log(filteredData, cofferData);

function displayTable() {
  const start = currentPage * rowsPerPage;
  const end = start + rowsPerPage;
  const rows = filteredData.slice(start, end);
  const tableBody = document.getElementById("tableBody");

  tableBody.innerHTML = "";

  rows.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
              <td>${item.title}</td>
              <td><a href="${item.url}" target="_blank">${item.source}</a></td>
              <td>${formatDate(item.published)}</td>
              <td>${item.region}</td>
          `;
    tableBody.appendChild(row);
  });

  document.getElementById("loadMoreButton").disabled =
    end >= filteredData.length;
}

function formatDate(dateString) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  let date = new Date(dateString);
  let day = date.getDate();
  let month = months[date.getMonth()];
  let year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

function applyFilters() {
  let country = document.getElementById("countryFilter").value;
  let region = document.getElementById("regionFilter").value;
  let pestle = document.getElementById("mainPestleFilter").value;
  let intensity = document.getElementById("intensityFilter").value;
  let relevance = document.getElementById("mainRelveanceFilter").value;

  filteredData = cofferData.filter((item) => {
    let isCountryMatch = !country || item.country === country;
    let isRegionMatch = !region || item.region === region;
    let isPestleMatch = !pestle || item.pestle === pestle;
    let isIntensityMatch = !intensity || item.intensity == intensity;
    let isRelevanceMatch = !relevance || item.relevance == relevance;

    return (
      isCountryMatch &&
      isRegionMatch &&
      isPestleMatch &&
      isIntensityMatch &&
      isRelevanceMatch
    );
  });

  currentPage = 0;
  displayTable();
}

document.addEventListener("DOMContentLoaded", function () {
  function safeAddEventListener(id, event, handler) {
      let element = document.getElementById(id);
      if (element) {
          element.addEventListener(event, handler);
      } else {
          console.error(`Element with ID '${id}' not found in the DOM.`);
      }
  }

  safeAddEventListener("countryFilter", "change", applyFilters);
  safeAddEventListener("regionFilter", "change", applyFilters);
  safeAddEventListener("mainPestleFilter", "change", applyFilters);
  safeAddEventListener("intensityFilter", "input", applyFilters);
  safeAddEventListener("mainRelveanceFilter", "input", applyFilters);
  safeAddEventListener("loadMoreButton", "click", function () {
      currentPage++;
      displayTable();
  });
});

function updateDoughnutChart(country) {
  selectedCountry = country;
  document.getElementById("selectedCountryText").innerText = `${country}`;

  const countryData = cofferData.filter(
    (item) => item.country === country
  );

  let sourceCounts = {};
  countryData.forEach((item) => {
    if (item.source) {
      sourceCounts[item.source] = (sourceCounts[item.source] || 0) + 1;
    }
  });

  let sortedSources = Object.entries(sourceCounts).sort(
    (a, b) => b[1] - a[1]
  );

  let topSources = sortedSources.slice(0, 5);

  let total = topSources.reduce((sum, source) => sum + source[1], 0);

  let labels = topSources.map((source) => source[0]);
  let data = topSources.map((source) =>
    ((source[1] / total) * 100).toFixed(2)
  );

  let backgroundColors = [
    "#ff6384",
    "#36a2eb",
    "#ffce56",
    "#4bc0c0",
    "#9966ff",
  ];

  createDoughnutChart(labels, data, backgroundColors);
}

function createDoughnutChart(labels, data, backgroundColors) {
  let ctx = document.getElementById("topSourcesChart").getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColors,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        tooltip: {
          callbacks: {
            label: (tooltipItem) =>
              `${tooltipItem.label}: ${tooltipItem.raw}%`,
          },
        },
      },
    },
  });
}

document.getElementById("countryFilter").addEventListener("change", function () {
    updateDoughnutChart(this.value);
  });



function updateTrendingTopicsChart(selectedCountry) {
  country = selectedCountry;
  document.getElementById(
    "selectedCountryText2"
  ).innerText = `${country}`;

  let yearTopicData = {};

  let filteredData = cofferData.filter(
    (item) => item.country === selectedCountry
  );

  filteredData.forEach((item) => {
    let extractedYear = new Date(item.published).getFullYear();

    if (extractedYear && item.topic && item.intensity !== undefined) {
      if (!yearTopicData[extractedYear]) {
        yearTopicData[extractedYear] = [];
      }
      yearTopicData[extractedYear].push({
        topic: item.topic,
        intensity: item.intensity,
      });
    }
  });

  let years = Object.keys(yearTopicData).sort();
  let highTopics = [];
  let lowTopics = [];

  years.forEach((year) => {
    let topicsData = yearTopicData[year];

    if (topicsData.length > 0) {
      let highestTopic = topicsData.reduce(
        (max, topic) => (topic.intensity > max.intensity ? topic : max),
        topicsData[0]
      );
      let lowestTopic = topicsData.reduce(
        (min, topic) => (topic.intensity < min.intensity ? topic : min),
        topicsData[0]
      );

      highTopics.push({
        x: year,
        y: highestTopic.intensity,
        topic: highestTopic.topic,
      });
      lowTopics.push({
        x: year,
        y: lowestTopic.intensity,
        topic: lowestTopic.topic,
      });
    }
  });

  console.log("High Topics:", highTopics);
  console.log("Low Topics:", lowTopics);

  createTrendingLineChart(years, highTopics, lowTopics);
}

function createTrendingLineChart(years, highTopics, lowTopics) {
  let ctx = document
    .getElementById("trendingTopicsChart")
    .getContext("2d");

  if (trendingChartInstance) {
    trendingChartInstance.destroy();
  }

  trendingChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: years,
      datasets: [
        {
          label: "High Intensity Topics",
          data: highTopics.map((dp) => dp.y),
          borderColor: "#36a2eb",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          pointBackgroundColor: "#36a2eb",
          pointRadius: 3,
          fill: false,
        },
        {
          label: "Low Intensity Topics",
          data: lowTopics.map((dp) => dp.y),
          borderColor: "#ff6384",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          pointBackgroundColor: "#ff6384",
          pointRadius: 3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              let year = tooltipItem.label;
              let intensity = tooltipItem.raw;
              let topic =
                tooltipItem.datasetIndex === 0
                  ? highTopics[tooltipItem.dataIndex].topic
                  : lowTopics[tooltipItem.dataIndex].topic;
              return `Topic: ${topic}, Intensity: ${intensity}`;
            },
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: "Year" },
        },
        y: {
          title: { display: true, text: "Topic Intensity" },
        },
      },
    },
  });
}

document
  .getElementById("countryFilter")
  .addEventListener("change", function () {
    updateTrendingTopicsChart(this.value);
  });


document.addEventListener("DOMContentLoaded", function () {
  setSector("Energy");
  getTopInsight(defaultCountry);
});

document.getElementById("sectorToggle").addEventListener("click", function () {
    let menu = document.getElementById("sectorMenu");
    menu.style.display =
      menu.style.display === "block" ? "none" : "block";
  });

document.addEventListener("click", function (event) {
  let menu = document.getElementById("sectorMenu");
  let button = document.getElementById("sectorToggle");

  if (event.target !== menu && event.target !== button) {
    menu.style.display = "none";
  }
});

function setSector(sector) {
  document.getElementById("selectedSector").textContent = sector;
  document.getElementById("sectorMenu").style.display = "none";
  applySectorFilter(sector);
}

function applySectorFilter(selectedSector) {
  document.getElementById("selectedSector").textContent = selectedSector;

  let filteredData = cofferData.filter(
    (entry) => entry.sector === selectedSector
  );

  // Count occurrences of each country in the selected sector
  let countryCounts = {};
  filteredData.forEach((entry) => {
    if (entry.country) {
      countryCounts[entry.country] =
        (countryCounts[entry.country] || 0) + 1;
    }
  });

  // Get the top 5 most occurring countries
  let sortedCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topCountries = sortedCountries.map((item) => item[0]);
  const topCounts = sortedCountries.map((item) => item[1]);
  document.getElementById("countryCount").textContent =
    topCountries.length;

  if (!countryChart) {
    initializeCountryChart(topCountries, topCounts, selectedSector);
  } else {
    updateCountryChart(topCountries, topCounts, selectedSector);
  }
}

function initializeCountryChart(topCountries, topCounts, selectedSector) {
  const ctx = document.getElementById("countryChart").getContext("2d");

  countryChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: topCountries,
      datasets: [
        {
          label: `Top 5 Countries in ${selectedSector}`,
          data: topCounts,
          backgroundColor: getPremiumColors(5),
          borderRadius: 10,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Occurrences",
            font: { size: 14 },
          },
          ticks: { color: "#ffffff" },
        },
        y: {
          title: { display: false, text: "Country", font: { size: 14 } },
          ticks: { display: false, color: "#ffffff" },
        },
      },
    },
  });
  updateLegend(topCountries);
}

function updateCountryChart(topCountries, topCounts, selectedSector) {
  countryChart.data.labels = topCountries;
  countryChart.data.datasets[0].label = `Top 5 Countries in ${selectedSector}`;
  countryChart.data.datasets[0].data = topCounts;
  countryChart.data.datasets[0].backgroundColor = getPremiumColors(5);
  countryChart.update();
  updateLegend(topCountries);
}

function updateLegend(topCountries) {
  const colors = getPremiumColors(topCountries.length);
  const legendContainer = document.getElementById("countryLegend");
  legendContainer.innerHTML = "";

  topCountries.forEach((country, index) => {
    const legendItem = document.createElement("div");
    legendItem.classList.add("legend-item");

    const legendDot = document.createElement("span");
    legendDot.classList.add("legend-dot");
    legendDot.style.backgroundColor = colors[index];

    legendItem.appendChild(legendDot);
    legendItem.appendChild(document.createTextNode(country));

    legendContainer.appendChild(legendItem);
  });
}

function getPremiumColors(count) {
  return ["#FF6B6B", "#54A0FF", "#1DD1A1", "#F368E0", "#5F27CD"].slice(
    0,
    count
  );
}

let defaultCountry = "India";

async function getTopInsight(selectedCountry) {
  let country = selectedCountry || defaultCountry;

  try {
    let response = await fetch("http://127.0.0.1:8000/api/cofferData/");
    let insightsData = await response.json();

    let countryInsights = insightsData.filter(
      (insight) => insight.country === country
    );

    if (countryInsights.length === 0) {
      document.getElementById("topInsightText").innerText =
        "No insights available for " + country;
      document.getElementById("topInsightDetails").innerText = "";

      return;
    }

    countryInsights.sort((a, b) => {
      if (b.relevance !== a.relevance) {
        return b.relevance - a.relevance;
      } else if (b.intensity !== a.intensity) {
        return b.intensity - a.intensity;
      } else {
        return b.likelihood - a.likelihood;
      }
    });

    let topInsights = countryInsights.slice(0, 3);
    let insightsHTML = "";

    topInsights.forEach((insight, index) => {
      let formattedDate = "";
      if (insight.published) {
        let dateObj = new Date(insight.published);
        let month = dateObj.toLocaleString("en-US", { month: "long" });
        let year = dateObj.getFullYear();
        formattedDate = ` | ${month} ${year}`;
      }

      let sourceText = insight.source ? `Source: ${insight.source}` : "";

      insightsHTML += `
                <div class="insight-item">
                    <h4 class="insight-rank">#${index + 1} </h4>
                    <span class="insight-text">${insight.insight}</span>
                    
                    <p class="insight-details"><span class="light-text">${sourceText}${formattedDate}</span></p>
                </div>
            `;
    });

    document.getElementById("topInsightText").innerHTML = insightsHTML;
    document.getElementById("selectedCountry").innerText = country;
  } catch (error) {
    console.error("Error fetching data:", error);
    document.getElementById("topInsightText").innerText =
      "Failed to load insights.";
    document.getElementById("topInsightDetails").innerText = "";
  }
}
document.getElementById("countryFilter")
  .addEventListener("change", function () {
    let selectedCountry = this.value;
    getTopInsight(selectedCountry);
  });

fetch("http://127.0.0.1:8000/api/cofferData/")
  .then((response) => response.json())
  .then((data) => {
    const pestles = getUniqueValues(data, "pestle");
    const regions = getUniqueValues(data, "region");
    const countries = getUniqueValues(data, "country");


    populateDropdown("#regionFilter", regions);
    populateDropdown("#countryFilter", countries);
    populateDropdown("#mainPestleFilter", pestles);
  });

function getUniqueValues(data, key) {
  return [...new Set(data.map((item) => item[key]))];
}

function populateDropdown(selector, options) {
  const dropdown = document.querySelector(selector);
  options.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.textContent = option;
    dropdown.appendChild(optionElement);
  });
}


//Dark-Light Mode 
document
  .getElementById("theme-toggle")
  .addEventListener("click", function () {
    document.body.classList.toggle("light-mode");
    this.textContent = document.body.classList.contains("light-mode")
      ? "☀️"
      : "🌙";
  });



function generateFunFacts() {
  console.log("Generating fun facts...");

  if (!cofferData || cofferData.length === 0) {
    console.log("No data available for fun facts.");
    return;
  }

  let sectors = [],
    topics = [],
    countries = [],
    insights = [],
    sources = [];

  cofferData.forEach((item) => {
    if (item.sector) sectors.push(item.sector);
    if (item.topic) topics.push(item.topic);
    if (item.country) countries.push(item.country);
    if (item.insight) insights.push(item.insight);
    if (item.source) sources.push(item.source);
  });

  function getRandomItem(array) {
    return array.length > 0
      ? array[Math.floor(Math.random() * array.length)]
      : "N/A";
  }

  let randomSector = getRandomItem(sectors);
  let randomTopic = getRandomItem(topics);
  let randomCountry = getRandomItem(countries);
  let randomInsight = getRandomItem(insights);
  let randomSource = getRandomItem(sources);

  let funFacts = [
    `🏭 Sector: <b>${getRandomItem(sectors)}</b>`,
    `🔥 Topic: <b>${getRandomItem(topics)}</b>`,
    `🌍 Country: <b>${getRandomItem(countries)}</b>`,
    `📢 Insight: "<i>${getRandomItem(insights)}</i>"`,
    `📖 Source: <b>${getRandomItem(sources)}</b>`,
  ];

  console.log("Fun facts generated:", funFacts);
  document.getElementById("funFactsList").innerHTML = funFacts
    .map((fact) => `<li>${fact}</li>`)
    .join("");
}

setTimeout(() => {
  console.log("Checking if data is available...");
  console.log(cofferData);
  generateFunFacts();
}, 1000);


