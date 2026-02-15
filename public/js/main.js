const hotelsGrid = document.getElementById('hotels-grid');
const activitiesGrid = document.getElementById('activities-grid');
const carsGrid = document.getElementById('cars-grid');
const galleryGrid = document.getElementById('gallery-grid');
const bookingForm = document.getElementById('booking-form');
const carBookingForm = document.getElementById('car-booking-form');
const bookingStatus = document.getElementById('booking-status');
const carBookingStatus = document.getElementById('car-booking-status');

document.getElementById('year').textContent = new Date().getFullYear();

const currency = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

const cardTemplate = (item, type) => {
  if (type === 'gallery') {
    return `
      <article class="card gallery-card">
        <img src="${item.image_url}" alt="${item.title}" loading="lazy" />
        <div class="card-content">
          <h4>${item.title}</h4>
          <p>${item.story}</p>
          <div class="meta">
            <span>${item.guest_name}</span>
            <span>${'★'.repeat(item.rating)}</span>
          </div>
        </div>
      </article>
    `;
  }

  const pricing =
    type === 'hotel'
      ? `${currency(item.price_per_night)} / night`
      : type === 'activity'
      ? `${currency(item.price)} per person`
      : `${currency(item.price_per_day)} / day`;

  const subInfo =
    type === 'hotel'
      ? item.location
      : type === 'activity'
      ? `${item.category} • ${item.duration}`
      : `${item.car_type} • ${item.seats} seats`;

  const title = type === 'hotel' ? item.name : item.title || item.name;

  return `
    <article class="card">
      <img src="${item.image_url}" alt="${title}" loading="lazy" />
      <div class="card-content">
        <h4>${title}</h4>
        <p>${item.description}</p>
        <div class="meta">
          <span>${subInfo}</span>
          <span>${pricing}</span>
        </div>
      </div>
    </article>
  `;
};

const loadData = async () => {
  const [hotelsRes, activitiesRes, carsRes, galleryRes] = await Promise.all([
    fetch('/api/hotels'),
    fetch('/api/activities'),
    fetch('/api/cars'),
    fetch('/api/gallery')
  ]);
  const [hotels, activities, cars, gallery] = await Promise.all([
    hotelsRes.json(),
    activitiesRes.json(),
    carsRes.json(),
    galleryRes.json()
  ]);

  hotelsGrid.innerHTML = hotels.map((hotel) => cardTemplate(hotel, 'hotel')).join('');
  activitiesGrid.innerHTML = activities.map((activity) => cardTemplate(activity, 'activity')).join('');
  carsGrid.innerHTML = cars.map((car) => cardTemplate(car, 'car')).join('');
  galleryGrid.innerHTML = gallery.map((entry) => cardTemplate(entry, 'gallery')).join('');
};

const submitAndOpenWhatsapp = async (form, endpoint, statusElement, messageText) => {
  statusElement.textContent = 'Processing your booking inquiry...';
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    statusElement.textContent = 'Could not submit inquiry. Please try again.';
    statusElement.style.color = '#ff7f90';
    return;
  }

  statusElement.textContent = 'Inquiry saved! Redirecting to WhatsApp concierge...';
  statusElement.style.color = '#7df9ff';

  const message = encodeURIComponent(messageText(payload));
  const whatsappNumber = '919876543210';
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`;

  setTimeout(() => {
    window.open(whatsappLink, '_blank', 'noopener,noreferrer');
    form.reset();
    statusElement.textContent = 'Inquiry submitted and WhatsApp launched successfully!';
  }, 500);
};

bookingForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await submitAndOpenWhatsapp(bookingForm, '/api/bookings', bookingStatus, (payload) =>
    `Hi Andaman&Co., this is ${payload.guest_name}. I need a tour inquiry for ${payload.guests} guest(s) for ${payload.duration_days} day(s). Package: ${payload.package_name}. Check-in: ${payload.check_in_date}.`
  );
});

carBookingForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await submitAndOpenWhatsapp(carBookingForm, '/api/car-bookings', carBookingStatus, (payload) =>
    `Hi Andaman&Co., this is ${payload.guest_name}. I need a car booking inquiry for ${payload.car_name}, ${payload.travelers} traveler(s), ${payload.duration_days} day(s), pickup on ${payload.pickup_date}.`
  );
});

loadData().catch(() => {
  hotelsGrid.innerHTML = '<p>Failed to load hotels.</p>';
  activitiesGrid.innerHTML = '<p>Failed to load activities.</p>';
  carsGrid.innerHTML = '<p>Failed to load cars.</p>';
  galleryGrid.innerHTML = '<p>Failed to load gallery.</p>';
});
