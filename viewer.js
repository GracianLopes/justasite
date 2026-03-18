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

function loadMemories(id) {
    try {
        // First, try to load from localStorage (same device or cached)
        const storedJson = localStorage.getItem(`memo_${id}`);
        const expiry = localStorage.getItem(`memo_exp_${id}`);

        if (storedJson && expiry) {
            // Check if expired
            if (Date.now() > parseInt(expiry)) {
                localStorage.removeItem(`memo_${id}`);
                localStorage.removeItem(`memo_exp_${id}`);
                alert('This link has expired (valid for 30 days).');
                return;
            }

            // Load from localStorage
            try {
                const dataPackage = JSON.parse(storedJson);
                const memories = dataPackage.memories || [];
                const subtext = dataPackage.subtext || 'our beautiful memories ❤️';

                sublineEl.innerText = subtext;
                renderGallery(memories);
                console.log('Successfully loaded from localStorage');
                return;
            } catch (parseErr) {
                console.error('Failed to parse localStorage data:', parseErr);
                localStorage.removeItem(`memo_${id}`);
                localStorage.removeItem(`memo_exp_${id}`);
            }
        }

        // If not in localStorage, show message
        alert('Shared memories not found. This link only works on the device where it was created, or refresh if you just created it.');
        console.log('Link ID:', id);
        console.log('Available IDs in storage:', Object.keys(localStorage).filter(k => k.startsWith('memo_')));

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