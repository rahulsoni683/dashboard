// Initialize air quality map
let aqiMap = L.map('aqiMap').setView([0, 0], 2);
setTimeout(function() {
    aqiMap.invalidateSize();
}, 400);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(aqiMap);

// AQI categories and their descriptions
const aqiCategories = {
    good: {
        range: [0, 50],
        color: '#00e400',
        description: 'Air quality is satisfactory, and air pollution poses little or no risk.'
    },
    moderate: {
        range: [51, 100],
        color: '#ffff00',
        description: 'Air quality is acceptable. However, there may be a risk for some people.'
    },
    unhealthySensitive: {
        range: [101, 150],
        color: '#ff7e00',
        description: 'Members of sensitive groups may experience health effects.'
    },
    unhealthy: {
        range: [151, 200],
        color: '#ff0000',
        description: 'Everyone may begin to experience health effects.'
    },
    veryUnhealthy: {
        range: [201, 300],
        color: '#99004c',
        description: 'Health warnings of emergency conditions.'
    },
    hazardous: {
        range: [301, 500],
        color: '#7e0023',
        description: 'Health alert: everyone may experience more serious health effects.'
    }
};

// Get air quality data with constant values
function getAirQualityData(lat, lon) {
    // Return constant air quality values
    return {
        aqi: 75,  // Moderate AQI
        o3: 45.8, // Good
        co: 0.8,  // Good
        no2: 28.3, // Good
        so2: 12.7  // Good
        };
}

// Calculate AQI based on pollutant concentrations
function calculateAQI(pollutants) {
    const aqiBreakpoints = {
        o3: [
            { min: 0, max: 54, aqiMin: 0, aqiMax: 50 },
            { min: 55, max: 70, aqiMin: 51, aqiMax: 100 },
            { min: 71, max: 85, aqiMin: 101, aqiMax: 150 },
            { min: 86, max: 105, aqiMin: 151, aqiMax: 200 },
            { min: 106, max: 200, aqiMin: 201, aqiMax: 300 }
        ],
        no2: [
            { min: 0, max: 53, aqiMin: 0, aqiMax: 50 },
            { min: 54, max: 100, aqiMin: 51, aqiMax: 100 },
            { min: 101, max: 360, aqiMin: 101, aqiMax: 150 },
            { min: 361, max: 649, aqiMin: 151, aqiMax: 200 },
            { min: 650, max: 1249, aqiMin: 201, aqiMax: 300 }
        ],
        so2: [
            { min: 0, max: 35, aqiMin: 0, aqiMax: 50 },
            { min: 36, max: 75, aqiMin: 51, aqiMax: 100 },
            { min: 76, max: 185, aqiMin: 101, aqiMax: 150 },
            { min: 186, max: 304, aqiMin: 151, aqiMax: 200 },
            { min: 305, max: 604, aqiMin: 201, aqiMax: 300 }
        ],
        co: [
            { min: 0, max: 4.4, aqiMin: 0, aqiMax: 50 },
            { min: 4.5, max: 9.4, aqiMin: 51, aqiMax: 100 },
            { min: 9.5, max: 12.4, aqiMin: 101, aqiMax: 150 },
            { min: 12.5, max: 15.4, aqiMin: 151, aqiMax: 200 },
            { min: 15.5, max: 30.4, aqiMin: 201, aqiMax: 300 }
        ]
    };

    let maxAQI = 0;

    for (const [pollutant, value] of Object.entries(pollutants)) {
        if (aqiBreakpoints[pollutant]) {
            const breakpoint = aqiBreakpoints[pollutant].find(bp => 
                value >= bp.min && value <= bp.max
            );
            
            if (breakpoint) {
                const aqi = Math.round(
                    ((value - breakpoint.min) / (breakpoint.max - breakpoint.min)) * 
                    (breakpoint.aqiMax - breakpoint.aqiMin) + 
                    breakpoint.aqiMin
                );
                maxAQI = Math.max(maxAQI, aqi);
            }
        }
    }

    return maxAQI;
}

// Get AQI category
function getAQICategory(aqi) {
    for (const [category, data] of Object.entries(aqiCategories)) {
        if (aqi >= data.range[0] && aqi <= data.range[1]) {
            return {
                name: category,
                color: data.color,
                description: data.description
            };
        }
    }
    return aqiCategories.hazardous;
}

// Get hourly AQI data
function getHourlyAQIData() {
    // Generate hours for the last 24 hours
    const hours = Array.from({length: 24}, (_, i) => {
        const hour = new Date();
        hour.setHours(hour.getHours() - (23 - i));
        return hour.getHours() + ':00';
    });

    // Constant values for AQI with slight variations
    return {
        hours: hours,
        aqi: [65, 68, 70, 72, 75, 78, 80, 82, 85, 83, 80, 78, 75, 73, 70, 68, 65, 63, 60, 62, 65, 68, 70, 72]
    };
}

// Get monthly average AQI data
function getMonthlyAQIData() {
    // Generate months for the last 12 months
    const months = Array.from({length: 12}, (_, i) => {
        const month = new Date();
        month.setMonth(month.getMonth() - (11 - i));
        return month.toLocaleDateString('en-US', { month: 'short' });
    });

    // Constant values for monthly AQI with seasonal variations
    return {
        months: months,
        aqi: [75, 78, 82, 85, 88, 90, 92, 90, 85, 80, 75, 72]
    };
}

