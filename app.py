import json
import os
import sqlite3
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

BASE_DIR = Path(__file__).parent
PUBLIC_DIR = BASE_DIR / 'public'
DATA_DIR = BASE_DIR / 'data'
DB_PATH = DATA_DIR / 'andaman.db'
PORT = int(os.environ.get('PORT', '3000'))
ADMIN_KEY = os.environ.get('ADMIN_KEY', 'andaman-admin-2026')
ADMIN_PATH = os.environ.get('ADMIN_PATH', '/andaman-command-portal-9x7')

DATA_DIR.mkdir(exist_ok=True)


def db_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def setup_db():
    conn = db_conn()
    cur = conn.cursor()
    cur.executescript(
        '''
        CREATE TABLE IF NOT EXISTS hotels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            location TEXT NOT NULL,
            price_per_night INTEGER NOT NULL,
            description TEXT NOT NULL,
            image_url TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            price INTEGER NOT NULL,
            duration TEXT NOT NULL,
            description TEXT NOT NULL,
            image_url TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS cars (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            car_type TEXT NOT NULL,
            seats INTEGER NOT NULL,
            price_per_day INTEGER NOT NULL,
            description TEXT NOT NULL,
            image_url TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS gallery_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guest_name TEXT NOT NULL,
            title TEXT NOT NULL,
            story TEXT NOT NULL,
            image_url TEXT NOT NULL,
            rating INTEGER NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guest_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            package_name TEXT NOT NULL,
            guests INTEGER NOT NULL,
            duration_days INTEGER NOT NULL,
            check_in_date TEXT NOT NULL,
            notes TEXT,
            payment_status TEXT DEFAULT 'pending',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS car_bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guest_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            car_name TEXT NOT NULL,
            pickup_date TEXT NOT NULL,
            duration_days INTEGER NOT NULL,
            travelers INTEGER NOT NULL,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        '''
    )

    if cur.execute('SELECT COUNT(*) FROM hotels').fetchone()[0] == 0:
        cur.executemany(
            'INSERT INTO hotels (name, location, price_per_night, description, image_url) VALUES (?, ?, ?, ?, ?)',
            [
                (
                    'Coral Crown Resort',
                    'Havelock Island',
                    12500,
                    'Oceanfront luxury suites with private decks, sunset dining, and curated island experiences.',
                    'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1400&q=80',
                ),
                (
                    'Lagoon Whisper Villa',
                    'Neil Island',
                    9800,
                    'Boutique stay near white sand beaches, crystal lagoons, and guided snorkeling escapes.',
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80',
                ),
                (
                    'Emerald Bay Retreat',
                    'Port Blair',
                    7600,
                    'Contemporary comfort with tropical gardens, rooftop pool, and seamless city-to-island connectivity.',
                    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80',
                ),
            ],
        )

    if cur.execute('SELECT COUNT(*) FROM activities').fetchone()[0] == 0:
        cur.executemany(
            'INSERT INTO activities (title, category, price, duration, description, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [
                (
                    'Scuba Diving Master Trail',
                    'Adventure',
                    6200,
                    '4 Hours',
                    'Certified trainers guide you through vibrant coral gardens and blue-water walls.',
                    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1400&q=80',
                ),
                (
                    'Mangrove Kayak Safari',
                    'Eco Tour',
                    2800,
                    '2.5 Hours',
                    'Paddle through living mangrove tunnels while spotting rare island birds and marine life.',
                    'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80',
                ),
                (
                    'Luxury Yacht Sunset Cruise',
                    'Premium',
                    9400,
                    '3 Hours',
                    'Private yacht cruise with chef-curated canapés and panoramic sunset photography points.',
                    'https://images.unsplash.com/photo-1540206395-68808572332f?auto=format&fit=crop&w=1400&q=80',
                ),
            ],
        )

    if cur.execute('SELECT COUNT(*) FROM cars').fetchone()[0] == 0:
        cur.executemany(
            'INSERT INTO cars (name, car_type, seats, price_per_day, description, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [
                (
                    'Island Cruiser XUV',
                    'SUV',
                    6,
                    4800,
                    'Premium AC SUV with island-trained driver ideal for long scenic circuits.',
                    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1400&q=80',
                ),
                (
                    'Seabreeze Sedan',
                    'Sedan',
                    4,
                    3200,
                    'Executive sedan for airport transfers, city rides and premium date routes.',
                    'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1400&q=80',
                ),
                (
                    'Voyager Tempo',
                    'Tempo Traveller',
                    12,
                    7800,
                    'Group-ready transport with comfort suspension and luggage-optimized layout.',
                    'https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?auto=format&fit=crop&w=1400&q=80',
                ),
            ],
        )

    if cur.execute('SELECT COUNT(*) FROM gallery_items').fetchone()[0] == 0:
        cur.executemany(
            'INSERT INTO gallery_items (guest_name, title, story, image_url, rating) VALUES (?, ?, ?, ?, ?)',
            [
                (
                    'Aarav & Nisha',
                    'Sunset Vows at Radhanagar',
                    'Our anniversary dinner setup and private beach photoshoot were beyond luxury.',
                    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
                    5,
                ),
                (
                    'The Sen Family',
                    'Coral Discovery Week',
                    'Kids loved the marine trail and our guide made every day smooth and safe.',
                    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80',
                    5,
                ),
                (
                    'Maya R.',
                    'Solo Escape Journal',
                    'From airport pickup to kayaking trails, every touchpoint felt premium and easy.',
                    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80',
                    4,
                ),
            ],
        )

    conn.commit()
    conn.close()


