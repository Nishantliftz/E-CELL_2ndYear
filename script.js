// Global variables
let allUsers = [];
let allPosts = [];

// DOM elements
const pages = { feed: document.getElementById('feed-page'), profile: document.getElementById('profile-page'), create: document.getElementById('create-page') };
const navLinks = document.querySelectorAll('.nav-link');
const postsContainer = document.getElementById('posts-container');
const profilePostsContainer = document.getElementById('profile-posts-container');
const userSelect = document.getElementById('user-select');
const createPostForm = document.getElementById('create-post-form');
const loading = document.getElementById('loading');
const message = document.getElementById('message');
const messageText = document.getElementById('message-text');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadInitialData();
});

// Event listeners
function setupEventListeners() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(link.getAttribute('data-page'));
        });
    });
    createPostForm.addEventListener('submit', handleCreatePost);
    document.getElementById('message-close').addEventListener('click', hideMessage);
}

// Show page
function showPage(pageName) {
    Object.values(pages).forEach(page => page.classList.remove('active'));
    pages[pageName].classList.add('active');
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('data-page') === pageName));
    
    if (pageName === 'feed') loadFeed();
    else if (pageName === 'profile') loadProfile();
}

// Load initial data
async function loadInitialData() {
    showLoading();
    try {
        const [usersRes, postsRes] = await Promise.all([fetch('/api/users'), fetch('/api/posts')]);
        allUsers = await usersRes.json();
        allPosts = await postsRes.json();
        populateUserSelect();
        loadFeed();
    } catch (error) {
        showMessage('Failed to load data', 'error');
    } finally {
        hideLoading();
    }
}

// Populate user dropdown
function populateUserSelect() {
    userSelect.innerHTML = '<option value="">Choose a user...</option>';
    allUsers.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name} (@${user.username})`;
        userSelect.appendChild(option);
    });
}

// Load and display feed
async function loadFeed() {
    showLoading();
    try {
        const response = await fetch('/api/posts');
        allPosts = await response.json();
        displayPosts(allPosts, postsContainer);
    } catch (error) {
        showMessage('Failed to load feed', 'error');
    } finally {
        hideLoading();
    }
}

// Display posts
function displayPosts(posts, container) {
    if (posts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #8e8e8e; padding: 40px;">No posts to display</p>';
        return;
    }
    
    container.innerHTML = '';
    posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post-card';
        postDiv.innerHTML = `
            <div class="post-header">
                <div class="post-avatar"><i class="fas fa-user"></i></div>
                <div class="post-user-info">
                    <h3>${post.username}</h3>
                    <p>${formatTime(post.timestamp)}</p>
                </div>
            </div>
            <img src="${post.imageUrl}" alt="Post" class="post-image" onerror="this.src='https://picsum.photos/400/400?random=' + Math.floor(Math.random() * 1000)">
            <div class="post-actions">
                <div class="post-actions-top">
                    <button class="action-btn like-btn" onclick="toggleLike('${post.id}')">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
                <div class="post-likes">${post.likes} ${post.likes === 1 ? 'like' : 'likes'}</div>
                <div class="post-caption"><strong>${post.username}</strong> ${post.caption}</div>
                <div class="post-timestamp">${formatTime(post.timestamp)}</div>
            </div>
        `;
        container.appendChild(postDiv);
    });
}

// Load profile
async function loadProfile() {
    showLoading();
    try {
        const userId = allUsers[0]?.id;
        if (!userId) throw new Error('No users');
        
        const [userRes, postsRes] = await Promise.all([
            fetch(`/api/users/${userId}`),
            fetch(`/api/users/${userId}/posts`)
        ]);
        
        const user = await userRes.json();
        const userPosts = await postsRes.json();
        
        document.getElementById('profile-name').textContent = user.name;
        document.getElementById('profile-username').textContent = `@${user.username}`;
        document.getElementById('profile-bio').textContent = user.bio || 'No bio';
        document.getElementById('post-count').textContent = userPosts.length;
        
        displayProfilePosts(userPosts);
    } catch (error) {
        showMessage('Failed to load profile', 'error');
    } finally {
        hideLoading();
    }
}

// Display profile posts
function displayProfilePosts(posts) {
    if (posts.length === 0) {
        profilePostsContainer.innerHTML = '<p style="text-align: center; color: #8e8e8e; padding: 40px;">No posts yet</p>';
        return;
    }
    
    profilePostsContainer.innerHTML = '';
    posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'profile-post-card';
        postDiv.innerHTML = `<img src="${post.imageUrl}" alt="Post" class="profile-post-image" onerror="this.src='https://picsum.photos/400/400?random=' + Math.floor(Math.random() * 1000)">`;
        postDiv.addEventListener('click', () => { showPage('feed'); });
        profilePostsContainer.appendChild(postDiv);
    });
}

// Create post
async function handleCreatePost(e) {
    e.preventDefault();
    const userId = userSelect.value;
    const caption = document.getElementById('post-caption').value;
    
    if (!userId || !caption.trim()) {
        showMessage('Please fill all fields', 'error');
        return;
    }
    
    showLoading();
    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, caption })
        });
        
        if (!response.ok) throw new Error('Failed to create post');
        
        createPostForm.reset();
        showMessage('Post created!', 'success');
        showPage('feed');
        setTimeout(loadFeed, 500);
    } catch (error) {
        showMessage('Failed to create post', 'error');
    } finally {
        hideLoading();
    }
}

// Toggle like
async function toggleLike(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
        const result = await response.json();
        
        const postElement = document.querySelector(`[onclick="toggleLike('${postId}')"]`).closest('.post-card');
        postElement.querySelector('.post-likes').textContent = `${result.likes} ${result.likes === 1 ? 'like' : 'likes'}`;
        
        const likeBtn = postElement.querySelector('.like-btn');
        likeBtn.classList.toggle('liked');
        likeBtn.querySelector('i').className = likeBtn.classList.contains('liked') ? 'fas fa-heart' : 'far fa-heart';
    } catch (error) {
        showMessage('Failed to like post', 'error');
    }
}

// Utility functions
function showLoading() { loading.classList.remove('hidden'); }
function hideLoading() { loading.classList.add('hidden'); }
function showMessage(text, type = 'success') {
    messageText.textContent = text;
    message.className = `message ${type}`;
    message.classList.remove('hidden');
    setTimeout(hideMessage, 3000);
}
function hideMessage() { message.classList.add('hidden'); }
function formatTime(timestamp) {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diff = Math.floor((now - postTime) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

// Global functions
window.toggleLike = toggleLike;