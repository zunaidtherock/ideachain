const API_BASE = 'http://127.0.0.1:8080/api';

// --- UI Utilities ---
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-info"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        if (container.contains(toast)) container.removeChild(toast);
    }, 4000);
}

function showSection(sectionId) {
    ['profile-section', 'submit-idea-section', 'collab-section'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}

function toggleCollabView(view) {
    if (view === 'search') {
        document.getElementById('search-view').classList.remove('hidden');
        document.getElementById('recruit-view').classList.add('hidden');
    } else {
        document.getElementById('search-view').classList.add('hidden');
        document.getElementById('recruit-view').classList.remove('hidden');
    }
}

// --- Auth Handlers ---
async function handleResponse(res) {
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || 'Something went wrong');
    }
    return res.json();
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

// Signup
if (document.getElementById('signup-form')) {
    document.getElementById('signup-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const pwd = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;
        if (pwd !== confirm) return showToast('Passwords do not match');

        const user = {
            name: document.getElementById('signup-name').value,
            phone: document.getElementById('signup-phone').value,
            email: document.getElementById('signup-email').value,
            password: pwd
        };

        try {
            await fetch(`${API_BASE}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            }).then(handleResponse);
            showToast('Account created successfully! Please log in.');
            toggleAuthView('login');
        } catch (err) { showToast(err.message); }
    });
}

// Login
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const credentials = {
            identifier: document.getElementById('login-identifier').value,
            password: document.getElementById('login-password').value
        };

        try {
            const data = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            }).then(handleResponse);
            localStorage.setItem('token', data.access_token);
            window.location.href = 'dashboard.html';
        } catch (err) { showToast(err.message); }
    });
}

// --- Dashboard Functions ---

// Load Profile
async function loadProfile() {
    try {
        const data = await fetch(`${API_BASE}/user/profile`, { headers: authHeaders() }).then(handleResponse);

        // Update greeting
        document.getElementById('user-greeting').innerHTML = `<i class="fa-solid fa-user-astronaut"></i> Hello, ${data.user.name.split(' ')[0]}`;

        // Update profile box
        document.getElementById('profile-info').innerHTML = `
            <div style="display:flex; align-items:center; gap:15px; margin-bottom:15px;">
                <div style="width:60px; height:60px; border-radius:50%; background:var(--accent-primary); display:flex; align-items:center; justify-content:center; font-size:1.5rem; color:#000;">
                    ${data.user.name.charAt(0)}
                </div>
                <div>
                    <h3 style="margin:0">${data.user.name}</h3>
                    <p style="margin:0; font-size:0.9rem;"><i class="fa-solid fa-envelope"></i> ${data.user.email}</p>
                </div>
            </div>
            <p><i class="fa-solid fa-phone"></i> ${data.user.phone}</p>
            <div style="margin-top:1rem; border-top:1px solid var(--glass-border); padding-top:1rem; display:flex; gap:10px;">
                <span class="badge badge-accepted">${data.submitted_ideas.length} Ideas</span>
                <span class="badge badge-pending">${data.received_requests.length} Requests</span>
            </div>
        `;

        // Update ideas
        const ideasList = document.getElementById('my-ideas-list');
        ideasList.innerHTML = data.submitted_ideas.length ? data.submitted_ideas.map(idea => `
            <div class="idea-card hover-active">
                <span class="badge badge-category"><i class="fa-solid fa-tag"></i> ${idea.category}</span>
                <h3 style="color:var(--accent-primary); margin-bottom:10px;">${idea.title}</h3>
                <p style="font-size:0.95rem;">${idea.description.substring(0, 100)}${idea.description.length > 100 ? '...' : ''}</p>
                <div style="margin-top:15px; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px; font-size:0.8rem; color:var(--text-muted); display:flex; justify-content:space-between;">
                    <span><i class="fa-solid fa-clock"></i> ${new Date(idea.timestamp).toLocaleDateString()}</span>
                    <span><i class="fa-solid fa-fingerprint"></i> ID: #${idea.id}</span>
                </div>
            </div>
        `).join('') : '<p style="grid-column: 1 / -1; opacity:0.7;">No ideas protected yet. Start innovating!</p>';

        // Populate recruiting dropdown
        if (document.getElementById('recruit-idea-id')) {
            const select = document.getElementById('recruit-idea-id');
            select.innerHTML = '<option value="" disabled selected>Select Idea for Recruitment</option>' +
                data.submitted_ideas.map(i => `<option value="${i.id}">${i.title}</option>`).join('');
        }

        loadNotifications();
    } catch (err) {
        if (err.message.includes('validate credentials')) logout();
        console.error(err);
    }
}

async function loadNotifications() {
    try {
        const notifs = await fetch(`${API_BASE}/user/notifications`, { headers: authHeaders() }).then(handleResponse);
        const unread = notifs.filter(n => !n.is_read);

        if (unread.length) document.getElementById('notif-badge').textContent = unread.length;
        else document.getElementById('notif-badge').textContent = '0';

        document.getElementById('notifications-list').innerHTML = notifs.length ? notifs.map(n => `
            <div class="notif-card" style="border-left: 4px solid ${n.is_read ? 'var(--glass-border)' : 'var(--accent-primary)'}; padding: 1rem;">
                <p style="margin-bottom:8px; color:${n.is_read ? 'var(--text-muted)' : '#fff'};"><i class="fa-solid fa-message"></i> ${n.message}</p>
                <small style="opacity:0.6; font-size:0.8rem;"><i class="fa-solid fa-clock"></i> ${new Date(n.timestamp).toLocaleString()}</small>
            </div>
        `).join('') : '<p style="opacity:0.7; text-align:center; margin-top:20px;">All caught up!</p>';

        // Mark as read after loading
        if (unread.length) {
            setTimeout(() => {
                fetch(`${API_BASE}/user/notifications/read`, { method: 'POST', headers: authHeaders() })
                    .then(() => document.getElementById('notif-badge').textContent = '0');
            }, 2000);
        }
    } catch (err) { console.error(err); }
}

// Submit Idea
if (document.getElementById('idea-form')) {
    document.getElementById('idea-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            title: document.getElementById('idea-title').value,
            category: document.getElementById('idea-category').value,
            description: document.getElementById('idea-desc').value
        };

        try {
            const data = await fetch(`${API_BASE}/ideas/`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(payload)
            }).then(handleResponse);

            showToast('Idea Securely Submitted & Processed!');

            // Show Analysis
            document.getElementById('similarity-result').classList.remove('hidden');
            document.getElementById('sim-pct').innerHTML = `(${data.similarity_percentage.toFixed(2)}% similarity match)`;
            document.getElementById('idea-timestamp').textContent = new Date(data.idea.timestamp).toLocaleString();

            const riskAlert = document.getElementById('risk-alert');
            const riskText = document.getElementById('risk-text');
            const riskIcon = document.getElementById('risk-icon');

            riskText.textContent = data.message;
            if (data.similarity_percentage > 70) {
                riskAlert.className = 'risk-alert risk-high';
                riskIcon.className = 'fa-solid fa-triangle-exclamation';
            } else {
                riskAlert.className = 'risk-alert risk-low';
                riskIcon.className = 'fa-solid fa-circle-check';
            }

            document.getElementById('idea-form').reset();
            loadProfile(); // refresh data
        } catch (err) { showToast(err.message); }
    });
}

// Collaboration Portal
async function loadCollaboration() {
    searchIdeas(); // Load all by default
}

async function searchIdeas() {
    const q = document.getElementById('search-q').value;
    const cat = document.getElementById('search-cat').value;

    let url = `${API_BASE}/collab/search?`;
    if (q) url += `q=${encodeURIComponent(q)}&`;
    if (cat) url += `category=${encodeURIComponent(cat)}`;

    try {
        const results = await fetch(url, { headers: authHeaders() }).then(handleResponse);
        const container = document.getElementById('search-results');

        container.innerHTML = results.length ? results.map(idea => `
            <div class="collab-card hover-active">
                <span class="badge badge-category"><i class="fa-solid fa-tag"></i> ${idea.category}</span>
                <h3 style="color: var(--accent-secondary); margin-bottom: 5px;">${idea.title}</h3>
                <p style="margin: 15px 0; font-size:0.95rem; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">
                    ${idea.description}
                </p>
                <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:15px; margin-top: auto;">
                    <button onclick="sendCollabRequest(${idea.id})" style="width: 100%; padding: 10px; font-size: 0.9rem;">
                        <i class="fa-solid fa-handshake"></i> Request Collaboration
                    </button>
                </div>
            </div>
        `).join('') : '<p style="grid-column: 1 / -1; opacity:0.7; text-align:center;">No ideas found matching your criteria.</p>';
    } catch (err) { showToast('Error fetching ideas.'); }
}

async function sendCollabRequest(idea_id) {
    try {
        await fetch(`${API_BASE}/collab/requests`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ idea_id })
        }).then(handleResponse);
        showToast("Collaboration request shipped securely!");
    } catch (err) { showToast(err.message); }
}

if (document.getElementById('recruit-form')) {
    document.getElementById('recruit-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const idea_id = parseInt(document.getElementById('recruit-idea-id').value);
        if (!idea_id) return showToast("Please select an idea");

        const payload = {
            idea_id,
            total_vacancies: parseInt(document.getElementById('recruit-vacancies').value),
            required_roles: document.getElementById('recruit-roles').value
        };

        try {
            await fetch(`${API_BASE}/collab/recruitment`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(payload)
            }).then(handleResponse);
            showToast("Recruitment post broadcasted on the network!");
            document.getElementById('recruit-form').reset();
        } catch (err) { showToast(err.message); }
    });
}
