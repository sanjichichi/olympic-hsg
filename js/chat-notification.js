/* =========================================================
   OLYMPIC HSG ONLINE
   CHAT NOTIFICATION SYSTEM
   ========================================================= */

(function () {

  'use strict';

  // =======================================================
  // CẤU HÌNH
  // =======================================================

  const API_URL =
    'https://script.google.com/macros/s/AKfycbyX38uFR21yqnv5otQz4USbeyJ4GqW1MNtA8VI7HOtN3d_lcd0h6nD5-IB0XMGgquPiXw/exec';

  const POLL_TIME = 5000;

  // =======================================================
  // TÌM TÀI KHOẢN ĐANG ĐĂNG NHẬP
  // =======================================================

  function getLoggedInUser() {

    const keys = [
      'studentInfo',
      'user',
      'currentUser',
      'olympicUser'
    ];

    for (const key of keys) {

      try {

        const raw = localStorage.getItem(key);

        if (!raw) continue;

        const obj = JSON.parse(raw);

        const id =
          obj?.id ||
          obj?.userId ||
          obj?.maHS ||
          obj?.studentId ||
          obj?.username;

        const name =
          obj?.name ||
          obj?.fullName ||
          obj?.hoTen ||
          obj?.studentName ||
          '';

        if (id) {

          return {
            id:String(id),
            name:String(name)
          };

        }

      } catch (e) {}

    }

    return {
      id:'',
      name:''
    };
  }

  const USER = getLoggedInUser();

  if (!USER.id) {
    console.log('🔔 Chat notification: chưa xác định tài khoản.');
    return;
  }

  // =======================================================
  // LOCAL STORAGE
  // =======================================================

  const STORAGE_KEY =
    'olympic_chat_last_notification_' + USER.id;

  // =======================================================
  // TẠO GIAO DIỆN
  // =======================================================

  function createUI() {

    if (document.getElementById('olympicChatNotify')) {
      return;
    }

    const style = document.createElement('style');

    style.id = 'olympicChatNotifyStyle';

    style.textContent = `

      #olympicChatNotify {

        position:fixed;
        right:20px;
        bottom:20px;

        width:340px;
        max-width:calc(100vw - 30px);

        background:#ffffff;

        border-radius:18px;

        box-shadow:
          0 15px 45px rgba(0,0,0,.18);

        border:1px solid #e5e7eb;

        padding:14px;

        z-index:999999;

        display:none;

        cursor:pointer;

        animation:
          olympicChatIn .3s ease;

      }

      @keyframes olympicChatIn {

        from {
          opacity:0;
          transform:translateY(20px);
        }

        to {
          opacity:1;
          transform:translateY(0);
        }

      }

      #olympicChatNotify .notify-head {

        display:flex;
        align-items:center;
        gap:10px;

      }

      #olympicChatNotify .notify-avatar {

        width:42px;
        height:42px;

        border-radius:50%;

        background:linear-gradient(
          135deg,
          #6366f1,
          #8b5cf6
        );

        color:white;

        display:flex;
        align-items:center;
        justify-content:center;

        font-weight:700;
        font-size:18px;

        flex:none;

      }

      #olympicChatNotify .notify-name {

        font-weight:700;
        color:#111827;

      }

      #olympicChatNotify .notify-title {

        font-size:12px;
        color:#6366f1;
        margin-bottom:2px;

      }

      #olympicChatNotify .notify-content {

        margin-top:10px;

        color:#374151;

        font-size:14px;

        line-height:1.45;

        overflow:hidden;

        display:-webkit-box;
        -webkit-line-clamp:2;
        -webkit-box-orient:vertical;

      }

      #olympicChatNotify .notify-footer {

        margin-top:10px;

        font-size:12px;

        color:#9ca3af;

        display:flex;
        justify-content:space-between;

      }

      #olympicChatBadge {

        position:fixed;

        right:20px;
        bottom:20px;

        width:58px;
        height:58px;

        border-radius:50%;

        background:#6366f1;

        color:white;

        display:none;

        align-items:center;
        justify-content:center;

        font-size:25px;

        box-shadow:
          0 10px 30px rgba(99,102,241,.4);

        z-index:999998;

        cursor:pointer;

      }

      #olympicChatBadge span {

        position:absolute;

        top:-4px;
        right:-4px;

        min-width:22px;
        height:22px;

        border-radius:50%;

        background:#ef4444;

        color:#fff;

        display:flex;

        align-items:center;
        justify-content:center;

        font-size:11px;

        font-weight:700;

        padding:0 5px;

      }

      @media(max-width:600px) {

        #olympicChatNotify {

          right:10px;
          bottom:10px;

          width:calc(100vw - 20px);

        }

        #olympicChatBadge {

          right:15px;
          bottom:15px;

        }

      }

    `;

    document.head.appendChild(style);


    const box = document.createElement('div');

    box.id = 'olympicChatNotify';

    box.innerHTML = `

      <div class="notify-head">

        <div class="notify-avatar" id="olympicNotifyAvatar">
          💬
        </div>

        <div>

          <div class="notify-title">
            Tin nhắn mới
          </div>

          <div class="notify-name" id="olympicNotifyName">
            Bạn học
          </div>

        </div>

      </div>

      <div
        class="notify-content"
        id="olympicNotifyContent">
      </div>

      <div class="notify-footer">

        <span>Olympic HSG Online</span>

        <span>
          Nhấn để trả lời →
        </span>

      </div>

    `;

    document.body.appendChild(box);


    const badge = document.createElement('div');

    badge.id = 'olympicChatBadge';

    badge.innerHTML = `
      💬
      <span id="olympicChatBadgeCount">0</span>
    `;

    document.body.appendChild(badge);


    box.onclick = openChat;

    badge.onclick = openLatestChat;

  }


  // =======================================================
  // HÀM CHUYỂN SANG CHỮ CÁI ĐẠI DIỆN
  // =======================================================

  function avatarLetter(name) {

    const arr =
      String(name || 'HS')
        .trim()
        .split(/\s+/);

    return (
      arr[arr.length - 1] ||
      'H'
    ).charAt(0).toUpperCase();

  }


  // =======================================================
  // BIẾN TRẠNG THÁI
  // =======================================================

  let latestMessage = null;

  let unreadCount = 0;

  let notifyTimer = null;


  // =======================================================
  // ÂM THANH
  // =======================================================

  function playSound() {

    try {

      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContext) return;

      const ctx = new AudioContext();

      const oscillator =
        ctx.createOscillator();

      const gain =
        ctx.createGain();

      oscillator.type = 'sine';

      oscillator.frequency.setValueAtTime(
        880,
        ctx.currentTime
      );

      oscillator.frequency.exponentialRampToValueAtTime(
        1200,
        ctx.currentTime + 0.12
      );

      gain.gain.setValueAtTime(
        0.001,
        ctx.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.18,
        ctx.currentTime + 0.02
      );

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + 0.25
      );

      oscillator.connect(gain);

      gain.connect(ctx.destination);

      oscillator.start();

      oscillator.stop(
        ctx.currentTime + 0.25
      );

    } catch (e) {

      console.log(
        'Không phát được âm thanh:',
        e
      );

    }

  }


  // =======================================================
  // THÔNG BÁO TRÌNH DUYỆT
  // =======================================================

  function browserNotification(message) {

    if (
      !('Notification' in window)
    ) {
      return;
    }

    if (
      Notification.permission !== 'granted'
    ) {
      return;
    }

    // Nếu người dùng đang nhìn đúng tab chat
    // thì không cần popup trình duyệt.
    if (!document.hidden) {
      return;
    }

    try {

      const notification =
        new Notification(
          '💬 Tin nhắn mới từ ' +
          message.senderName,
          {
            body:message.content,
            icon:''
          }
        );

      notification.onclick = function () {

        window.focus();

        openChatWithMessage(message);

        notification.close();

      };

    } catch (e) {}

  }


  // =======================================================
  // XIN QUYỀN THÔNG BÁO
  // =======================================================

  function requestNotificationPermission() {

    if (
      !('Notification' in window)
    ) {
      return;
    }

    if (
      Notification.permission === 'default'
    ) {

      Notification.requestPermission()
        .then(function () {

          console.log(
            '🔔 Notification permission:',
            Notification.permission
          );

        })
        .catch(function () {});

    }

  }


  // =======================================================
  // HIỆN THÔNG BÁO
  // =======================================================

  function showNotification(message) {

    latestMessage = message;

    unreadCount++;

    const box =
      document.getElementById(
        'olympicChatNotify'
      );

    const badge =
      document.getElementById(
        'olympicChatBadge'
      );

    const count =
      document.getElementById(
        'olympicChatBadgeCount'
      );

    document.getElementById(
      'olympicNotifyName'
    ).textContent =
      message.senderName ||
      message.senderId;

    document.getElementById(
      'olympicNotifyContent'
    ).textContent =
      message.content;

    document.getElementById(
      'olympicNotifyAvatar'
    ).textContent =
      avatarLetter(message.senderName);

    box.style.display = 'block';

    badge.style.display = 'flex';

    count.textContent =
      unreadCount > 99
        ? '99+'
        : unreadCount;

    playSound();

    browserNotification(message);

    clearTimeout(notifyTimer);

    notifyTimer =
      setTimeout(function () {

        box.style.display = 'none';

      }, 8000);

  }


  // =======================================================
  // MỞ CHAT
  // =======================================================

  function openChatWithMessage(message) {

    if (!message) return;

    localStorage.setItem(
      'chatTargetMaHS',
      String(message.senderId)
    );

    localStorage.setItem(
      'chatTargetName',
      String(message.senderName || '')
    );

    localStorage.setItem(
      'chatTargetClass',
      String(message.senderClass || '')
    );

    localStorage.setItem(
      'chatConversationId',
      String(message.conversationId)
    );

    window.location.href =
      'chat.html';

  }


  function openChat() {

    if (!latestMessage) return;

    openChatWithMessage(
      latestMessage
    );

  }


  function openLatestChat() {

    if (!latestMessage) return;

    openChatWithMessage(
      latestMessage
    );

  }


  // =======================================================
  // ĐÁNH DẤU ĐÃ BIẾT TIN MỚI
  // =======================================================

  function saveLastNotification(time) {

    if (!time) return;

    localStorage.setItem(
      STORAGE_KEY,
      time
    );

  }


  function getLastNotification() {

    return localStorage.getItem(
      STORAGE_KEY
    ) || '';

  }


  // =======================================================
  // KIỂM TRA TIN NHẮN MỚI
  // =======================================================

  async function checkNotifications() {

    try {

      let after =
        getLastNotification();

      const url =
        API_URL +
        '?action=notifications' +
        '&userId=' +
        encodeURIComponent(USER.id) +
        (after
          ? '&after=' +
            encodeURIComponent(after)
          : '');

      const response =
        await fetch(
          url,
          {
            cache:'no-store'
          }
        );

      const data =
        await response.json();

      if (!data.ok) {

        console.warn(
          'Chat notification:',
          data.error
        );

        return;

      }

      const messages =
        Array.isArray(data.messages)
          ? data.messages
          : [];

      // -----------------------------------------------
      // LẦN ĐẦU:
      // Không báo lại tin nhắn cũ.
      // Chỉ ghi nhận mốc mới nhất.
      // -----------------------------------------------

      if (!after) {

        if (messages.length) {

          saveLastNotification(
            messages[messages.length - 1]
              .createdAt
          );

        }

        return;
      }


      // -----------------------------------------------
      // CÓ TIN NHẮN MỚI
      // -----------------------------------------------

      for (const message of messages) {

        if (
          String(message.senderId) ===
          String(USER.id)
        ) {
          continue;
        }

        showNotification(
          message
        );

        saveLastNotification(
          message.createdAt
        );

      }

    } catch (error) {

      console.warn(
        '🔔 Không kiểm tra được thông báo chat:',
        error
      );

    }

  }


  // =======================================================
  // KHỞI ĐỘNG
  // =======================================================

  function start() {

    createUI();

    // Sau khi người dùng đã tương tác với trang,
    // xin quyền notification.
    document.addEventListener(
      'click',
      requestNotificationPermission,
      {once:true}
    );

    // Kiểm tra ngay
    checkNotifications();

    // Sau đó kiểm tra mỗi 5 giây
    setInterval(
      checkNotifications,
      POLL_TIME
    );

    console.log(
      '🔔 Olympic Chat Notification đã hoạt động:',
      USER.id
    );

  }


  // Đợi DOM
  if (
    document.readyState === 'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      start
    );

  } else {

    start();

  }

})();