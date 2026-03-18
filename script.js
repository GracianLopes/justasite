// ========== ADMIN PAGE ==========

// DOM elements
const headingEl = document.getElementById('anniversaryHeading');
const sublineEl = document.getElementById('romanticLine');
const galleryEl = document.getElementById('gallery');
const addMemoryBtn = document.getElementById('addMemoryBtn');
const editSubtextBtn = document.getElementById('editSubtextBtn');
const generateLinkBtn = document.getElementById('generateLinkBtn');
const imageUpload = document.getElementById('imageUpload');

// Modal elements
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const modalCaption = document.getElementById('modalCaption');
const closeModal = document.querySelector('.close');

// Popup elements
const linkPopup = document.getElementById('linkPopup');
const shareLinkInput = document.getElementById('shareLinkInput');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const closePopupBtn = document.getElementById('closePopupBtn');

// Default data
const DEFAULT_HEADING = '6th Month Anniversary';
const DEFAULT_SUBTEXT = 'our beautiful memories ❤️';
const DEFAULT_MEMORIES = [
    {
        type: 'image',
        data: 'https://images.unsplash.com/photo-1522673607200-164d1b3ce5b4?w=600&auto=format',
        note: 'First date'
    },
    {
        type: 'image',
        data: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&auto=format',
        note: 'Sunset together'
    },
    {
        type: 'image',
        data: 'https://images.unsplash.com/photo-1503449377594-32dd9ac4467c?w=600&auto=format',
        note: 'Our favorite moment'
    }
];

// Load from localStorage or use defaults
let heading = DEFAULT_HEADING;
let subtext = localStorage.getItem('subtext') || DEFAULT_SUBTEXT;
let memories = localStorage.getItem('memories')
    ? JSON.parse(localStorage.getItem('memories'))
    : DEFAULT_MEMORIES;

headingEl.innerText = heading;
sublineEl.innerText = subtext;

// Render gallery
function renderGallery() {
    galleryEl.innerHTML = '';
    memories.forEach((item, index) => {
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

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'item-actions';

        const editBtn = document.createElement('button');
        editBtn.innerText = '✏️ Edit note';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            editNote(index);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = '🗑️ Delete';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteMemory(index);
        });

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        itemDiv.appendChild(mediaDiv);
        itemDiv.appendChild(noteP);
        itemDiv.appendChild(actionsDiv);

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

// Edit note
function editNote(index) {
    const newNote = prompt('Edit note:', memories[index].note);
    if (newNote !== null) {
        memories[index].note = newNote.trim() || memories[index].note;
        localStorage.setItem('memories', JSON.stringify(memories));
        renderGallery();
    }
}

// Delete memory
function deleteMemory(index) {
    if (confirm('Remove this memory?')) {
        memories.splice(index, 1);
        localStorage.setItem('memories', JSON.stringify(memories));
        renderGallery();
    }
}

// Handle image upload
imageUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
        alert('Image is larger than 10MB. It might not display properly.');
    }

    const reader = new FileReader();
    reader.onload = function(ev) {
        const dataUrl = ev.target.result;
        const note = prompt('Add a note for this image:');
        if (note !== null) {
            memories.push({
                type: 'image',
                data: dataUrl,
                note: note.trim() || '📸'
            });
            localStorage.setItem('memories', JSON.stringify(memories));
            renderGallery();
        }
    };
    reader.readAsDataURL(file);
    imageUpload.value = '';
});

// Add memory button
addMemoryBtn.addEventListener('click', () => {
    imageUpload.click();
});

// ===== GENERATE SHARE LINK (using compressed URL encoding) =====
generateLinkBtn.addEventListener('click', async () => {
    if (!memories || memories.length === 0) {
        alert('Add at least one memory before generating a link.');
        return;
    }

    const dataPackage = {
        memories: memories,
        subtext: subtext
    };

    const jsonString = JSON.stringify(dataPackage);
    const sizeInMB = jsonString.length / (1024 * 1024);

    if (sizeInMB > 50) {
        alert(`❌ Total data size is ${sizeInMB.toFixed(2)}MB. Please reduce the number of photos.`);
        return;
    }

    try {
        generateLinkBtn.disabled = true;
        generateLinkBtn.innerText = 'Creating share link...';

        // Compress data using LZ-string
        const compressed = LZString.compressToBase64(jsonString);
        
        // Encode for URL safety
        const encodedData = encodeURIComponent(compressed);

        // Generate the viewer URL with compressed data
        const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '');
        const viewerUrl = `${baseUrl}viewer.html?data=${encodedData}`;

        shareLinkInput.value = viewerUrl;
        linkPopup.classList.remove('hidden');

    } catch (err) {
        alert('Failed to create share link.\n\nError: ' + err.message);
        console.error('Upload error:', err);
    } finally {
        generateLinkBtn.disabled = false;
        generateLinkBtn.innerText = '🔗 Generate share link';
    }
});

// Copy link button
copyLinkBtn.addEventListener('click', () => {
    shareLinkInput.select();
    document.execCommand('copy');
    alert('Link copied!');
});

// Close popup
closePopupBtn.addEventListener('click', () => {
    linkPopup.classList.add('hidden');
});

// Edit subtext
editSubtextBtn.addEventListener('click', () => {
    const newSub = prompt('Edit subtext:', subtext);
    if (newSub !== null) {
        subtext = newSub.trim() || subtext;
        localStorage.setItem('subtext', subtext);
        sublineEl.innerText = subtext;
    }
});

// Initial render
renderGallery();