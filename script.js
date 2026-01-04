// ===== Zitadelle 2026 - Interactive Features =====

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    initMobileMenu();

    // Load Schedule from CSV
    loadScheduleFromCSV();

    // Smooth Scroll for Navigation
    initSmoothScroll();

    // Navbar Scroll Effect
    initNavbarScroll();
});

// ===== Mobile Menu =====
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            });
        });
    }
}

// ===== Load Schedule from CSV =====
async function loadScheduleFromCSV() {
    try {
        const response = await fetch('programm.csv');
        const csvText = await response.text();
        const scheduleData = parseCSV(csvText);
        renderSchedule(scheduleData);
        initScheduleTabs();
    } catch (error) {
        console.error('Fehler beim Laden des Programms:', error);
    }
}

// Parse CSV to structured data
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row = {};
        headers.forEach((header, index) => {
            row[header.trim()] = values[index] ? values[index].trim() : '';
        });
        data.push(row);
    }

    return data;
}

// Handle CSV values with commas inside quotes
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current);
    return values;
}

// Render schedule from data
function renderSchedule(data) {
    const container = document.getElementById('schedule-container');
    if (!container) return;

    // Group by day
    const days = {};
    data.forEach(row => {
        const day = row.Tag;
        if (!days[day]) days[day] = [];
        days[day].push(row);
    });

    // Build HTML
    let html = `
        <div class="schedule-locations">
            <div class="schedule-time-header">Zeit</div>
            <div class="location-header location-stage">Hauptbühne</div>
            <div class="location-header location-beach">Strand</div>
            <div class="location-header location-pool">Pool</div>
        </div>
    `;

    Object.keys(days).forEach(dayNum => {
        const isFirst = dayNum === '1';
        html += `<div class="schedule-day${isFirst ? ' active' : ''}" id="day-${dayNum}">`;

        days[dayNum].forEach(row => {
            html += `
                <div class="schedule-row">
                    <div class="schedule-time">${row.Zeit}</div>
                    ${renderCell(row.Hauptbuehne_Typ, row.Hauptbuehne_Titel, row.Hauptbuehne_Beschreibung, 'Hauptbühne')}
                    ${renderCell(row.Strand_Typ, row.Strand_Titel, row.Strand_Beschreibung, 'Strand')}
                    ${renderCell(row.Pool_Typ, row.Pool_Titel, row.Pool_Beschreibung, 'Pool')}
                </div>
            `;
        });

        html += '</div>';
    });

    container.innerHTML = html;
}

// Render single cell
function renderCell(typ, titel, beschreibung, location) {
    if (!typ && !titel) {
        return `<div class="schedule-cell empty" data-location="${location}"><span class="cell-empty">—</span></div>`;
    }

    const typeClass = getTypeClass(typ);
    return `
        <div class="schedule-cell" data-location="${location}">
            <span class="schedule-type ${typeClass}">${typ}</span>
            <h4>${titel}</h4>
            <p>${beschreibung}</p>
        </div>
    `;
}

// Get CSS class for type
function getTypeClass(typ) {
    const t = typ.toLowerCase();
    if (['vortrag', 'keynote', 'panel'].includes(t)) return 'type-talk';
    if (['workshop'].includes(t)) return 'type-workshop';
    return 'type-general';
}

// ===== Schedule Tabs =====
function initScheduleTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const day = this.getAttribute('data-day');
            const scheduleDays = document.querySelectorAll('.schedule-day');

            // Remove active class from all buttons and days
            tabButtons.forEach(btn => btn.classList.remove('active'));
            scheduleDays.forEach(schedule => schedule.classList.remove('active'));

            // Add active class to clicked button and corresponding day
            this.classList.add('active');
            const targetDay = document.getElementById(`day-${day}`);
            if (targetDay) {
                targetDay.classList.add('active');
            }
        });
    });
}

// ===== Smooth Scroll =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Skip if it's just "#"
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== Navbar Scroll Effect =====
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', function() {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 100) {
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.boxShadow = 'none';
        }

        lastScrollY = currentScrollY;
    });
}

// ===== Intersection Observer for Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe elements with animation classes
document.querySelectorAll('.info-card, .speaker-card, .ticket-card, .stat-item, .faq-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add animate-in styles
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    </style>
`);
