// Pollution levels and their descriptions
const pollutionLevels = {
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
    unhealthy: {
        range: [101, 150],
        color: '#ff7e00',
        description: 'Members of sensitive groups may experience health effects.'
    },
    veryUnhealthy: {
        range: [151, 200],
        color: '#ff0000',
        description: 'Everyone may begin to experience health effects.'
    },
    hazardous: {
        range: [201, 300],
        color: '#99004c',
        description: 'Health warnings of emergency conditions.'
    }
};

// Get pollution data with constant values
function getPollutionData() {
    return {
        pm25: 15.5,
        pm10: 35.2,
        o3: 45.8,
        no2: 28.3,
        so2: 12.7,
        co: 0.8
            };
        }
        
// Get 7-day average pollution data
function getWeeklyPollutionData() {
    const dates = Array.from({length: 7}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }).reverse();
        return {
        dates: dates,
        pm25: [14.2, 15.8, 16.1, 15.5, 14.9, 15.2, 15.5],
        pm10: [33.5, 35.8, 36.2, 35.2, 34.8, 35.0, 35.2],
        o3: [44.5, 45.2, 46.1, 45.8, 45.5, 45.3, 45.8],
        no2: [27.5, 28.8, 29.1, 28.3, 27.9, 28.1, 28.3],
        so2: [12.1, 12.8, 13.1, 12.7, 12.4, 12.5, 12.7],
        co: [0.7, 0.8, 0.9, 0.8, 0.7, 0.8, 0.8]
        };
    }

function getPollutionLevel(value, parameter) {
    const levels = {
        pm25: [
            { max: 12, level: 'Good', color: '#00e400' },
            { max: 35.4, level: 'Moderate', color: '#ffff00' },
            { max: 55.4, level: 'Unhealthy for Sensitive Groups', color: '#ff7e00' },
            { max: 150.4, level: 'Unhealthy', color: '#ff0000' },
            { max: 250.4, level: 'Very Unhealthy', color: '#99004c' },
            { max: 500.4, level: 'Hazardous', color: '#7e0023' }
        ],
        pm10: [
            { max: 54, level: 'Good', color: '#00e400' },
            { max: 154, level: 'Moderate', color: '#ffff00' },
            { max: 254, level: 'Unhealthy for Sensitive Groups', color: '#ff7e00' },
            { max: 354, level: 'Unhealthy', color: '#ff0000' },
            { max: 424, level: 'Very Unhealthy', color: '#99004c' },
            { max: 504, level: 'Hazardous', color: '#7e0023' }
        ],
        o3: [
            { max: 54, level: 'Good', color: '#00e400' },
            { max: 70, level: 'Moderate', color: '#ffff00' },
            { max: 85, level: 'Unhealthy for Sensitive Groups', color: '#ff7e00' },
            { max: 105, level: 'Unhealthy', color: '#ff0000' },
            { max: 200, level: 'Very Unhealthy', color: '#99004c' }
        ],
        no2: [
            { max: 53, level: 'Good', color: '#00e400' },
            { max: 100, level: 'Moderate', color: '#ffff00' },
            { max: 360, level: 'Unhealthy for Sensitive Groups', color: '#ff7e00' },
            { max: 649, level: 'Unhealthy', color: '#ff0000' },
            { max: 1249, level: 'Very Unhealthy', color: '#99004c' },
            { max: 2049, level: 'Hazardous', color: '#7e0023' }
        ],
        so2: [
            { max: 35, level: 'Good', color: '#00e400' },
            { max: 75, level: 'Moderate', color: '#ffff00' },
            { max: 185, level: 'Unhealthy for Sensitive Groups', color: '#ff7e00' },
            { max: 304, level: 'Unhealthy', color: '#ff0000' },
            { max: 604, level: 'Very Unhealthy', color: '#99004c' }
        ],
        co: [
            { max: 4.4, level: 'Good', color: '#00e400' },
            { max: 9.4, level: 'Moderate', color: '#ffff00' },
            { max: 12.4, level: 'Unhealthy for Sensitive Groups', color: '#ff7e00' },
            { max: 15.4, level: 'Unhealthy', color: '#ff0000' },
            { max: 30.4, level: 'Very Unhealthy', color: '#99004c' },
            { max: 50.4, level: 'Hazardous', color: '#7e0023' }
        ]
    };
    const parameterLevels = levels[parameter];
    if (!parameterLevels) return { level: 'Unknown', color: '#999999' };
    for (const level of parameterLevels) {
        if (value <= level.max) {
            return { level: level.level, color: level.color };
        }
    }
    return { level: 'Hazardous', color: '#7e0023' };
}

