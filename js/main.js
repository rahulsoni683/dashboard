// Initialize map
let map = L.map('map').setView([0, 0], 2);
let marker = null;

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// City search functionality
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');

// Function to search for a city
async function searchCity(cityName) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`);
        const data = await response.json();
        
        if (data.length > 0) {
            const { lat, lon, display_name } = data[0];
            
            // Update map view
            map.setView([lat, lon], 12);
            
            // Remove existing marker if any
            if (marker) {
                map.removeLayer(marker);
            }
            
            // Add new marker
            marker = L.marker([lat, lon]).addTo(map)
                .bindPopup(display_name)
                .openPopup();
            
            // Store selected city in localStorage
            localStorage.setItem('selectedCity', JSON.stringify({
                name: display_name,
                lat: lat,
                lon: lon
            }));
            
            return { lat, lon, name: display_name };
        } else {
            alert('City not found. Please try another city name.');
        }
    } catch (error) {
        console.error('Error searching for city:', error);
        alert('Error searching for city. Please try again.');
    }
}

// Event listeners
searchBtn.addEventListener('click', () => {
    const cityName = cityInput.value.trim();
    if (cityName) {
        searchCity(cityName).then(city => {
            if (city) {
                window.location.href = 'traffic.html';
            }
        });
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const cityName = cityInput.value.trim();
        if (cityName) {
            searchCity(cityName).then(city => {
                if (city) {
                    window.location.href = 'traffic.html';
                }
            });
        }
    }
});

// Check for previously selected city
window.addEventListener('load', () => {
    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity) {
        const city = JSON.parse(savedCity);
        map.setView([city.lat, city.lon], 12);
        marker = L.marker([city.lat, city.lon]).addTo(map)
            .bindPopup(city.name)
            .openPopup();
        cityInput.value = city.name;
    }
}); 