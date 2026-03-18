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
        let dataPackage = null;

        // Try localStorage first (works immediately, same device)
        const localData = localStorage.getItem(`share_${id}`);
        if (localData) {
            const parsedData = JSON.parse(localData);
            
            // Check if link has expired
            if (parsedData.expiry && Date.now() > parsedData.expiry) {
                alert('This link has expired (valid for 30 days).');
                localStorage.removeItem(`share_${id}`);
            } else {
                dataPackage = parsedData.data;
                console.log('Loaded from localStorage');
            }
        }

        // If not in localStorage, try JSONBin (cross-device)
        if (!dataPackage) {
            try {
                // Search for the share on JSONBin
                const binResponse = await fetch(`https://api.jsonbin.io/v3/b`, {
                    method: 'GET',
                    headers: {
                        'X-Master-Key': '$2b$10$EXwigf9pvclaim0GW.AoN.default'
                    }
                });

                if (binResponse.ok) {
                    const bins = await binResponse.json();
                    // Find the bin with matching shareId
                    const foundBin = bins.records?.find(bin => bin.shareId === id);
                    if (foundBin) {
                        dataPackage = foundBin.data;
                        console.log('Loaded from JSONBin');
                    }
                }
            } catch (binErr) {
                console.log('JSONBin fetch failed:', binErr.message);
            }
        }

        if (!dataPackage) {
            alert('Shared memories not found. The link may have expired.');
            return;
        }

        const memories = dataPackage.memories || [];
        const subtext = dataPackage.subtext || 'our beautiful memories ❤️';

        sublineEl.innerText = subtext;
        renderGallery(memories);
        console.log('Successfully loaded memories');

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