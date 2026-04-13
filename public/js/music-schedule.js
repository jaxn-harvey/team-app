// ==================== MUSIC SCHEDULE DATA ====================
const musicSchedule = [
  {
    day: "Thursday",
    date: "April 17",
    events: [
      {
        time: "7:00 PM - 10:00 PM",
        venue: "Swampers",
        artist: "Muscle Shoals Soul Collective",
        genre: "Soul/Blues",
        image: "https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=300&h=200&fit=crop"
      },
      {
        time: "8:00 PM - 11:00 PM",
        venue: "Rattlesnake Saloon",
        artist: "Tennessee River Band",
        genre: "Southern Rock",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=200&fit=crop"
      },
      {
        time: "9:00 PM - Midnight",
        venue: "FloBama",
        artist: "FAME Tribute - Spirit of the Sessions",
        genre: "Soul/Rock",
        image: "https://images.unsplash.com/photo-1516618143899-92e8daf85ff8?w=300&h=200&fit=crop"
      }
    ]
  },
  {
    day: "Friday",
    date: "April 18",
    events: [
      {
        time: "6:00 PM - 9:00 PM",
        venue: "Lava Room",
        artist: "Aretha's Legacy - Jazz & Soul",
        genre: "Soul/Jazz",
        image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=300&h=200&fit=crop"
      },
      {
        time: "7:30 PM - 10:30 PM",
        venue: "Swampers",
        artist: "Muscle Shoals Legends Night",
        genre: "Soul/Blues",
        image: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300&h=200&fit=crop"
      },
      {
        time: "8:00 PM - Late",
        venue: "FloBama",
        artist: "Wilson's Groove - Modern Soul",
        genre: "Soul/Funk",
        image: "https://images.unsplash.com/photo-1519812141007-0c46e93b9854?w=300&h=200&fit=crop"
      },
      {
        time: "9:00 PM - Midnight",
        venue: "Rising Crust",
        artist: "Local Legends Showcase",
        genre: "Mixed Genres",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=200&fit=crop"
      }
    ]
  },
  {
    day: "Saturday",
    date: "April 19",
    events: [
      {
        time: "7:00 PM - 10:00 PM",
        venue: "Swampers",
        artist: "Tennessee River Sessions",
        genre: "Americana",
        image: "https://images.unsplash.com/photo-1516618143899-92e8daf85ff8?w=300&h=200&fit=crop"
      },
      {
        time: "8:00 PM - Midnight",
        venue: "Rattlesnake Saloon",
        artist: "Shoals Country Stories",
        genre: "Country",
        image: "https://images.unsplash.com/photo-1513002749550-c892ee7e4b91?w=300&h=200&fit=crop"
      },
      {
        time: "8:30 PM - 11:30 PM",
        venue: "Lava Room",
        artist: "Jazz on the River",
        genre: "Jazz",
        image: "https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=300&h=200&fit=crop"
      },
      {
        time: "9:00 PM - Late",
        venue: "FloBama",
        artist: "The Session Musicians",
        genre: "Soul/Rock",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=200&fit=crop"
      }
    ]
  },
  {
    day: "Sunday",
    date: "April 20",
    events: [
      {
        time: "6:00 PM - 9:00 PM",
        venue: "Swampers",
        artist: "Soul Sunset Sessions",
        genre: "Soul/Blues",
        image: "https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=300&h=200&fit=crop"
      },
      {
        time: "7:00 PM - 10:00 PM",
        venue: "Rattlesnake Saloon",
        artist: "Muscle Shoals Songwriters Circle",
        genre: "Americana/Folk",
        image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=300&h=200&fit=crop"
      }
    ]
  }
];

// ==================== DISPLAY MUSIC SCHEDULE ====================
function displayMusicSchedule() {
  const weekContainer = document.getElementById('scheduleWeek');
  if (!weekContainer) return;

  weekContainer.innerHTML = musicSchedule.map(daySchedule => `
    <div class="schedule-day">
      <div class="day-header">
        <h3>${daySchedule.day}</h3>
        <p class="day-date">${daySchedule.date}</p>
      </div>
      <div class="events-list">
        ${daySchedule.events.map(event => `
          <div class="event-card">
            <img src="${event.image}" alt="${event.artist}" class="event-image">
            <div class="event-info">
              <div class="event-header">
                <h4>${event.artist}</h4>
                <span class="genre-badge">${event.genre}</span>
              </div>
              <div class="event-details">
                <p><strong>Venue:</strong> ${event.venue}</p>
                <p><strong>Time:</strong> ${event.time}</p>
              </div>
              <button class="btn-get-tickets" onclick="alert('Get tickets for ${event.artist} at ${event.venue}!\\nContact the venue for details.')">
                Get Tickets
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// ==================== DISPLAY MUSIC VENUES ====================
function displayMusicVenues() {
  const venuesGrid = document.getElementById('musicVenuesGrid');
  if (!venuesGrid) return;

  // Get venues that have live music
  const musicVenues = restaurants.filter(r => r.liveMusic);

  venuesGrid.innerHTML = musicVenues.map(venue => `
    <div class="music-venue-card">
      <img src="${venue.image}" alt="${venue.name}" class="venue-image">
      <div class="venue-card-content">
        <h4>${venue.name}</h4>
        <p class="venue-type">${venue.cuisine}</p>
        <p class="venue-music-schedule">
          <i class="fas fa-music"></i> ${venue.musicSchedule}
        </p>
        <p class="venue-address">📍 ${venue.address}</p>
        <div class="venue-contact">
          <a href="tel:${venue.phone}" class="btn-call">Call</a>
          <a href="restaurants.html" class="btn-info">More Info</a>
        </div>
      </div>
    </div>
  `).join('');
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  setupHamburgerMenu();
  displayMusicSchedule();
  displayMusicVenues();
});
