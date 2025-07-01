// Get constant weather data
function getWeatherData(city) {
    return {
        cityName: city.name,
        temperature: 28, // °C
        humidity: 60,    // %
        pressure: 1012,  // hPa
        windSpeed: 12,   // km/h
        description: 'Sunny',
        icon: '☀️'
    };
}

// Get constant 5-day forecast data
function getForecastData() {
    return [
        { day: 'Mon', temp: 28, desc: 'Sunny', icon: '☀️' },
        { day: 'Tue', temp: 27, desc: 'Partly Cloudy', icon: '⛅' },
        { day: 'Wed', temp: 25, desc: 'Cloudy', icon: '☁️' },
        { day: 'Thu', temp: 24, desc: 'Rainy', icon: '🌧️' },
        { day: 'Fri', temp: 26, desc: 'Sunny', icon: '☀️' }
    ];
}

function showWeatherError(message) {
    let errorDiv = document.getElementById('weatherError');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'weatherError';
        errorDiv.style.color = 'red';
        errorDiv.style.margin = '1rem 0';
        errorDiv.style.fontWeight = 'bold';
        document.querySelector('.weather-header').appendChild(errorDiv);
    }
    errorDiv.textContent = message;
}

// Fetch real-time weather data from OpenWeatherMap
async function fetchWeatherData(city) {
    const apiKey = '05f56aee89a94b9cb7fc14c893397bf2';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('Weather API URL:', url);
        console.log('Weather API Response:', data);
        if (!response.ok) throw new Error('API error');
        return {
            cityName: city.name,
            temperature: Math.round(data.main.temp),
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            windSpeed: data.wind.speed,
            description: data.weather[0].main,
            icon: data.weather[0].icon // OpenWeatherMap icon code
        };
    } catch (error) {
        showWeatherError('Unable to fetch real-time weather data.');
        return null;
    }
}

// Fetch 5-day forecast from OpenWeatherMap
async function fetchForecastData(city) {
    const apiKey = '05f56aee89a94b9cb7fc14c893397bf2';
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('Forecast API URL:', url);
        console.log('Forecast API Response:', data);
        if (!response.ok) throw new Error('API error');
        // Group by day
        const days = {};
        data.list.forEach(item => {
            const date = new Date(item.dt_txt);
            const day = date.toLocaleDateString('en-US', { weekday: 'short' });
            if (!days[day]) {
                days[day] = {
                    temp: Math.round(item.main.temp),
                    desc: item.weather[0].main,
                    icon: item.weather[0].icon
                };
            }
        });
        // Return first 5 days
        return Object.entries(days).slice(0, 5).map(([day, val]) => ({
            day,
            temp: val.temp,
            desc: val.desc,
            icon: val.icon
        }));
    } catch (error) {
        showWeatherError('Unable to fetch 5-day forecast.');
        return [];
    }
}

// Helper to get OpenWeatherMap icon URL
function getOWMIconUrl(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

// Update weather visualization with real data
async function updateWeatherVisualization(city) {
    if (!city) return;
    // Update city name
    var cityNameEl = document.getElementById('currentCity');
    if (cityNameEl) cityNameEl.textContent = city.name;

    // Update current weather
    const weatherData = await fetchWeatherData(city);
    if (weatherData) {
        var tempEl = document.getElementById('temperature');
        if (tempEl) tempEl.textContent = `${weatherData.temperature}°C`;
        var descEl = document.getElementById('weatherDescription');
        if (descEl) descEl.textContent = weatherData.description;
        var humEl = document.getElementById('humidity');
        if (humEl) humEl.textContent = `${weatherData.humidity}%`;
        var presEl = document.getElementById('pressure');
        if (presEl) presEl.textContent = `${weatherData.pressure} hPa`;
        var windEl = document.getElementById('windSpeed');
        if (windEl) windEl.textContent = `${weatherData.windSpeed} km/h`;
        var iconEl = document.querySelector('.weather-icon');
        if (iconEl) iconEl.innerHTML = `<img src="${getOWMIconUrl(weatherData.icon)}" alt="Weather Icon" style="width:48px;height:48px;">`;
    }

    // Update 5-day forecast
    const forecastData = await fetchForecastData(city);
    const container = document.getElementById('forecastContainer');
    if (container) {
        container.innerHTML = '';
        forecastData.forEach(day => {
            const card = document.createElement('div');
            card.className = 'forecast-card';
            card.innerHTML = `
                <div class="date">${day.day}</div>
                <div class="forecast-icon"><img src="${getOWMIconUrl(day.icon)}" alt="icon" style="width:32px;height:32px;"></div>
                <div class="forecast-temp">${day.temp}°C</div>
                <div class="forecast-desc">${day.desc}</div>
            `;
            container.appendChild(card);
        });
    }
}

// On page load or city change, always update
window.addEventListener('load', () => {
    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity) {
        const city = JSON.parse(savedCity);
        updateWeatherVisualization(city);
    }
});
window.addEventListener('storage', (e) => {
    if (e.key === 'selectedCity') {
        const city = JSON.parse(e.newValue);
        updateWeatherVisualization(city);
    }
}); 