// Fetch real-time air quality data from OpenWeatherMap
async function fetchCurrentAQIData(city) {
    const apiKey = '05f56aee89a94b9cb7fc14c893397bf2';
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok || !data.list || !data.list[0]) throw new Error('API error');
        const comp = data.list[0].components;
        return {
            aqi: data.list[0].main.aqi * 50, // OWM AQI: 1-5, scale to 0-250 for color/category
            o3: comp.o3,
            co: comp.co / 1000, // µg/m³ to ppm approx
            no2: comp.no2,
            so2: comp.so2
        };
    } catch (error) {
        showAQIError('Unable to fetch real-time air quality data.');
        return null;
    }
}

// Fetch hourly AQI data for the last 5 days (for trend and daily averages)
async function fetchHourlyAQIData(city) {
    const apiKey = '05f56aee89a94b9cb7fc14c893397bf2';
    const end = Math.floor(Date.now() / 1000);
    const start = end - 5 * 24 * 60 * 60; // 5 days ago
    const url = `https://api.openweathermap.org/data/2.5/air_pollution/history?lat=${city.lat}&lon=${city.lon}&start=${start}&end=${end}&appid=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok || !data.list) throw new Error('API error');
        return data.list;
    } catch (error) {
        showAQIError('Unable to fetch hourly AQI data.');
        return [];
    }
}

// Calculate daily AQI averages from hourly data
function calculateDailyAQIAverages(hourlyList) {
    const days = {};
    hourlyList.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!days[day]) days[day] = [];
        days[day].push(item.main.aqi * 50); // OWM AQI: 1-5, scale to 0-250
    });
    const result = { days: [], aqi: [] };
    Object.entries(days).forEach(([day, vals]) => {
        result.days.push(day);
        result.aqi.push(Math.round(vals.reduce((a, b) => a + b, 0) / vals.length));
    });
    return result;
}

// Update air quality visualization with real data
async function updateAirQualityVisualization(city) {
    if (!city) return;
    document.getElementById('currentCity').textContent = city.name;
    aqiMap.setView([city.lat, city.lon], 12);
    // Current AQI and pollutants
    const aqiData = await fetchCurrentAQIData(city);
    if (!aqiData) return;
    // Get AQI category
    const category = getAQICategory(aqiData.aqi);
    // Update AQI value and status
    document.getElementById('aqiValue').textContent = aqiData.aqi;
    document.getElementById('aqiStatus').textContent = category.name.replace(/([A-Z])/g, ' $1').trim();
    document.getElementById('aqiStatus').className = `aqi-status status-${category.name}`;
    document.getElementById('aqiDescription').textContent = category.description;
    // Update pollutant details
    document.getElementById('o3').textContent = `${aqiData.o3.toFixed(1)} ppb`;
    document.getElementById('co').textContent = `${aqiData.co.toFixed(1)} ppm`;
    document.getElementById('no2').textContent = `${aqiData.no2.toFixed(1)} ppb`;
    document.getElementById('so2').textContent = `${aqiData.so2.toFixed(1)} ppb`;
    // Fetch hourly AQI data for charts
    const hourlyList = await fetchHourlyAQIData(city);
    if (hourlyList.length > 0) {
        // Hourly AQI trend (last 24 hours)
        const last24 = hourlyList.slice(-24);
        const hours = last24.map(item => {
            const date = new Date(item.dt * 1000);
            return date.getHours() + ':00';
        });
        const aqiVals = last24.map(item => item.main.aqi * 50);
        const hourlyCtx = document.getElementById('hourlyChart').getContext('2d');
        new Chart(hourlyCtx, {
            type: 'line',
            data: {
                labels: hours,
                datasets: [{
                    label: 'AQI',
                    data: aqiVals,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: { title: { display: true, text: 'Hourly AQI Trend' }, legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: 'AQI Value' } } }
            }
        });
        // 7-day (or 5-day) daily average AQI
        const daily = calculateDailyAQIAverages(hourlyList);
        const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
        new Chart(monthlyCtx, {
            type: 'bar',
            data: {
                labels: daily.days,
                datasets: [{
                    label: 'AQI',
                    data: daily.aqi,
                    backgroundColor: '#4CAF50'
                }]
            },
            options: {
                responsive: true,
                plugins: { title: { display: true, text: 'Daily Average AQI' }, legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: 'AQI Value' } } }
            }
        });
    }
}

// Check for selected city on page load
window.addEventListener('load', () => {
    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity) {
        const city = JSON.parse(savedCity);
        updateAirQualityVisualization(city);
    }
});

// Listen for city selection changes
window.addEventListener('storage', (e) => {
    if (e.key === 'selectedCity') {
        const city = JSON.parse(e.newValue);
        updateAirQualityVisualization(city);
    }
}); 

window.addEventListener('load', function() {
    setTimeout(function() {
        aqiMap.invalidateSize();
    }, 200);
});
window.addEventListener('resize', function() {
    aqiMap.invalidateSize();
});

function showAQIError(message) {
    let errorDiv = document.getElementById('aqiError');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'aqiError';
        errorDiv.style.color = 'red';
        errorDiv.style.margin = '1rem 0';
        errorDiv.style.fontWeight = 'bold';
        document.querySelector('.air-quality-header').appendChild(errorDiv);
    }
    errorDiv.textContent = message;
} 