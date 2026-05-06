const map = L.map('map', {
  scrollWheelZoom: false
}).setView([46.03, -114.07], 9);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Icon definitions
const icons = {
  "Forest & Fire Resilience": L.icon({ iconUrl: "assets/icons/forest.png", iconSize: [30, 30] }),
  "Water & Watersheds": L.icon({ iconUrl: "assets/icons/water.png", iconSize: [30, 30] }),
  "Housing & Community Stability": L.icon({ iconUrl: "assets/icons/housing.png", iconSize: [30, 30] }),
  "Youth & Education": L.icon({ iconUrl: "assets/icons/youth.png", iconSize: [30, 30] }),
  "Capacity & Collaboration": L.icon({ iconUrl: "assets/icons/capacity.png", iconSize: [30, 30] })
};

const clusterGroup = L.markerClusterGroup();
map.addLayer(clusterGroup);

let allFeatures = [];

// Load data
fetch('data/projects.geojson')
  .then(res => res.json())
  .then(data => {
    allFeatures = data.features;
    renderMarkers();
  });

function renderMarkers() {
  clusterGroup.clearLayers();

  const activeCategories = Array.from(
    document.querySelectorAll('#controls input:checked')
  ).map(i => i.value);

  allFeatures.forEach(feature => {
    if (!activeCategories.includes(feature.properties.category)) return;

    const marker = L.marker(
      [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
      { icon: icons[feature.properties.category] }
    );

    marker.on('click', () => showStory(feature.properties));
    clusterGroup.addLayer(marker);
  });
}

// Filter listeners
document
  .querySelectorAll('#controls input')
  .forEach(cb => cb.addEventListener('change', renderMarkers));

function showStory(props) {
  const panel = document.getElementById('story-panel');
  const content = document.getElementById('story-content');

  content.innerHTML = `
    <h2>${props.title}</h2>
    <p><strong>Category:</strong> ${props.category}</p>
    <p>${props.description}</p>
    <div class="metric">Acres Treated: ${props.acres}</div>
    <div class="metric">People Served: ${props.people_served}</div>
    <div class="metric">Dollars Leveraged: $${props.dollars.toLocaleString()}</div>
    ${props.quote ? `<blockquote>"${props.quote}"</blockquote>` : ''}
  `;

  panel.classList.remove('hidden');
}

document.getElementById('close-panel')
  .addEventListener('click', () =>
    document.getElementById('story-panel').classList.add('hidden')
  );
