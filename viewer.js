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

// Get data from localStorage using session ID
const urlParams = new URLSearchParams(window.location.search);
const encodedData = urlParams.get('data');

if (!encodedData) {
    alert('No shared data found.');
} else {
    try {
        // Decode URL-encoded data and decompress
        const compressed = decodeURIComponent(encodedData);
        const jsonString = LZString.decompressFromBase64(compressed);
        
        if (!jsonString) {
            throw new Error('Failed to decompress data');
        }

        const data = JSON.parse(jsonString);
        const memories = data.memories || [];
        const subtext = data.subtext || 'our beautiful memories ❤️';

        sublineEl.innerText = subtext;
        renderGallery(memories);
    } catch (err) {
        alert('Failed to load shared memories.\n\nError: ' + err.message);
        console.error(err);
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