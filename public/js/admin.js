const getAdminHeaders = () => {
  const key = document.getElementById('admin-key').value.trim();
  return {
    'Content-Type': 'application/json',
    'x-admin-key': key
  };
};

const serialize = (form) => Object.fromEntries(new FormData(form).entries());

const submitAdminForm = async (formId, endpoint) => {
  const form = document.getElementById(formId);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = serialize(form);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      alert('Failed to save item. Check admin key and fields.');
      return;
    }

    alert('Saved successfully.');
    form.reset();
  });
};

submitAdminForm('hotel-form', '/api/admin/hotels');
submitAdminForm('activity-form', '/api/admin/activities');
submitAdminForm('car-form', '/api/admin/cars');
submitAdminForm('gallery-form', '/api/admin/gallery');

const renderRows = (target, rows, mapper) => {
  if (!rows.length) {
    target.innerHTML = 'No records yet.';
    return;
  }
  target.innerHTML = rows.map(mapper).join('');
};

document.getElementById('load-bookings').addEventListener('click', async () => {
  const list = document.getElementById('bookings-list');
  list.innerHTML = 'Loading...';

  const response = await fetch('/api/admin/bookings', { headers: getAdminHeaders() });
  if (!response.ok) {
    list.innerHTML = 'Unauthorized or failed to load bookings.';
    return;
  }

  const bookings = await response.json();
  renderRows(
    list,
    bookings,
    (booking) => `
      <article class="booking-item">
        <strong>${booking.guest_name}</strong> | ${booking.guests} guests, ${booking.duration_days} days<br/>
        Package: ${booking.package_name} • Check-in: ${booking.check_in_date}<br/>
        Contact: ${booking.phone} • ${booking.email}<br/>
        Notes: ${booking.notes || 'N/A'}
      </article>
    `
  );
});

document.getElementById('load-car-bookings').addEventListener('click', async () => {
  const list = document.getElementById('car-bookings-list');
  list.innerHTML = 'Loading...';

  const response = await fetch('/api/admin/car-bookings', { headers: getAdminHeaders() });
  if (!response.ok) {
    list.innerHTML = 'Unauthorized or failed to load car bookings.';
    return;
  }

  const bookings = await response.json();
  renderRows(
    list,
    bookings,
    (booking) => `
      <article class="booking-item">
        <strong>${booking.guest_name}</strong> | ${booking.car_name}<br/>
        Travelers: ${booking.travelers} • Duration: ${booking.duration_days} days<br/>
        Pickup: ${booking.pickup_date}<br/>
        Contact: ${booking.phone} • ${booking.email}<br/>
        Notes: ${booking.notes || 'N/A'}
      </article>
    `
  );
});
