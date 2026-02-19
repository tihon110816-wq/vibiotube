// База данных видео (пустая, будет заполняться пользователем)
let videos = [];
let currentVideoFile = null;
let currentVideoURL = null;
let currentUser = null;

// Загрузка из localStorage при старте
function loadVideos() {
    const saved = localStorage.getItem('userVideos');
    if (saved) {
        videos = JSON.parse(saved);
    }
}

// Сохранение в localStorage
function saveVideos() {
    localStorage.setItem('userVideos', JSON.stringify(videos));
}

// Загрузка пользователя
function loadUser() {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
        currentUser = JSON.parse(saved);
        updateUserUI();
    }
}

// Сохранение пользователя
function saveUser() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// Обновление UI пользователя
function updateUserUI() {
    const userBtn = document.getElementById('userBtn');
    if (currentUser) {
        userBtn.textContent = `👤 ${currentUser.channel}`;
    } else {
        userBtn.textContent = '👤 Войти';
    }
}

// Отображение видео на главной
function displayVideos(videosToShow = videos) {
    const grid = document.getElementById('videosGrid');
    grid.innerHTML = '';
    
    if (videosToShow.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📹</div>
                <h2>Видео пока нет</h2>
                <p>Загрузите свое первое видео!</p>
                <button class="upload-btn" onclick="openUploadModal()">📤 Загрузить видео</button>
            </div>
        `;
        return;
    }
    
    videosToShow.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.onclick = () => openVideo(video);
        
        card.innerHTML = `
            <div class="video-thumbnail">
                <span style="font-size: 64px;">${video.icon}</span>
                <div class="video-duration">${video.duration}</div>
            </div>
            <div class="video-details">
                <div class="channel-avatar">${video.icon}</div>
                <div class="video-meta">
                    <div class="video-title">${video.title}</div>
                    <div class="video-channel">${video.channel}</div>
                    <div class="video-stats">${video.views} просмотров • ${video.date}</div>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// Открытие видео
function openVideo(video) {
    document.getElementById('videosGrid').style.display = 'none';
    document.querySelector('.categories').style.display = 'none';
    document.getElementById('videoPlayer').style.display = 'block';
    
    // Заполняем информацию о видео
    document.getElementById('videoTitle').textContent = video.title;
    document.getElementById('videoViews').textContent = `${video.views} просмотров`;
    document.getElementById('videoDate').textContent = video.date;
    document.getElementById('channelName').textContent = video.channel;
    document.getElementById('channelSubs').textContent = `${video.subs} подписчиков`;
    document.getElementById('videoDescription').textContent = video.description;
    
    // Обновляем иконку в плеере
    const videoFrame = document.getElementById('videoFrame');
    
    // Если есть реальное видео, показываем его
    if (video.videoURL) {
        videoFrame.innerHTML = `
            <video controls style="width: 100%; height: 100%;">
                <source src="${video.videoURL}" type="video/mp4">
                Ваш браузер не поддерживает видео.
            </video>
        `;
    } else {
        videoFrame.innerHTML = `
            <div class="play-button">▶️</div>
            <div class="video-placeholder" style="font-size: 120px;">${video.icon}</div>
        `;
    }
    
    // Прокрутка наверх
    window.scrollTo(0, 0);
}

// Возврат на главную
function backToHome() {
    document.getElementById('videosGrid').style.display = 'grid';
    document.querySelector('.categories').style.display = 'flex';
    document.getElementById('videoPlayer').style.display = 'none';
}

// Поиск видео
function searchVideos() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    
    if (!query) {
        displayVideos();
        return;
    }
    
    const filtered = videos.filter(video => 
        video.title.toLowerCase().includes(query) ||
        video.channel.toLowerCase().includes(query)
    );
    
    displayVideos(filtered);
    
    // Возвращаемся на главную если мы в плеере
    if (document.getElementById('videoPlayer').style.display !== 'none') {
        backToHome();
    }
}

// Enter для поиска
document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchVideos();
    }
});

// Управление плеером
let isPlaying = false;

function togglePlay() {
    const playBtn = document.querySelector('.video-controls button');
    isPlaying = !isPlaying;
    playBtn.textContent = isPlaying ? '⏸️' : '▶️';
    
    if (isPlaying) {
        document.querySelector('.play-button').style.display = 'none';
    } else {
        document.querySelector('.play-button').style.display = 'block';
    }
}

function toggleFullscreen() {
    const videoFrame = document.getElementById('videoFrame');
    
    if (!document.fullscreenElement) {
        videoFrame.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

// Клик по плееру для воспроизведения
document.addEventListener('DOMContentLoaded', () => {
    const videoFrame = document.getElementById('videoFrame');
    if (videoFrame) {
        videoFrame.addEventListener('click', togglePlay);
    }
});

// Категории
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        // Можно добавить фильтрацию по категориям
        displayVideos();
    });
});

// Боковое меню
document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});

// Инициализация
loadVideos();
loadUser();
displayVideos();

// Модальное окно загрузки
function openUploadModal() {
    if (!currentUser) {
        alert('Войдите в аккаунт, чтобы загружать видео!');
        openAuthModal();
        return;
    }
    document.getElementById('uploadModal').classList.add('active');
}

function closeUploadModal() {
    document.getElementById('uploadModal').classList.remove('active');
    // Не очищаем форму сразу, только при успешной загрузке
}

