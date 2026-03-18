// ========== VIEWER PAGE ==========

// DOM elements
const headingEl = document.getElementById('anniversaryHeading');
const sublineEl = document.getElementById('romanticLine');
const galleryEl = document.getElementById('gallery');

// Modal elements
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const modalCaption = document.getElementById('modalCaption');
const closeModal = document.querySelector('.close');

// Get data from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const linkId = urlParams.get('id');

if (!linkId) {
    alert('No shared data found. Invalid link.');
} else {
    loadMemories(linkId);
}

async function loadMemories(id) {
    try {
        // Fetch from Supabase database
        const response = await fetch(
            `https://aolmcvbtfkkxjqawwiqy.supabase.co/rest/v1/shares?id=eq.${id}`,
            {
                method: 'GET',
                headers: {
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvbG1jdmJ0ZmtreGpxYXd3aXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA4Njc5MjgsImV4cCI6MTk5Njc0NzkyOH0.KDH4VpYYT5qQJg5QQrQqYYQqYYQqYYQqYYQqYYQqYYQ',
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Database error: ${response.status}`);
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            alert('Shared memories not found. The link may have expired.');
            return;
        }

        const shareData = data[0];
        const dataPackage = shareData.data;
        const memories = dataPackage.memories || [];
        const subtext = dataPackage.subtext || 'our beautiful memories ❤️';

        sublineEl.innerText = subtext;
        renderGallery(memories);
        console.log('Successfully loaded from database');

    } catch (err) {
        alert('Failed to load shared memories.\n\nError: ' + err.message);
        console.error('Error:', err);
    }
}

// Render gallery (read-only)
function renderGallery(memories) {
    galleryEl.innerHTML = '';
    memories.forEach((item) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'memory-item';

        const mediaDiv = document.createElement('div');
        mediaDiv.className = 'media-container';

        const img = document.createElement('img');
        img.src = item.data;
        img.alt = 'memory';
        img.onerror = () => {
            img.src = 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&auto=format';
        };
        mediaDiv.appendChild(img);

        const noteP = document.createElement('p');
        noteP.className = 'note';
        noteP.innerText = item.note;

        itemDiv.appendChild(mediaDiv);
        itemDiv.appendChild(noteP);

        itemDiv.addEventListener('click', () => openModal(item.data, item.note));

        galleryEl.appendChild(itemDiv);
    });
}

// Open modal
function openModal(imgSrc, note) {
    modal.style.display = 'block';
    modalImg.src = imgSrc;
    modalCaption.innerText = note;
}

// Close modal
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});