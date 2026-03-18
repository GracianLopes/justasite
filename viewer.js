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
const pasteId = urlParams.get('p');
const linkId = urlParams.get('id');

if (!pasteId && !linkId) {
    alert('No shared data found. Invalid link.');
} else if (pasteId) {
    // Load from Pastebin
    loadFromPastebin(pasteId);
} else if (linkId) {
    // Load from localStorage fallback
    loadFromLocalStorage(linkId);
}

async function loadFromPastebin(id) {
    try {
        const response = await fetch(`https://pastebin.com/raw/${id}`);
        const jsonString = await response.text();

        const dataPackage = JSON.parse(jsonString);
        const memories = dataPackage.memories || [];
        const subtext = dataPackage.subtext || 'our beautiful memories ❤️';

        sublineEl.innerText = subtext;
        renderGallery(memories);
        console.log('Successfully loaded from Pastebin');
    } catch (err) {
        alert('Failed to load shared memories.\n\nError: ' + err.message);
        console.error('Pastebin error:', err);
    }
}

function loadFromLocalStorage(id) {
    try {
        const storedData = localStorage.getItem(id);
        
        if (!storedData) {
            alert('Shared memories not found. The link may have expired.');
            return;
        }

        const parsedData = JSON.parse(storedData);
        
        // Check if link has expired
        if (parsedData.expiry && Date.now() > parsedData.expiry) {
            alert('This link has expired (valid for 30 days).');
            localStorage.removeItem(id);
            return;
        }

        const dataPackage = parsedData.data;
        const memories = dataPackage.memories || [];
        const subtext = dataPackage.subtext || 'our beautiful memories ❤️';

        sublineEl.innerText = subtext;
        renderGallery(memories);
        console.log('Successfully loaded from localStorage');
    } catch (err) {
        alert('Failed to load shared memories.\n\nError: ' + err.message);
        console.error('localStorage error:', err);
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