def rows_to_dicts(rows):
    return [dict(row) for row in rows]


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PUBLIC_DIR), **kwargs)

    def _read_json(self):
        length = int(self.headers.get('Content-Length', '0'))
        if length == 0:
            return {}
        body = self.rfile.read(length)
        return json.loads(body.decode('utf-8'))

    def _json(self, data, status=200):
        payload = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def _is_admin(self):
        return self.headers.get('x-admin-key') == ADMIN_KEY

    def do_GET(self):
        path = urlparse(self.path).path
        conn = db_conn()
        cur = conn.cursor()

        if path == '/api/health':
            conn.close()
            return self._json({'status': 'ok', 'app': 'Andaman&Co.', 'timestamp': datetime.utcnow().isoformat()})
        if path == '/api/hotels':
            rows = cur.execute('SELECT * FROM hotels ORDER BY created_at DESC').fetchall()
            conn.close()
            return self._json(rows_to_dicts(rows))
        if path == '/api/activities':
            rows = cur.execute('SELECT * FROM activities ORDER BY created_at DESC').fetchall()
            conn.close()
            return self._json(rows_to_dicts(rows))
        if path == '/api/cars':
            rows = cur.execute('SELECT * FROM cars ORDER BY created_at DESC').fetchall()
            conn.close()
            return self._json(rows_to_dicts(rows))
        if path == '/api/gallery':
            rows = cur.execute('SELECT * FROM gallery_items ORDER BY created_at DESC').fetchall()
            conn.close()
            return self._json(rows_to_dicts(rows))
        if path == '/api/admin/bookings':
            if not self._is_admin():
                conn.close()
                return self._json({'error': 'Unauthorized admin key.'}, 401)
            rows = cur.execute('SELECT * FROM bookings ORDER BY created_at DESC').fetchall()
            conn.close()
            return self._json(rows_to_dicts(rows))
        if path == '/api/admin/car-bookings':
            if not self._is_admin():
                conn.close()
                return self._json({'error': 'Unauthorized admin key.'}, 401)
            rows = cur.execute('SELECT * FROM car_bookings ORDER BY created_at DESC').fetchall()
            conn.close()
            return self._json(rows_to_dicts(rows))

        conn.close()
        if path == ADMIN_PATH:
            self.path = '/andaman-command-portal-9x7.html'
        return super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        conn = db_conn()
        cur = conn.cursor()
        data = self._read_json()

        if path == '/api/bookings':
            required = ['guest_name', 'phone', 'email', 'package_name', 'guests', 'duration_days', 'check_in_date']
            if any(not data.get(field) for field in required):
                conn.close()
                return self._json({'error': 'Please provide all required booking details.'}, 400)
            cur.execute(
                '''
                INSERT INTO bookings (guest_name, phone, email, package_name, guests, duration_days, check_in_date, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''',
                (
                    str(data['guest_name']).strip(),
                    str(data['phone']).strip(),
                    str(data['email']).strip(),
                    str(data['package_name']).strip(),
                    int(data['guests']),
                    int(data['duration_days']),
                    str(data['check_in_date']),
                    str(data.get('notes', '')).strip() or None,
                ),
            )
            booking_id = cur.lastrowid
            conn.commit()
            booking = cur.execute('SELECT * FROM bookings WHERE id = ?', (booking_id,)).fetchone()
            conn.close()
            return self._json(dict(booking), 201)

        if path == '/api/car-bookings':
            required = ['guest_name', 'phone', 'email', 'car_name', 'pickup_date', 'duration_days', 'travelers']
            if any(not data.get(field) for field in required):
                conn.close()
                return self._json({'error': 'Please provide all required car booking details.'}, 400)
            cur.execute(
                '''
                INSERT INTO car_bookings (guest_name, phone, email, car_name, pickup_date, duration_days, travelers, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''',
                (
                    str(data['guest_name']).strip(),
                    str(data['phone']).strip(),
                    str(data['email']).strip(),
                    str(data['car_name']).strip(),
                    str(data['pickup_date']),
                    int(data['duration_days']),
                    int(data['travelers']),
                    str(data.get('notes', '')).strip() or None,
                ),
            )
            booking_id = cur.lastrowid
            conn.commit()
            booking = cur.execute('SELECT * FROM car_bookings WHERE id = ?', (booking_id,)).fetchone()
            conn.close()
            return self._json(dict(booking), 201)

        if path == '/api/admin/hotels':
            if not self._is_admin():
                conn.close()
                return self._json({'error': 'Unauthorized admin key.'}, 401)
            required = ['name', 'location', 'price_per_night', 'description', 'image_url']
            if any(not data.get(field) for field in required):
                conn.close()
                return self._json({'error': 'All hotel fields are required.'}, 400)
            cur.execute(
                'INSERT INTO hotels (name, location, price_per_night, description, image_url) VALUES (?, ?, ?, ?, ?)',
                (
                    data['name'].strip(),
                    data['location'].strip(),
                    int(data['price_per_night']),
                    data['description'].strip(),
                    data['image_url'].strip(),
                ),
            )
            record_id = cur.lastrowid
            conn.commit()
            record = cur.execute('SELECT * FROM hotels WHERE id = ?', (record_id,)).fetchone()
            conn.close()
            return self._json(dict(record), 201)

        if path == '/api/admin/activities':
            if not self._is_admin():
                conn.close()
                return self._json({'error': 'Unauthorized admin key.'}, 401)
            required = ['title', 'category', 'price', 'duration', 'description', 'image_url']
            if any(not data.get(field) for field in required):
                conn.close()
                return self._json({'error': 'All activity fields are required.'}, 400)
            cur.execute(
                'INSERT INTO activities (title, category, price, duration, description, image_url) VALUES (?, ?, ?, ?, ?, ?)',
                (
                    data['title'].strip(),
                    data['category'].strip(),
                    int(data['price']),
                    data['duration'].strip(),
                    data['description'].strip(),
                    data['image_url'].strip(),
                ),
            )
            record_id = cur.lastrowid
            conn.commit()
            record = cur.execute('SELECT * FROM activities WHERE id = ?', (record_id,)).fetchone()
            conn.close()
            return self._json(dict(record), 201)

        if path == '/api/admin/cars':
            if not self._is_admin():
                conn.close()
                return self._json({'error': 'Unauthorized admin key.'}, 401)
            required = ['name', 'car_type', 'seats', 'price_per_day', 'description', 'image_url']
            if any(not data.get(field) for field in required):
                conn.close()
                return self._json({'error': 'All car fields are required.'}, 400)
            cur.execute(
                'INSERT INTO cars (name, car_type, seats, price_per_day, description, image_url) VALUES (?, ?, ?, ?, ?, ?)',
                (
                    data['name'].strip(),
                    data['car_type'].strip(),
                    int(data['seats']),
                    int(data['price_per_day']),
                    data['description'].strip(),
                    data['image_url'].strip(),
                ),
            )
            record_id = cur.lastrowid
            conn.commit()
            record = cur.execute('SELECT * FROM cars WHERE id = ?', (record_id,)).fetchone()
            conn.close()
            return self._json(dict(record), 201)

        if path == '/api/admin/gallery':
            if not self._is_admin():
                conn.close()
                return self._json({'error': 'Unauthorized admin key.'}, 401)
            required = ['guest_name', 'title', 'story', 'image_url', 'rating']
            if any(not data.get(field) for field in required):
                conn.close()
                return self._json({'error': 'All gallery fields are required.'}, 400)
            cur.execute(
                'INSERT INTO gallery_items (guest_name, title, story, image_url, rating) VALUES (?, ?, ?, ?, ?)',
                (
                    data['guest_name'].strip(),
                    data['title'].strip(),
                    data['story'].strip(),
                    data['image_url'].strip(),
                    int(data['rating']),
                ),
            )
            record_id = cur.lastrowid
            conn.commit()
            record = cur.execute('SELECT * FROM gallery_items WHERE id = ?', (record_id,)).fetchone()
            conn.close()
            return self._json(dict(record), 201)

        conn.close()
        self._json({'error': 'Not found'}, 404)


if __name__ == '__main__':
    setup_db()
    server = ThreadingHTTPServer(('0.0.0.0', PORT), Handler)
    print(f'Andaman&Co. running at http://localhost:{PORT}')
    print(f'Admin route: {ADMIN_PATH}')
    server.serve_forever()
