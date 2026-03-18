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

        // First, try to load from localStorage (same device)
        const storedJson = localStorage.getItem(`memo_${id}`);
        const expiry = localStorage.getItem(`memo_exp_${id}`);

        if (storedJson && expiry) {
            // Check if expired
            if (Date.now() > parseInt(expiry)) {
                localStorage.removeItem(`memo_${id}`);
                localStorage.removeItem(`memo_exp_${id}`);
                console.log('localStorage data expired, trying Supabase...');
            } else {
                // Load from localStorage
                try {
                    dataPackage = JSON.parse(storedJson);
                    const memories = dataPackage.memories || [];
                    const subtext = dataPackage.subtext || 'our beautiful memories ❤️';

                    sublineEl.innerText = subtext;
                    renderGallery(memories);
                    console.log('✅ Loaded from localStorage');
                    return;
                } catch (parseErr) {
                    console.error('Failed to parse localStorage:', parseErr);
                    localStorage.removeItem(`memo_${id}`);
                }
            }
        }

        // If not in localStorage, try Supabase (cross-device)
        console.log('Fetching from Supabase for cross-device access...');
        const supabaseUrl = 'https://aolmcvbtfkkxjqawwiqy.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvbG1jdmJ0ZmtreGpxYXd3aXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA4Njc5MjgsImV4cCI6MTk5Njc0NzkyOH0.KDH4VpYYT5qQJg5QQrQqYYQqYYQqYYQqYYQqYYQqYYQ';
        
        const response = await fetch(
            `${supabaseUrl}/rest/v1/anniversary_shares?link_id=eq.${id}`,
            {
                method: 'GET',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`
                }
            }
        );

        if (response.ok) {
            const rows = await response.json();
            
            if (rows && rows.length > 0) {
                dataPackage = rows[0].data;
                const memories = dataPackage.memories || [];
                const subtext = dataPackage.subtext || 'our beautiful memories ❤️';

                sublineEl.innerText = subtext;
                renderGallery(memories);
                console.log('✅ Loaded from Supabase - works cross-device!');
                return;
            }
        } else {
            console.warn('Supabase response error:', response.status);
        }

        // If we get here, data not found anywhere
        alert('Shared memories not found. The link may have expired or is invalid.');
        console.log('Link ID:', id);

    } catch (err) {
        console.error('Error loading memories:', err);
        alert('Failed to load shared memories.\n\nError: ' + err.message);
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