// داده‌های کاربران (کد و رمز عبور)
const users = [
    { code: "USER001", password: "pass001", name: "علی احمدی", color: "#4361ee" },
    { code: "USER002", password: "pass002", name: "مریم رضایی", color: "#3a0ca3" },
    { code: "USER003", password: "pass003", name: "رضا محمدی", color: "#4cc9f0" },
    { code: "USER004", password: "pass004", name: "فاطمه کریمی", color: "#7209b7" },
    { code: "USER005", password: "pass005", name: "محمد حسینی", color: "#f72585" },
    { code: "USER006", password: "pass006", name: "زهرا نجفی", color: "#4895ef" },
    { code: "USER007", password: "pass007", name: "حسین علیزاده", color: "#560bad" },
    { code: "USER008", password: "pass008", name: "نازنین موسوی", color: "#b5179e" },
    { code: "USER009", password: "pass009", name: "سجاد جعفری", color: "#480ca8" },
    { code: "USER010", password: "pass010", name: "لیلا قاسمی", color: "#3f37c9" }
];

// کاربر فعلی
let currentUser = null;

// مخاطب فعلی برای چت (پیش‌فرض گروه اصلی)
let currentChat = {
    type: "group",
    id: "group",
    name: "گروه اصلی",
    avatarText: "G",
    color: "#f72585"
};

// تاریخچه پیام‌ها (در localStorage ذخیره می‌شود)
let messages = {};

// بارگذاری پیام‌ها از localStorage
function loadMessagesFromStorage() {
    const savedMessages = localStorage.getItem('messenger_messages');
    if (savedMessages) {
        messages = JSON.parse(savedMessages);
    } else {
        // ایجاد تاریخچه پیام‌های پیش‌فرض
        messages = {
            group: [
                { sender: "USER001", text: "سلام به همه! خوش آمدید.", time: "08:30", type: "text" },
                { sender: "USER002", text: "سلام علی، ممنون! حالتون چطوره؟", time: "08:32", type: "text" },
                { sender: "USER003", text: "سلام دوستان. پروژه جدید چطور پیش میره؟", time: "08:35", type: "text" },
                { sender: "USER001", text: "فایل گزارش هفتگی رو براتون فرستادم.", time: "08:40", type: "file", fileName: "report_week10.pdf" }
            ]
        };
        
        // ایجاد تاریخچه چت برای هر کاربر
        users.forEach(user => {
            messages[user.code] = [
                { 
                    sender: user.code, 
                    text: `سلام! من ${user.name} هستم. خوشحالم که می‌تونیم با هم در ارتباط باشیم.`, 
                    time: "08:00", 
                    type: "text" 
                }
            ];
        });
        
        saveMessagesToStorage();
    }
}

// ذخیره پیام‌ها در localStorage
function saveMessagesToStorage() {
    localStorage.setItem('messenger_messages', JSON.stringify(messages));
}

// DOM Elements
const loginContainer = document.getElementById('login-container');
const messengerContainer = document.getElementById('messenger-container');
const loginForm = document.getElementById('login-form');
const userCodeInput = document.getElementById('user-code');
const passwordInput = document.getElementById('password');
const currentUserAvatar = document.getElementById('current-user-avatar');
const currentUserName = document.getElementById('current-user-name');
const currentUserCode = document.getElementById('current-user-code');
const contactsList = document.getElementById('contacts-list');
const chatMessages = document.getElementById('chat-messages');
const chatContactName = document.getElementById('chat-contact-name');
const chatContactAvatar = document.getElementById('chat-contact-avatar');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const fileInput = document.getElementById('file-input');
const logoutBtn = document.getElementById('logout-btn');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notification-text');
const usersGrid = document.getElementById('users-grid');

// نمایش کدهای کاربران در صفحه ورود
function displayUserCodes() {
    usersGrid.innerHTML = '';
    users.forEach(user => {
        const userCodeElement = document.createElement('div');
        userCodeElement.className = 'user-code';
        userCodeElement.textContent = `${user.code} - رمز: ${user.password}`;
        usersGrid.appendChild(userCodeElement);
    });
}

// نمایش نوتیفیکیشن
function showNotification(message, isError = false) {
    notificationText.textContent = message;
    notification.classList.remove('error');
    
    if (isError) {
        notification.classList.add('error');
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ورود کاربر
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userCode = userCodeInput.value.trim().toUpperCase();
    const password = passwordInput.value.trim();
    
    // بررسی اعتبار کاربر
    const user = users.find(u => u.code === userCode && u.password === password);
    
    if (user) {
        currentUser = user;
        showNotification(`خوش آمدید ${user.name}`, false);
        
        // به‌روزرسانی اطلاعات کاربر فعلی
        currentUserAvatar.textContent = user.name.charAt(0);
        currentUserAvatar.style.backgroundColor = user.color;
        currentUserName.textContent = user.name;
        currentUserCode.textContent = `کد: ${user.code}`;
        
        // تغییر به صفحه پیام‌رسان
        loginContainer.style.display = 'none';
        messengerContainer.style.display = 'flex';
        
        // بارگذاری مخاطبین و پیام‌ها
        loadContacts();
        loadMessages();
    } else {
        showNotification('کد کاربری یا رمز عبور اشتباه است', true);
    }
});

// خروج کاربر
logoutBtn.addEventListener('click', function() {
    currentUser = null;
    messengerContainer.style.display = 'none';
    loginContainer.style.display = 'flex';
    userCodeInput.value = '';
    passwordInput.value = '';
});

