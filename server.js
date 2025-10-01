const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Simple data storage
let users = [
    { id: '1', username: 'john_doe', name: 'John Doe', bio: 'Photographer & Travel Enthusiast', posts: [] },
    { id: '2', username: 'jane_smith', name: 'Jane Smith', bio: 'Artist & Designer', posts: [] }
];

let posts = [
    {
        id: '1', userId: '1', username: 'john_doe',
        imageUrl: 'https://picsum.photos/400/400?random=1',
        caption: 'Beautiful sunset at the beach today!  #sunset #beach',
        likes: 42, comments: [], timestamp: new Date().toISOString()
    },
    {
        id: '2', userId: '2', username: 'jane_smith',
        imageUrl: 'https://picsum.photos/400/400?random=2',
        caption: 'Working on my latest art piece  #art #creative',
        likes: 28, comments: [], timestamp: new Date(Date.now() - 3600000).toISOString()
    }
];

app.get('/api/posts', (req, res) => res.json(posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))));
app.get('/api/users', (req, res) => res.json(users));
app.get('/api/users/:userId', (req, res) => res.json(users.find(u => u.id === req.params.userId) || { error: 'User not found' }));
app.get('/api/users/:userId/posts', (req, res) => res.json(posts.filter(p => p.userId === req.params.userId)));

app.post('/api/posts', (req, res) => {
    const { userId, caption } = req.body;
    const user = users.find(u => u.id === userId);
    if (!user || !caption) return res.status(400).json({ error: 'Invalid data' });
    
    const newPost = {
        id: uuidv4(), userId, username: user.username,
        imageUrl: `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`,
        caption, likes: 0, comments: [], timestamp: new Date().toISOString()
    };
    
    posts.push(newPost);
    user.posts.push(newPost.id);
    res.json(newPost);
});

app.post('/api/posts/:postId/like', (req, res) => {
    const post = posts.find(p => p.id === req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.likes++;
    res.json({ likes: post.likes });
});

app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
