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
const compressedData = urlParams.get('d');
const linkId = urlParams.get('id');

console.log('URL params:', { d: !!compressedData, id: linkId });

if (!compressedData && !linkId) {
    alert('No shared data found. Invalid link.');
} else if (compressedData) {
    // Decompress from URL
    loadFromCompressed(compressedData);
} else if (linkId) {
    // Try localStorage or old method
    loadFromId(linkId);
}

function loadFromCompressed(compressed) {
    try {
        if (typeof LZString === 'undefined') {
            throw new Error('Decompression library not loaded');
        }

        const jsonString = LZString.decompressFromEncodedURIComponent(compressed);
        
        if (!jsonString) {
            throw new Error('Failed to decompress - data may be corrupted');
        }

        const dataPackage = JSON.parse(jsonString);
        const memories = dataPackage.memories || [];
        const subtext = dataPackage.subtext || 'our beautiful memories ❤️';

        sublineEl.innerText = subtext;
        renderGallery(memories);
        console.log('✅ Successfully loaded from compressed URL');

    } catch (err) {
        alert('Failed to load memories.\n\nError: ' + err.message);
        console.error('Decompression error:', err);
    }
}

function loadFromId(id) {
    try {
        // Try localStorage first
        const storedJson = localStorage.getItem(`memo_${id}`);
        const expiry = localStorage.getItem(`memo_exp_${id}`);

        if (!storedJson || !expiry) {
            alert('Link not found. Please generate a new link or use the same device.');
            return;
        }

        if (Date.now() > parseInt(expiry)) {
            localStorage.removeItem(`memo_${id}`);
            localStorage.removeItem(`memo_exp_${id}`);
            alert('This link has expired (valid for 30 days).');
            return;
        }

        const dataPackage = JSON.parse(storedJson);
        const memories = dataPackage.memories || [];
        const subtext = dataPackage.subtext || 'our beautiful memories ❤️';

        sublineEl.innerText = subtext;
        renderGallery(memories);
        console.log('✅ Loaded from localStorage');

    } catch (err) {
        alert('Failed to load memories.\n\nError: ' + err.message);
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