// بارگذاری لیست مخاطبین
function loadContacts() {
    contactsList.innerHTML = '';
    
    // افزودن گروه به ابتدای لیست
    const groupContact = document.createElement('div');
    groupContact.className = 'contact-item active group-contact';
    groupContact.dataset.contactId = 'group';
    groupContact.dataset.type = 'group';
    
    groupContact.innerHTML = `
        <div class="contact-avatar" style="background-color: #f72585">G</div>
        <div class="contact-info">
            <h4>گروه اصلی</h4>
            <p>همه کاربران (۱۰ نفر)</p>
        </div>
    `;
    
    groupContact.addEventListener('click', function() {
        setActiveContact('group', 'group', 'گروه اصلی', 'G', '#f72585');
    });
    
    contactsList.appendChild(groupContact);
    
    // افزودن سایر کاربران
    users.forEach(user => {
        if (user.code !== currentUser.code) {
            const contactItem = document.createElement('div');
            contactItem.className = 'contact-item';
            contactItem.dataset.contactId = user.code;
            contactItem.dataset.type = 'user';
            
            contactItem.innerHTML = `
                <div class="contact-avatar" style="background-color: ${user.color}">${user.name.charAt(0)}</div>
                <div class="contact-info">
                    <h4>${user.name}</h4>
                    <p>کد: ${user.code}</p>
                </div>
            `;
            
            contactItem.addEventListener('click', function() {
                setActiveContact(user.code, 'user', user.name, user.name.charAt(0), user.color);
            });
            
            contactsList.appendChild(contactItem);
        }
    });
}

// تنظیم مخاطب فعال برای چت
function setActiveContact(contactId, type, name, avatarText, color) {
    // حذف حالت فعال از همه مخاطبین
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // افزودن حالت فعال به مخاطب انتخاب شده
    const activeContact = document.querySelector(`[data-contact-id="${contactId}"]`);
    if (activeContact) {
        activeContact.classList.add('active');
    }
    
    // به‌روزرسانی اطلاعات چت
    currentChat = {
        type: type,
        id: contactId,
        name: name,
        avatarText: avatarText,
        color: color
    };
    
    chatContactName.textContent = name;
    chatContactAvatar.textContent = avatarText;
    chatContactAvatar.style.backgroundColor = color;
    
    // بارگذاری پیام‌های مربوطه
    loadMessages();
}

// بارگذاری پیام‌ها
function loadMessages() {
    chatMessages.innerHTML = '';
    
    const chatId = currentChat.id;
    const messageList = messages[chatId] || [];
    
    messageList.forEach(message => {
        const isSentByMe = message.sender === currentUser.code;
        const senderUser = users.find(u => u.code === message.sender);
        const senderName = senderUser ? senderUser.name : message.sender;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isSentByMe ? 'sent' : 'received'}`;
        
        if (message.type === 'text') {
            messageElement.innerHTML = `
                <div>${message.text}</div>
                <div class="message-time">
                    ${senderName} - ${message.time}
                </div>
            `;
        } else if (message.type === 'file') {
            messageElement.innerHTML = `
                <div class="file-message">
                    <i class="fas fa-file"></i>
                    <div>
                        <div>فایل: ${message.fileName}</div>
                        <div class="message-time">
                            ${senderName} - ${message.time}
                        </div>
                    </div>
                </div>
            `;
        }
        
        chatMessages.appendChild(messageElement);
    });
    
    // اسکرول به پایین
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ارسال پیام
function sendMessage() {
    const messageText = messageInput.value.trim();
    
    if (messageText === '') return;
    
    // ایجاد پیام جدید
    const newMessage = {
        sender: currentUser.code,
        text: messageText,
        time: getCurrentTime(),
        type: 'text'
    };
    
    // افزودن پیام به تاریخچه
    const chatId = currentChat.id;
    if (!messages[chatId]) {
        messages[chatId] = [];
    }
    messages[chatId].push(newMessage);
    
    // ذخیره در localStorage
    saveMessagesToStorage();
    
    // پاک کردن فیلد ورودی
    messageInput.value = '';
    
    // بارگذاری مجدد پیام‌ها
    loadMessages();
    
    // نمایش نوتیفیکیشن
    showNotification('پیام شما ارسال شد');
}

// ارسال فایل
function sendFile(file) {
    // ایجاد پیام فایل
    const newMessage = {
        sender: currentUser.code,
        fileName: file.name,
        time: getCurrentTime(),
        type: 'file'
    };
    
    // افزودن پیام به تاریخچه
    const chatId = currentChat.id;
    if (!messages[chatId]) {
        messages[chatId] = [];
    }
    messages[chatId].push(newMessage);
    
    // ذخیره در localStorage
    saveMessagesToStorage();
    
    // بارگذاری مجدد پیام‌ها
    loadMessages();
    
    // نمایش نوتیفیکیشن
    showNotification(`فایل "${file.name}" ارسال شد`);
}

// گرفتن زمان فعلی
function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Event Listeners
sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

fileInput.addEventListener('change', function() {
    if (this.files.length > 0) {
        sendFile(this.files[0]);
        this.value = '';
    }
});

// بارگذاری اولیه پیام‌ها از localStorage
loadMessagesFromStorage();

// بارگذاری اولیه کدهای کاربران
displayUserCodes();

// پیام خوش‌آمدگویی در کنسول
console.log("پیام‌رسان ساده با ۱۰ کاربر آماده استفاده است.");
console.log("هر کاربر با کد و رمز عبور مخصوص خود می‌تواند وارد شود.");
console.log("نمونه کد کاربری: USER001، رمز عبور: pass001");