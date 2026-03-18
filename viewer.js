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

// Get data from compressed URL
const urlParams = new URLSearchParams(window.location.search);
const compressedData = urlParams.get('z');
const encodedData = urlParams.get('data');
const linkId = urlParams.get('id');

if (!compressedData && !encodedData && !linkId) {
    alert('No shared data found.');
} else if (compressedData) {
    // Decompress data from URL
    try {
        const decompressed = decodeURIComponent(compressedData);
        const jsonString = LZString.decompressFromBase64(decompressed);
        
        if (!jsonString) {
            throw new Error('Failed to decompress data');
        }

        const data = JSON.parse(jsonString);
        const memories = data.memories || [];
        const subtext = data.subtext || 'our beautiful memories ❤️';

        sublineEl.innerText = subtext;
        renderGallery(memories);
        
        console.log('Successfully loaded compressed memories');
    } catch (err) {
        alert('Failed to load shared memories.\n\nError: ' + err.message);
        console.error(err);
    }
} else if (encodedData) {
    // Legacy: Data is embedded in URL as base64
    try {
        const base64Data = decodeURIComponent(encodedData)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        const padding = '='.repeat((4 - base64Data.length % 4) % 4);
        const jsonString = decodeURIComponent(atob(base64Data + padding));
        const data = JSON.parse(jsonString);

        const memories = data.memories || [];
        const subtext = data.subtext || 'our beautiful memories ❤️';

        sublineEl.innerText = subtext;
        renderGallery(memories);
    } catch (err) {
        alert('Failed to load shared memories.\n\nError: ' + err.message);
        console.error(err);
    }
} else if (linkId) {
    // Legacy: Try localStorage fallback
    loadFromLocalStorage(linkId);
}

// Fallback function to load from localStorage (for legacy links)
function loadFromLocalStorage(linkId) {
    try {
        const storedData = localStorage.getItem(linkId);
        
        if (!storedData) {
            alert('Shared memories not found. The link may have expired.');
            console.error('Link ID not found:', linkId);
        } else {
            const parsedData = JSON.parse(storedData);
            
            // Check if link has expired
            if (parsedData.expiry && Date.now() > parsedData.expiry) {
                alert('This link has expired (valid for 30 days).');
                localStorage.removeItem(linkId);
            } else {
                const data = parsedData.data;
                const memories = data.memories || [];
                const subtext = data.subtext || 'our beautiful memories ❤️';

                sublineEl.innerText = subtext;
                renderGallery(memories);
            }
        }
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