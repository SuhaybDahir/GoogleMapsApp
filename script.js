let map;
let markers = [];
let directionsRenderer;
let directionsService;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 43.2557, lng: -79.8711 },
        zoom: 12,
    });

    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsService = new google.maps.DirectionsService();
    directionsRenderer.setMap(map);

    // Initial locations
    const locations = [
        { name: "Bayfront Park", lat: 43.2724, lng: -79.8772, category: "park" },
        { name: "Gage Park", lat: 43.2393, lng: -79.8300, category: "park" },
        { name: "Royal Botanical Gardens", lat: 43.2920, lng: -79.8956, category: "park" },
        { name: "Dundurn Castle", lat: 43.2569, lng: -79.8788, category: "museum" },
        { name: "CF Lime Ridge Mall", lat: 43.2259, lng: -79.8657, category: "shopping" }
    ];

    locations.forEach(addMarker);
    populateDestinations(locations);
}

// Function to add markers
function addMarker(location) {
    let marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: location.name,
    });

    let infoWindow = new google.maps.InfoWindow({
        content: `<div class="info-window">
                    <h5>${location.name}</h5>
                    <p>Category: ${location.category}</p>
                  </div>`
    });

    marker.addListener("click", () => infoWindow.open(map, marker));
    markers.push({ marker, category: location.category });
}

// Filter Markers
function filterMarkers(category) {
    markers.forEach(({ marker, category: markerCategory }) => {
        marker.setMap(category === 'all' || markerCategory === category ? map : null);
    });
}

// Add new marker
document.getElementById("addMarkerButton").addEventListener("click", () => {
    const address = document.getElementById("address").value;
    const name = document.getElementById("locationName").value;
    const category = document.getElementById("category").value;

    new google.maps.Geocoder().geocode({ address }, (results, status) => {
        if (status === "OK") {
            addMarker({
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng(),
                name, category
            });
        } else {
            alert("Geocode error: " + status);
        }
    });
});

// Populate destinations
function populateDestinations(locations) {
    const select = document.getElementById("destinations");
    locations.forEach(loc => {
        const option = new Option(loc.name, `${loc.lat},${loc.lng}`);
        select.add(option);
    });
}

// Get Directions
document.getElementById("getDirections").addEventListener("click", () => {
    const destination = document.getElementById("destinations").value.split(",");

    navigator.geolocation.getCurrentPosition(position => {
        directionsService.route({
            origin: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
            destination: new google.maps.LatLng(parseFloat(destination[0]), parseFloat(destination[1])),
            travelMode: 'DRIVING'
        }, (response, status) => {
            if (status === 'OK') {
                directionsRenderer.setDirections(response);
            }
        });
    });
});
