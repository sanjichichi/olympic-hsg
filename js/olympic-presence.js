/* =========================================================
   OLYMPIC HSG - PRESENCE / ONLINE STATUS
   Dùng chung cho các trang học sinh
   ========================================================= */

const OLYMPIC_PRESENCE = {

  // API Google Apps Script hiện tại
  API_URL:
    'https://script.google.com/macros/s/AKfycbyX38uFR21yqnv5otQz4USbeyJ4GqW1MNtA8VI7HOtN3d_lcd0h6nD5-IB0XMGgquPiXw/exec',

  // Gửi heartbeat mỗi 20 giây
  HEARTBEAT_INTERVAL: 20000,

  // Sau 60 giây không có heartbeat thì coi là offline
  ONLINE_TIMEOUT: 60000,

  timer: null,

  getUserId() {

    const directKeys = [
      'maHS',
      'MaHS',
      'studentCode',
      'userId'
    ];

    for (const key of directKeys) {

      const value = localStorage.getItem(key);

      if (value && String(value).trim()) {
        return String(value).trim();
      }
    }

    const objectKeys = [
      'studentInfo',
      'user',
      'currentUser',
      'olympicUser',
      'taiKhoanHS',
      'hocSinh'
    ];

    for (const key of objectKeys) {

      try {

        const raw = localStorage.getItem(key);

        if (!raw) continue;

        const obj = JSON.parse(raw);

        if (!obj) continue;

        const id =
          obj.maHS ||
          obj.MaHS ||
          obj.studentCode ||
          obj.id ||
          obj.userId;

        if (id) {
          return String(id).trim();
        }

      } catch (e) {}
    }

    return '';
  },


  // -------------------------------------------------------
  // Gửi heartbeat lên USERS
  // -------------------------------------------------------

  async sendHeartbeat() {

    const userId = this.getUserId();

    if (!userId) return false;

    try {

      const response = await fetch(this.API_URL, {

        method: 'POST',

        headers: {
          'Content-Type':
            'text/plain;charset=utf-8'
        },

        body: JSON.stringify({
          action: 'heartbeat',
          userId: userId
        })

      });

      const data = await response.json();

      if (data && data.ok) {

        // Lưu local để giao diện có thể dùng ngay
        localStorage.setItem(
          'olympicLastHeartbeat',
          String(Date.now())
        );

        return true;
      }

    } catch (error) {

      console.warn(
        '[OLYMPIC PRESENCE] Heartbeat lỗi:',
        error
      );
    }

    return false;
  },


  // -------------------------------------------------------
  // Bắt đầu heartbeat
  // -------------------------------------------------------

  start() {

    // Gửi ngay khi mở trang
    this.sendHeartbeat();

    // Nếu đã có timer thì không tạo thêm
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(() => {

      this.sendHeartbeat();

    }, this.HEARTBEAT_INTERVAL);
  },


  // -------------------------------------------------------
  // Dừng heartbeat
  // -------------------------------------------------------

  stop() {

    if (this.timer) {

      clearInterval(this.timer);

      this.timer = null;
    }
  },


  // -------------------------------------------------------
  // Kiểm tra một học sinh có thực sự online không
  // dựa trên lastSeen
  // -------------------------------------------------------

  isOnline(lastSeen) {

    if (!lastSeen) return false;

    const time =
      new Date(lastSeen).getTime();

    if (isNaN(time)) return false;

    return (
      Date.now() - time
      <= this.ONLINE_TIMEOUT
    );
  },


  // -------------------------------------------------------
  // Chuẩn hóa user lấy từ API
  // -------------------------------------------------------

  normalizeUser(user) {

    if (!user) return null;

    const lastSeen =
      user.lastSeen || '';

    const online =
      this.isOnline(lastSeen);

    return {

      id: String(
        user.id ||
        user.userId ||
        user.maHS ||
        ''
      ),

      name: String(
        user.name ||
        user.hoTen ||
        user.fullName ||
        user.id ||
        ''
      ),

      avatar:
        user.avatar || '👤',

      className:
        user.className ||
        user.lop ||
        user.lopHoc ||
        '',

      lastSeen: lastSeen,

      online: online,

      status:
        online
          ? 'online'
          : 'offline'
    };
  },


  // -------------------------------------------------------
  // Chuẩn hóa danh sách học sinh
  // -------------------------------------------------------

  normalizeUsers(users) {

    if (!Array.isArray(users)) {
      return [];
    }

    return users
      .map(user =>
        this.normalizeUser(user)
      )
      .filter(user =>
        user && user.id
      );
  }

};


// =========================================================
// TỰ ĐỘNG KHỞI ĐỘNG KHI TRANG HỌC SINH MỞ
// =========================================================

document.addEventListener(
  'DOMContentLoaded',
  () => {

    OLYMPIC_PRESENCE.start();

  }
);