function resetUploadForm() {
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('videoForm').style.display = 'none';
    currentVideoFile = null;
    currentVideoURL = null;
    
    // Удаляем превью если есть
    const preview = document.querySelector('.video-preview');
    if (preview) preview.remove();
    
    // Очищаем поля
    document.getElementById('uploadVideoTitle').value = '';
    document.getElementById('uploadVideoDescription').value = '';
    document.getElementById('uploadVideoIcon').value = '';
    document.getElementById('videoFile').value = '';
}

// Выбор видео файла
function handleVideoSelect(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
        currentVideoFile = file;
        currentVideoURL = URL.createObjectURL(file);
        
        // Показываем форму
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('videoForm').style.display = 'block';
        
        // Удаляем старое превью если есть
        const oldPreview = document.querySelector('.video-preview');
        if (oldPreview) oldPreview.remove();
        
        // Добавляем превью видео
        const preview = document.createElement('div');
        preview.className = 'video-preview';
        preview.innerHTML = `<video src="${currentVideoURL}" controls></video>`;
        const firstFormGroup = document.querySelector('#videoForm .form-group');
        if (firstFormGroup) {
            firstFormGroup.parentNode.insertBefore(preview, firstFormGroup);
        }
    } else {
        alert('Пожалуйста, выберите видео файл!');
    }
}

// Drag & Drop
const uploadArea = document.getElementById('uploadArea');

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
        currentVideoFile = file;
        currentVideoURL = URL.createObjectURL(file);
        
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('videoForm').style.display = 'block';
        
        // Удаляем старое превью если есть
        const oldPreview = document.querySelector('.video-preview');
        if (oldPreview) oldPreview.remove();
        
        const preview = document.createElement('div');
        preview.className = 'video-preview';
        preview.innerHTML = `<video src="${currentVideoURL}" controls></video>`;
        const firstFormGroup = document.querySelector('#videoForm .form-group');
        if (firstFormGroup) {
            firstFormGroup.parentNode.insertBefore(preview, firstFormGroup);
        }
    } else {
        alert('Пожалуйста, выберите видео файл!');
    }
});

// Загрузка видео
function uploadVideo() {
    const title = document.getElementById('uploadVideoTitle').value.trim();
    const description = document.getElementById('uploadVideoDescription').value.trim();
    const icon = document.getElementById('uploadVideoIcon').value.trim() || '🎬';
    
    if (!title) {
        alert('Заполните название видео!');
        return;
    }
    
    if (!currentVideoFile) {
        alert('Выберите видео файл!');
        return;
    }
    
    // Получаем длительность видео
    const video = document.querySelector('.video-preview video');
    const duration = video ? formatDuration(video.duration) : '0:00';
    
    const newVideo = {
        id: Date.now(),
        title: title,
        channel: currentUser.channel,
        views: '0',
        date: 'Только что',
        duration: duration,
        icon: icon,
        subs: '0',
        description: description,
        videoURL: currentVideoURL,
        author: currentUser.email
    };
    
    videos.unshift(newVideo);
    saveVideos();
    displayVideos();
    closeUploadModal();
    resetUploadForm();
    
    alert('Видео успешно загружено!');
}

// Форматирование длительности
function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Авторизация
function openAuthModal() {
    if (currentUser) {
        // Показываем профиль
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('userProfile').style.display = 'block';
        
        document.getElementById('profileChannel').textContent = currentUser.channel;
        document.getElementById('profileEmail').textContent = currentUser.email;
        
        // Подсчет видео пользователя
        const userVideos = videos.filter(v => v.author === currentUser.email);
        document.getElementById('userVideosCount').textContent = userVideos.length;
        
        const totalViews = userVideos.reduce((sum, v) => sum + parseInt(v.views || 0), 0);
        document.getElementById('userViewsCount').textContent = totalViews;
    }
    
    document.getElementById('authModal').classList.add('active');
}

function closeAuthModal() {
    document.getElementById('authModal').classList.remove('active');
}

function switchToRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('authTitle').textContent = 'Регистрация';
}

function switchToLogin() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('authTitle').textContent = 'Вход';
}

function register() {
    const channel = document.getElementById('registerChannel').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    
    if (!channel || !email || !password) {
        alert('Заполните все поля!');
        return;
    }
    
    if (password.length < 6) {
        alert('Пароль должен быть минимум 6 символов!');
        return;
    }
    
    if (password !== passwordConfirm) {
        alert('Пароли не совпадают!');
        return;
    }
    
    // Проверяем, существует ли пользователь
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
        alert('Пользователь с таким email уже существует!');
        return;
    }
    
    // Создаем пользователя
    const newUser = {
        channel: channel,
        email: email,
        password: password,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Автоматический вход
    currentUser = { channel, email };
    saveUser();
    updateUserUI();
    
    alert('Регистрация успешна!');
    closeAuthModal();
    
    // Очищаем форму
    document.getElementById('registerChannel').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('registerPasswordConfirm').value = '';
}

function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        alert('Заполните все поля!');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        alert('Неверный email или пароль!');
        return;
    }
    
    currentUser = { channel: user.channel, email: user.email };
    saveUser();
    updateUserUI();
    
    alert('Вход выполнен!');
    closeAuthModal();
    
    // Очищаем форму
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUserUI();
    closeAuthModal();
    alert('Вы вышли из аккаунта');
}