// Fetch real-time pollution data from OpenWeatherMap
async function fetchPollutionData(city) {
    const apiKey = '05f56aee89a94b9cb7fc14c893397bf2';
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok || !data.list || !data.list[0]) throw new Error('API error');
        const comp = data.list[0].components;
        return {
            pm25: comp.pm2_5,
            pm10: comp.pm10,
            o3: comp.o3,
            no2: comp.no2,
            so2: comp.so2,
            co: comp.co / 1000 // Convert from µg/m³ to ppm approx for display
        };
    } catch (error) {
        showPollutionError('Unable to fetch real-time pollution data.');
        return null;
    }
}

// Fetch real-time hourly pollution data for the last 24 hours
async function fetchHourlyPollutionData(city) {
    const apiKey = '05f56aee89a94b9cb7fc14c893397bf2';
    const end = Math.floor(Date.now() / 1000);
    const start = end - 24 * 60 * 60; // 24 hours ago
    const url = `https://api.openweathermap.org/data/2.5/air_pollution/history?lat=${city.lat}&lon=${city.lon}&start=${start}&end=${end}&appid=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok || !data.list) throw new Error('API error');
        return data.list;
    } catch (error) {
        showPollutionError('Unable to fetch hourly pollution data.');
        return [];
    }
}

// Calculate daily averages for the last 7 days from hourly data
function calculateDailyAverages(hourlyList) {
    const days = {};
    hourlyList.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        if (!days[day]) days[day] = { pm25: [], pm10: [], o3: [], no2: [], so2: [], co: [] };
        days[day].pm25.push(item.components.pm2_5);
        days[day].pm10.push(item.components.pm10);
        days[day].o3.push(item.components.o3);
        days[day].no2.push(item.components.no2);
        days[day].so2.push(item.components.so2);
        days[day].co.push(item.components.co / 1000); // µg/m³ to ppm approx
    });
    // Calculate averages
    const result = { dates: [], pm25: [], pm10: [], o3: [], no2: [], so2: [], co: [] };
    Object.entries(days).forEach(([day, vals]) => {
        result.dates.push(day);
        result.pm25.push(vals.pm25.reduce((a, b) => a + b, 0) / vals.pm25.length);
        result.pm10.push(vals.pm10.reduce((a, b) => a + b, 0) / vals.pm10.length);
        result.o3.push(vals.o3.reduce((a, b) => a + b, 0) / vals.o3.length);
        result.no2.push(vals.no2.reduce((a, b) => a + b, 0) / vals.no2.length);
        result.so2.push(vals.so2.reduce((a, b) => a + b, 0) / vals.so2.length);
        result.co.push(vals.co.reduce((a, b) => a + b, 0) / vals.co.length);
    });
    return result;
}

// Update pollution visualization with real data and charts
async function updatePollutionVisualization(city) {
    if (!city) return;
    document.getElementById('currentCity').textContent = city.name;
    const pollutionData = await fetchPollutionData(city);
    if (!pollutionData) return;
    // Update pollutant levels
    const pollutants = ['pm25', 'pm10', 'o3', 'no2', 'so2', 'co'];
    pollutants.forEach(pollutant => {
        const value = pollutionData[pollutant];
        const level = getPollutionLevel(value, pollutant);
        const element = document.getElementById(pollutant);
        if (element) {
            element.innerHTML = `
                <div class="pollutant-value" style="color: ${level.color}">
                    ${value.toFixed(1)} ${pollutant === 'co' ? 'ppm' : 'µg/m³'}
                </div>
                <div class="pollutant-level" style="color: ${level.color}">
                    ${level.level}
                </div>
            `;
        }
    });
    // Fetch hourly data for charts
    const hourlyList = await fetchHourlyPollutionData(city);
    if (hourlyList.length > 0) {
        // 24-hour chart
        const hours = hourlyList.map(item => {
            const date = new Date(item.dt * 1000);
            return date.getHours() + ':00';
        });
        const pm25 = hourlyList.map(item => item.components.pm2_5);
        const pm10 = hourlyList.map(item => item.components.pm10);
        const o3 = hourlyList.map(item => item.components.o3);
        const no2 = hourlyList.map(item => item.components.no2);
        const so2 = hourlyList.map(item => item.components.so2);
        const co = hourlyList.map(item => item.components.co / 1000);
        const ctxHourly = document.getElementById('hourlyChart').getContext('2d');
        new Chart(ctxHourly, {
            type: 'line',
            data: {
                labels: hours,
                datasets: [
                    { label: 'PM2.5', data: pm25, borderColor: '#00e400', tension: 0.4 },
                    { label: 'PM10', data: pm10, borderColor: '#ffff00', tension: 0.4 },
                    { label: 'O3', data: o3, borderColor: '#ff7e00', tension: 0.4 },
                    { label: 'NO2', data: no2, borderColor: '#ff0000', tension: 0.4 },
                    { label: 'SO2', data: so2, borderColor: '#99004c', tension: 0.4 },
                    { label: 'CO', data: co, borderColor: '#7e0023', tension: 0.4 }
                ]
            },
            options: {
                responsive: true,
                plugins: { title: { display: true, text: '24-Hour Pollution Trends' }, legend: { position: 'top' } },
                scales: { y: { beginAtZero: true, title: { display: true, text: 'Concentration' } } }
            }
        });
        // 7-day chart (from hourly data)
        const weeklyData = calculateDailyAverages(hourlyList);
        const ctxWeekly = document.getElementById('weeklyChart').getContext('2d');
        new Chart(ctxWeekly, {
            type: 'line',
            data: {
                labels: weeklyData.dates,
                datasets: [
                    { label: 'PM2.5', data: weeklyData.pm25, borderColor: '#00e400', tension: 0.4 },
                    { label: 'PM10', data: weeklyData.pm10, borderColor: '#ffff00', tension: 0.4 },
                    { label: 'O3', data: weeklyData.o3, borderColor: '#ff7e00', tension: 0.4 },
                    { label: 'NO2', data: weeklyData.no2, borderColor: '#ff0000', tension: 0.4 },
                    { label: 'SO2', data: weeklyData.so2, borderColor: '#99004c', tension: 0.4 },
                    { label: 'CO', data: weeklyData.co, borderColor: '#7e0023', tension: 0.4 }
                ]
            },
            options: {
                responsive: true,
                plugins: { title: { display: true, text: '7-Day Pollution Trends' }, legend: { position: 'top' } },
                scales: { y: { beginAtZero: true, title: { display: true, text: 'Concentration' } } }
            }
        });
    }
}

window.addEventListener('load', () => {
    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity) {
        const city = JSON.parse(savedCity);
        updatePollutionVisualization(city);
    }
});
window.addEventListener('storage', (e) => {
    if (e.key === 'selectedCity') {
        const city = JSON.parse(e.newValue);
        updatePollutionVisualization(city);
    }
});

function showPollutionError(message) {
    let errorDiv = document.getElementById('pollutionError');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'pollutionError';
        errorDiv.style.color = 'red';
        errorDiv.style.margin = '1rem 0';
        errorDiv.style.fontWeight = 'bold';
        document.querySelector('.pollution-header').appendChild(errorDiv);
    }
    errorDiv.textContent = message;
} 