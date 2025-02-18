let map, directionsService, directionsRenderer;
let markers = [];

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 43.2557, lng: -79.8711 },
        zoom: 12,
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    const locations = [
        { name: "Bayfront Park", lat: 43.2724, lng: -79.8772, category: "park" },
        { name: "Gage Park", lat: 43.2393, lng: -79.8300, category: "park" },
        { name: "Royal Botanical Gardens", lat: 43.2920, lng: -79.8956, category: "park" },
        { name: "Art Gallery of Hamilton", lat: 43.2565, lng: -79.8693, category: "museum" },
        { name: "Canadian Warplane Heritage Museum", lat: 43.1699, lng: -79.9141, category: "museum" },
        { name: "Dundurn Castle", lat: 43.2569, lng: -79.8788, category: "museum" },
        { name: "CF Lime Ridge Mall", lat: 43.2259, lng: -79.8657, category: "shopping" },
        { name: "Hamilton Farmers' Market", lat: 43.2563, lng: -79.8678, category: "shopping" },
        { name: "Jackson Square", lat: 43.2561, lng: -79.8690, category: "shopping" },
        { name: "Albion Falls", lat: 43.2066, lng: -79.8097, category: "landmark" },
        { name: "Devil's Punchbowl", lat: 43.2069, lng: -79.7614, category: "landmark" },
        { name: "HMCS Haida", lat: 43.2686, lng: -79.7919, category: "museum" }
    ];

    locations.forEach(location => {
        addMarker(location);
        addDestinationOption(location);
    });
}

// ✅ Add Marker via User Input
document.getElementById("addMarkerButton").addEventListener("click", () => {
    let name = document.getElementById("locationName").value.trim();
    let address = document.getElementById("address").value.trim();
    let category = document.getElementById("category").value.trim();

    if (!name || !address || !category) {
        alert("Please fill in all fields.");
        return;
    }

    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
        if (status === "OK") {
            let location = results[0].geometry.location;
            let newLocation = {
                lat: location.lat(),
                lng: location.lng(),
                name: name,
                category: category
            };

            addMarker(newLocation);
            addDestinationOption(newLocation);
            map.setCenter(location);

            document.getElementById("locationName").value = "";
            document.getElementById("address").value = "";
            document.getElementById("category").value = "";
        } else {
            alert("Could not find location: " + status);
        }
    });
});

// ✅ Filtering Functionality
function filterMarkers(category) {
    markers.forEach(markerObj => {
        if (category === "all" || markerObj.category === category) {
            markerObj.marker.setMap(map);
        } else {
            markerObj.marker.setMap(null);
        }
    });
}

// ✅ Add Marker to Map with InfoWindow & Directions
function addMarker(location) {
    let marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: location.name
    });

    let infoWindow = new google.maps.InfoWindow({
        content: `
            <h5>${location.name}</h5>
            <p>Category: ${location.category}</p>
            <button class="btn btn-sm btn-primary" onclick="setDestination(${location.lat}, ${location.lng})">
                Get Directions
            </button>
        `
    });

    marker.addListener("click", () => {
        infoWindow.open(map, marker);
    });

    markers.push({ marker, category: location.category });
}

// ✅ Set Destination When Clicking Marker
function setDestination(lat, lng) {
    document.getElementById("destination").value = `${lat},${lng}`;
    getDirections();
}

// ✅ Get Directions Function
document.getElementById("getDirections").addEventListener("click", () => {
    getDirections();
});

function getDirections() {
    let destinationValue = document.getElementById("destination").value;
    
    if (!destinationValue) {
        alert("Please select a destination.");
        return;
    }

    navigator.geolocation.getCurrentPosition(position => {
        let origin = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        let [destLat, destLng] = destinationValue.split(",");
        let destination = new google.maps.LatLng(parseFloat(destLat), parseFloat(destLng));

        let request = {
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING
        };

        directionsService.route(request, (result, status) => {
            if (status === "OK") {
                directionsRenderer.setDirections(result);
            } else {
                alert("Could not get directions: " + status);
            }
        });
    });
}

// ✅ Populate Destination Dropdown with New Locations
function addDestinationOption(location) {
    let select = document.getElementById("destination");
    let option = new Option(location.name, `${location.lat},${location.lng}`);
    select.add(option);
}

// ✅ Find My Location Button Works
document.getElementById("geoButton").addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            let userMarker = new google.maps.Marker({
                position: { lat: position.coords.latitude, lng: position.coords.longitude },
                map: map,
                title: "Your Location",
                icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            });

            map.setCenter(userMarker.getPosition());
        });
    } else {
        alert("Geolocation not supported");
    }
});
