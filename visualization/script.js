let topicIntensityChart;
let allTopics = new Set();
let filteredData = [];  // Store dataset after fetching

// Fetch JSON data
fetch("http://127.0.0.1:8000/api/cofferData/")
    .then(response => response.json())
    .then(data => {
        filteredData = data;
        extractTopics();
    })
    .catch(error => console.error("Error loading data:", error));

function extractTopics() {
    const topicSelect = document.getElementById("topicSelect");

    filteredData.forEach(entry => {
        if (entry.topic) allTopics.add(entry.topic);
    });

    // Populate Dropdown
    allTopics.forEach(topic => {
        let option = document.createElement("option");
        option.value = topic;
        option.textContent = topic;
        topicSelect.appendChild(option);
    });

    // Auto-select first topic & load chart
    if (topicSelect.options.length > 0) {
        topicSelect.selectedIndex = 0;
        updateChart();
    }
}

function updateChart() {
    const selectedTopic = document.getElementById("topicSelect").value;
    const topicYearData = {};

    filteredData.forEach(entry => {
        if (entry.topic === selectedTopic && entry.intensity && entry.start_year) {
            const year = entry.start_year;
            topicYearData[year] = (topicYearData[year] || 0) + entry.intensity;
        }
    });

    // Convert data to sorted arrays
    const years = Object.keys(topicYearData).map(Number).sort((a, b) => a - b);
    const intensities = years.map(year => topicYearData[year]);

    if (!topicIntensityChart) {
        initializeChart(years, intensities);
    } else {
        topicIntensityChart.data.labels = years;
        topicIntensityChart.data.datasets[0].data = intensities;
        topicIntensityChart.update();
    }
}

function initializeChart(years, intensities) {
    const ctx = document.getElementById("topicIntensityChart").getContext("2d");
    topicIntensityChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: years,
            datasets: [{
                label: "Intensity Over Years",
                data: intensities,
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderWidth: 2,
                pointRadius: 5,
                pointBackgroundColor: "rgba(75, 192, 192, 1)",
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true },
                tooltip: {
                    callbacks: {
                        label: tooltipItem => `Year: ${tooltipItem.label}, Intensity: ${tooltipItem.raw}`
                    }
                }
            },
            scales: {
                x: { title: { display: true, text: "Year" } },
                y: { title: { display: true, text: "Intensity" } }
            }
        }
    });
}
