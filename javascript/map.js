// I tried to have the haversine formula in a separate file to keep modular, but the map would just break
// if I moved it out. same with putting the styles in the styles.css file, and I just could not figure out
// what was going wrong for the life of me, so unfortunately, I have kept it as shown below.

// grab the api key from config
fetch('./config.json')
  .then((response) => response.json())
  .then((config) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.GOOGLE_MAPS_API_KEY}&callback=initMap&v=weekly`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  })
  .catch((error) => console.error('Error loading API key:', error));


let map, infoWindow;

const kpuLibraryLocation = { lat: 49.132, lng: -122.871 };

function initMap() {

  // Initialize the map, centered at KPU Surrey Library
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: kpuLibraryLocation,
  });

  // The marker, positioned at KPU Surrey Library
  const libraryMarker = new google.maps.Marker({
    position: kpuLibraryLocation,
    map: map,
    title: "KPU Surrey Library",
  });

  //info window
  infoWindow = new google.maps.InfoWindow();

  // button to find user's location
  const locationButton = document.createElement("button");
  locationButton.textContent = "Start!";
  locationButton.classList.add("location-button");
  locationButton.style.width = "100px";
  locationButton.style.height = "35px";
  locationButton.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
  locationButton.style.backgroundColor = "#ffff";
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);

  locationButton.addEventListener("click", () => {

    // Try geolocation and update map or give error
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          const userMarker = new google.maps.Marker({
            position: userLocation,
            map: map,
            title: "Your Location",
          });
          
          infoWindow.setPosition(userLocation);
          infoWindow.open(map);
          map.setCenter(userLocation);

          // Calculate the distance
          const distance = haversineDistance(userLocation, kpuLibraryLocation);
          
          //add line and update infowindow
          infoWindow.setContent(`Distance to KPU Surrey Library: ${distance.toFixed(2)} km`);
          const line = new google.maps.Polyline ({
            path: [userLocation, kpuLibraryLocation],
            geodesic: true,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 3,
          });

          line.setMap(map);

        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {

      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  });
}

// Error handler
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

// calculate distance between two points
function haversineDistance(coords1, coords2) {
  function toRad(x) {
    return (x * Math.PI) / 180;
  }

  const R = 6371;
  const dLat = toRad(coords2.lat - coords1.lat);
  const dLng = toRad(coords2.lng - coords1.lng);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

window.initMap = initMap;
