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

// Get data from Firebase or localStorage using short ID
const urlParams = new URLSearchParams(window.location.search);
const linkId = urlParams.get('id');

if (!linkId) {
    alert('No shared data found.');
} else {
    // Try Firebase first, fallback to localStorage
    if (window.database) {
        window.database.ref(`memories/${linkId}`).once('value')
            .then(snapshot => {
                if (snapshot.exists()) {
                    const storedData = snapshot.val();
                    
                    // Check if expired
                    if (storedData.expiresAt && Date.now() > storedData.expiresAt) {
                        alert('This link has expired (valid for 30 days).');
                        // Optional: Delete expired entry
                        window.database.ref(`memories/${linkId}`).remove();
                    } else {
                        const data = storedData.data;
                        const memories = data.memories || [];
                        const subtext = data.subtext || 'our beautiful memories ❤️';

                        sublineEl.innerText = subtext;
                        renderGallery(memories);
                    }
                } else {
                    // Firebase doesn't have it, try localStorage
                    loadFromLocalStorage(linkId);
                }
            })
            .catch(err => {
                console.log('Firebase error, trying localStorage:', err);
                loadFromLocalStorage(linkId);
            });
    } else {
        // Firebase not available, use localStorage
        loadFromLocalStorage(linkId);
    }
}

// Fallback function to load from localStorage
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