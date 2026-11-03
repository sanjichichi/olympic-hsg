(() => {
  'use strict';
  const CFG = window.APP_CONFIG || {};
  const API_URL = CFG.CHAT_API_URL || '';
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const toast = message => {
    const el = $('toast'); el.textContent = message; el.classList.add('show');
    clearTimeout(toast._timer); toast._timer = setTimeout(() => el.classList.remove('show'), 3200);
  };
  function loggedInUser() {
    const keys = ['maHS','MaHS','studentCode'];
    for (const key of keys) {
      const id = localStorage.getItem(key);
      if (id && id.trim()) return {id:id.trim(), name:localStorage.getItem('hoTenDangNhap') || localStorage.getItem('hoTen') || ''};
    }
    for (const key of ['studentInfo','user','currentUser','olympicUser','taiKhoanHS','hocSinh']) {
      try {
        const o = JSON.parse(localStorage.getItem(key) || '');
        const id = o?.maHS || o?.MaHS || o?.studentCode || o?.id || o?.userId || o?.studentId;
        const name = o?.hoTen || o?.name || o?.fullName || o?.studentName || '';
        if (id) return {id:String(id).trim(),name:String(name)};
      } catch (_) {}
    }
    return {id:'',name:''};
  }
  const USER = loggedInUser();
  let contacts = [], target = null, conversationId = localStorage.getItem('chatConversationId') || '';
  let messages = new Map(), directBusy = false, sendingDirect = false;
  let activeGroup = null, groupBusy = false, sendingGroup = false;
  let tasks = [], taskSync = false;
  let studyGroups = [], myStudyGroups = [], activeGroupPermissions = {};
  const localTaskKey = `banKemBanAI_tasks_v46_${USER.id || 'guest'}`;

  async function apiGet(action, params={}) {
    if (!API_URL) throw new Error('Chưa cấu hình CHAT_API_URL trong js/config.js');
    const url = new URL(API_URL);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, String(v ?? '')));
    const response = await fetch(url.toString(), {cache:'no-store'});
    if (!response.ok) throw new Error(`Máy chủ trả về HTTP ${response.status}`);
    const data = await response.json();
    if (!data.ok) throw new Error(data.error || 'Yêu cầu không thành công');
    return data;
  }
  async function apiPost(payload) {
    if (!API_URL) throw new Error('Chưa cấu hình CHAT_API_URL trong js/config.js');
    const response = await fetch(API_URL, {
      method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`Máy chủ trả về HTTP ${response.status}`);
    const data = await response.json();
    if (!data.ok) {
      const err = new Error(data.error || 'Yêu cầu không thành công');
      err.blocked = !!data.blocked; err.reason = data.reason || '';
      throw err;
    }
    return data;
  }
  function switchView(viewId) {
    document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.view === viewId));
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === viewId));
  }
  function userRecord(raw) {
    return {
      id:String(raw.maHS || raw.id || raw.userId || '').trim(),
      name:String(raw.hoTen || raw.name || raw.fullName || raw.studentName || raw.id || '').trim(),
      className:String(raw.lop || raw.className || raw.class || '').trim(),
      avatar:String(raw.avatar || '').trim()
    };
  }
  function initials(name) {
    const words=String(name||'HS').trim().split(/\s+/); return (words[words.length-1]||'H').slice(0,1).toUpperCase();
  }
  async function loadContacts() {
    if (!USER.id) {
      $('contactList').innerHTML='<div class="empty-state">Chưa nhận diện được mã học sinh. Hãy đăng nhập qua Olympic HSG Online trước.</div>';
      $('chatStatus').textContent='Chưa đăng nhập'; return;
    }
    try {
      const data=await apiGet('users');
      contacts=(Array.isArray(data.users)?data.users:[]).map(userRecord).filter(u=>u.id && u.id!==USER.id);
      renderContacts();
    } catch(e) {
      $('contactList').innerHTML=`<div class="empty-state">Không tải được danh sách: ${esc(e.message)}</div>`;
    }
  }
  function renderContacts() {
    const host=$('contactList'), query=String($('contactSearch').value||'').toLowerCase().trim();
    const all=[...contacts];
    if (target && target.id && !all.some(u=>u.id===target.id)) all.push(target);
    const filtered=all.filter(u=>`${u.id} ${u.name} ${u.className}`.toLowerCase().includes(query))
      .sort((a,b)=>a.name.localeCompare(b.name,'vi'));
    if (!filtered.length) {host.innerHTML='<div class="empty-state">Không tìm thấy bạn học. Hãy kiểm tra sheet USERS của backend chat.</div>';return;}
    host.innerHTML=filtered.map(u=>`<button class="contact ${target?.id===u.id?'selected':''}" data-contact="${esc(u.id)}" type="button">
      <span class="avatar">${esc(u.avatar||initials(u.name))}</span><span class="contact-text"><strong>${esc(u.name||u.id)}</strong><small>${esc(u.className?`Lớp ${u.className}`:u.id)}</small></span></button>`).join('');
    host.querySelectorAll('[data-contact]').forEach(button=>button.addEventListener('click',()=>{
      const chosen=filtered.find(u=>u.id===button.dataset.contact); if(chosen) selectContact(chosen);
    }));
  }
  function selectContact(user) {
    target=user; conversationId=''; messages.clear();
    localStorage.setItem('chatTargetMaHS',user.id); localStorage.setItem('chatTargetName',user.name||'');
    localStorage.setItem('chatTargetClass',user.className||''); localStorage.setItem('chatTargetAvatar',user.avatar||'');
    localStorage.removeItem('chatConversationId');
    $('chatName').textContent=user.name||user.id; $('chatStatus').textContent=`Mã học sinh: ${user.id}`;
    $('directMessages').innerHTML='<div class="empty-state">Đang mở cuộc trò chuyện…</div>';
    renderContacts(); loadDirectMessages();
  }
  function renderDirectMessages() {
    const list=[...messages.values()].sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
    const host=$('directMessages');
    if (!list.length) {host.innerHTML='<div class="empty-state">Chưa có tin nhắn. Hãy gửi lời chào hoặc câu hỏi học tập đầu tiên.</div>';return;}
    host.innerHTML=list.map(m=>`<div class="message ${String(m.senderId)===USER.id?'mine':''}">${esc(m.content)}
      <div class="message-meta">${esc(m.senderId===USER.id?'Bạn':(target?.name||m.senderId||'Bạn học'))} · ${esc(formatTime(m.createdAt))}</div></div>`).join('');
    host.scrollTop=host.scrollHeight;
  }
  function formatTime(value) {
    const d=new Date(value); return Number.isNaN(d.getTime())?'':d.toLocaleString('vi-VN',{dateStyle:'short',timeStyle:'short'});
  }
  
async function ensureConversation() {
  if (!USER.id) {
    throw new Error('Không nhận diện được tài khoản học sinh.');
  }

  if (!target?.id) {
    throw new Error('Hãy chọn một bạn học trước.');
  }

  if (String(target.id) === String(USER.id)) {
    throw new Error('Bạn không thể trò chuyện với chính mình.');
  }

  const result = await apiPost({
    action: 'getOrCreateConversation',
    userA: String(USER.id).trim(),
    userAName: USER.name || '',
    userAClass:
      localStorage.getItem('lop') ||
      localStorage.getItem('className') ||
      '',
    userB: String(target.id).trim(),
    userBName: target.name || '',
    userBClass: target.className || ''
  });

  if (!result?.ok || !result.conversationId) {
    throw new Error(
      result?.error || 'Không lấy được cuộc hội thoại từ máy chủ.'
    );
  }

  conversationId = String(result.conversationId).trim();

  localStorage.setItem('chatConversationId', conversationId);

  return conversationId;
}

  async function loadDirectMessages() {
    if(directBusy || !target?.id) return;
    directBusy=true;
    try {
      await ensureConversation();
      const data=await apiGet('messages',{conversationId});
      (data.messages||[]).forEach(m=>{if(m?.id)messages.set(String(m.id),m);});
      renderDirectMessages();
      $('chatStatus').textContent='Đang trò chuyện riêng';
    } catch(e) {
      $('directMessages').innerHTML=`<div class="empty-state">Không tải được hội thoại: ${esc(e.message)}</div>`;
      $('chatStatus').textContent='Chưa kết nối được';
    } finally {directBusy=false;}
  }
  async function sendDirect(event) {
    event.preventDefault();
    if(sendingDirect) return;
    const input=$('directInput'), content=input.value.trim();
    if(!content) return;
    if(content.length>(CFG.MAX_MESSAGE_LENGTH||1000)){toast('Tin nhắn quá dài.');return;}
    sendingDirect=true;
    const button=$('directComposer').querySelector('button');button.disabled=true;
    try {
      await ensureConversation();
      const data=await apiPost({action:'send',userId:USER.id,conversationId,content});
      if(data.message?.id) messages.set(String(data.message.id),data.message);
      input.value='';renderDirectMessages();await loadDirectMessages();
    } catch(e) {toast(e.blocked?`Tin nhắn bị chặn: ${e.reason||e.message}`:e.message);}
    finally {sendingDirect=false;button.disabled=false;input.focus();}
  }

  function groupTypeLabel(type) { return type === 'official' ? 'Nhóm chính thức' : 'Nhóm tự học'; }
  function isMyGroup(groupId) { return myStudyGroups.some(g => String(g.id) === String(groupId)); }
  function renderStudyGroups() {
    const box=$('studyGroupsList');
    if(!studyGroups.length) { box.innerHTML='<div class="empty-state">Chưa tìm thấy nhóm phù hợp. Bạn có thể tạo một nhóm ôn tập mới.</div>'; return; }
    box.innerHTML=studyGroups.map(g=>{
      const member=isMyGroup(g.id), open=String(g.visibility||'private')==='open';
      const kind=groupTypeLabel(g.type);
      const action=member
        ? `<button class="button button-primary" data-open-study-group="${esc(g.id)}" type="button">Mở phòng nhóm</button>`
        : open ? `<button class="button button-primary" data-request-study-group="${esc(g.id)}" type="button">Xin tham gia</button>`
        : '<span class="small-note">Nhóm riêng tư · cần lời mời</span>';
      return `<article class="subject-card"><div class="subject-icon">${g.type==='official'?'🏫':'👥'}</div><h3>${esc(g.name)}</h3><p><strong>${esc(g.subject||'Chưa phân môn')}</strong>${g.grade?` · Khối ${esc(g.grade)}`:''}</p><p>${esc(g.description||'Chưa có mô tả.')}</p><p class="small-note">${esc(kind)} · ${open?'Có thể xin tham gia':'Riêng tư'}${g.ownerName?` · Trưởng nhóm: ${esc(g.ownerName)}`:''}</p><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">${action}</div></article>`;
    }).join('');
  }
  async function loadStudyGroups() {
    if(!USER.id) { $('studyGroupsStatus').textContent='Bạn cần đăng nhập để xem nhóm ôn tập.'; $('studyGroupsList').innerHTML='<div class="empty-state">Hãy đăng nhập qua Olympic HSG Online trước.</div>'; return; }
    $('studyGroupsStatus').textContent='Đang tải danh sách nhóm…';
    try {
      const q=$('studyGroupSearch').value.trim(), subject=$('studyGroupSubject').value, type=$('studyGroupType').value;
      const [all,mine]=await Promise.all([
        apiGet('studyGroups',{userId:USER.id,q,subject,type}),
        apiGet('myStudyGroups',{userId:USER.id})
      ]);
      myStudyGroups=Array.isArray(mine.groups)?mine.groups:[];
      const map=new Map();
      [...(all.groups||[]),...myStudyGroups].forEach(g=>map.set(String(g.id),g));
      studyGroups=Array.from(map.values());
      renderStudyGroups();
      $('studyGroupsStatus').textContent=`Có ${studyGroups.length} nhóm phù hợp · ${myStudyGroups.length} nhóm của bạn`;
    } catch(e) {
      $('studyGroupsStatus').textContent=`Chưa tải được nhóm: ${e.message}`;
      $('studyGroupsList').innerHTML=`<div class="empty-state">${esc(e.message)}. Kiểm tra định tuyến backend và triển khai Web App.</div>`;
    }
  }
  async function createStudyGroup(event) {
    event.preventDefault();
    if(!USER.id){toast('Bạn cần đăng nhập trước khi tạo nhóm.');return;}
    const payload={action:'createStudyGroup',userId:USER.id,name:$('newStudyGroupName').value.trim(),subject:$('newStudyGroupSubject').value,type:$('newStudyGroupType').value,visibility:$('newStudyGroupVisibility').value,grade:$('newStudyGroupGrade').value,description:$('newStudyGroupDescription').value.trim()};
    try {
      const data=await apiPost(payload);
      toast(data.message||'Đã tạo nhóm ôn tập.');
      $('createStudyGroupForm').reset();
      await loadStudyGroups();
      if(data.group) await openStudyGroup(data.group.id);
    } catch(e) { toast(e.message); }
  }
  async function requestStudyGroup(groupId) {
    if(!USER.id){toast('Bạn cần đăng nhập trước khi tham gia nhóm.');return;}
    try {
      const data=await apiPost({action:'requestJoinStudyGroup',userId:USER.id,groupId});
      toast(data.message||'Đã xử lý yêu cầu tham gia.');
      if(data.status==='active') await openStudyGroup(groupId);
      await loadStudyGroups();
    } catch(e) { toast(e.message); }
  }
  async function openStudyGroup(groupId) {
    if(!USER.id){toast('Bạn cần đăng nhập trước khi vào nhóm.');return;}
    try {
      const data=await apiGet('studyGroupDetail',{userId:USER.id,groupId});
      activeGroup=data.group; activeGroupPermissions=data.permissions||{};
      $('groupRoom').hidden=false; $('groupRoomTitle').textContent=activeGroup.name;
      $('groupRoomStatus').textContent=`${groupTypeLabel(activeGroup.type)} · ${activeGroup.subject||'Chưa phân môn'}`;
      $('groupComposer').hidden=!(activeGroupPermissions.canSendMessage);
      $('leaveStudyGroup').hidden=!!activeGroupPermissions.isOwner || !activeGroupPermissions.isMember;
      switchView('groupsView');
      await loadGroupMessages();
      if(activeGroupPermissions.canManageMembers) await loadStudyGroupRequests();
      else $('studyGroupRequestsPanel').hidden=true;
      $('groupRoom').scrollIntoView({behavior:'smooth',block:'nearest'});
    } catch(e) { toast(`Không mở được nhóm: ${e.message}`); }
  }
  async function loadStudyGroupRequests() {
    if(!activeGroup||!activeGroupPermissions.canManageMembers)return;
    try {
      const data=await apiGet('studyGroupRequests',{userId:USER.id,groupId:activeGroup.id,status:'pending'});
      const list=data.requests||[];
      $('studyGroupRequestsPanel').hidden=false;
      $('studyGroupRequestsList').innerHTML=list.map(r=>`<div style="display:flex;gap:8px;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb"><span>${esc(r.userName||r.userId)} <small>· ${esc(r.userId)}</small></span><span style="display:flex;gap:6px"><button class="button button-primary" data-review-request="${esc(r.requestId)}" data-decision="approved" type="button">Duyệt</button><button class="button button-quiet" data-review-request="${esc(r.requestId)}" data-decision="rejected" type="button">Từ chối</button></span></div>`).join('')||'<p class="small-note">Không có yêu cầu đang chờ.</p>';
    } catch(e) { $('studyGroupRequestsPanel').hidden=false; $('studyGroupRequestsList').textContent=`Không tải được yêu cầu: ${e.message}`; }
  }
  async function reviewStudyGroupRequest(requestId, decision) {
    try { const data=await apiPost({action:'reviewStudyGroupRequest',userId:USER.id,requestId,decision}); toast(data.message||'Đã xử lý yêu cầu.'); await loadStudyGroupRequests(); await loadStudyGroups(); }
    catch(e) { toast(e.message); }
  }
  async function leaveStudyGroup() {
    if(!activeGroup||!confirm(`Bạn muốn rời nhóm “${activeGroup.name}” chứ?`))return;
    try { const data=await apiPost({action:'leaveStudyGroup',userId:USER.id,groupId:activeGroup.id}); toast(data.message||'Đã rời nhóm.'); activeGroup=null; $('groupRoom').hidden=true; await loadStudyGroups(); }
    catch(e) { toast(e.message); }
  }

  // ===== V4.8.2 MEME PICKER + MESSAGE RENDERER =====
  let bkbMemeCache = [];

  function memeImageUrl(meme) {
    const raw = String(meme.viewUrl || '').trim();
    const fileId = String(meme.driveFileId || '').trim();

    // Google Drive "file/d/.../view" URLs are converted to thumbnail URLs.
    const driveMatch = raw.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
    const id = fileId || (driveMatch ? driveMatch[1] : '');
    if (id) return `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w400`;

    // Only accept real HTTP(S) URLs. Never treat title/tags/caption as a URL.
    if (/^https?:\/\/\S+$/i.test(raw)) return raw;
    return '';
  }

  function renderMemeVisual(meme, compact=false) {
    const imageUrl = memeImageUrl(meme);
    const sticker = String(meme.sticker || '').trim();
    const title = esc(meme.title || 'Meme');
    const caption = esc(meme.caption || '');

    if (imageUrl) {
      return `<img class="meme-image" src="${esc(imageUrl)}"
        alt="${esc(meme.altText || meme.title || 'Meme')}"
        loading="lazy" referrerpolicy="no-referrer"
        onerror="this.hidden=true;this.nextElementSibling && (this.nextElementSibling.hidden=false)">
        <span class="meme-sticker" hidden>${sticker ? esc(sticker) : '😊'}</span>`;
    }
    return `<span class="meme-sticker">${sticker ? esc(sticker) : '😊'}</span>`;
  }

  function legacyMemeData(content) {
    // Tin nhắn cũ có dạng: [MEME] Tên meme — tags
    const raw = String(content || '').replace(/^\s*\[MEME\]\s*/i, '');
    const title = raw.split(/\s+[—–-]\s+/)[0].trim();
    const found = bkbMemeCache.find(x =>
      String(x.title || '').trim().toLocaleLowerCase('vi') === title.toLocaleLowerCase('vi')
    );
    if (found) return found;

    // Dự phòng khi chưa tải thư viện meme.
    const t = title.toLocaleLowerCase('vi');
    let sticker = '😊';
    if (/kiểm tra/.test(t)) sticker = '😳';
    else if (/não|bài khó|đọc đề/.test(t)) sticker = '🤔';
    else if (/giải đúng|công thức/.test(t)) sticker = '😎';
    else if (/nộp bài|deadline|nhiệm vụ/.test(t)) sticker = '🏃‍♀️';
    else if (/bạn kèm|hiểu bài|giải thích/.test(t)) sticker = '🥳';
    else if (/học nhóm|cả nhóm|online|thống nhất/.test(t)) sticker = '🤝';
    else if (/điểm thưởng|thành tích|hoàn thành|chúc mừng/.test(t)) sticker = '🏆';
    else if (/cố gắng|không bỏ cuộc/.test(t)) sticker = '💪';
    else if (/nghỉ giải lao|tập trung/.test(t)) sticker = '⏱️';
    return {title, sticker, caption:title, viewUrl:'', driveFileId:''};
  }

  function renderGroupMessageContent(m) {
    const type = String(m.messageType || m.type || '').toLowerCase();
    const content = String(m.content || '');

    // Nhận diện payload JSON của meme mới, kể cả khi API thiếu messageType.
    if (type === 'meme' || content.trim().startsWith('{')) {
      try {
        const data = JSON.parse(content);
        if (data && (data.kind === 'sticker' || data.memeId || data.sticker)) {
          return `<div class="message-meme">${renderMemeVisual(data)}
            <div class="meme-caption">${esc(data.caption || data.title || '')}</div></div>`;
        }
      } catch (_) {}

      // Hỗ trợ tin nhắn cũ lưu dạng [MEME] tiêu đề — tags.
      if (type === 'meme' || /^\s*\[MEME\]/i.test(content)) {
        const legacy = legacyMemeData(content);
        return `<div class="message-meme">${renderMemeVisual(legacy)}
          <div class="meme-caption">${esc(legacy.caption || legacy.title || 'Meme')}</div></div>`;
      }
    }
    return esc(content).replace(/\n/g, '<br>');
  }

  async function loadMemeLibrary() {
    const host = $('memeList');
    if (!host) return;
    host.innerHTML = '<div class="empty-state">Đang tải thư viện meme…</div>';
    try {
      const data = await apiGet('bkb48Memes', {userId: USER.id});
      bkbMemeCache = Array.isArray(data.memes) ? data.memes : [];
      if (!bkbMemeCache.length) {
        host.innerHTML = '<div class="empty-state">Thư viện meme chưa có nội dung. Hãy kiểm tra sheet MEME_LIBRARY: dữ liệu và cột active = TRUE.</div>';
        return;
      }
      host.innerHTML = bkbMemeCache.map(m => `
        <button type="button" class="meme-card" data-meme-id="${esc(m.id)}">
          <span class="meme-visual">${renderMemeVisual(m, true)}</span>
          <span class="meme-title">${esc(m.title || 'Meme')}</span>
        </button>`).join('');
    } catch (e) {
      host.innerHTML = `<div class="empty-state">Không tải được thư viện meme: ${esc(e.message)}</div>`;
    }
  }

  async function sendSelectedMeme(memeId) {
    if (!activeGroup || !USER.id) {
      toast('Hãy mở một nhóm học trước khi gửi meme.');
      return;
    }
    try {
      const result = await apiPost({
        action: 'bkb48SendMeme',
        userId: USER.id,
        groupId: activeGroup.id,
        memeId: memeId
      });
      toast(result.message || 'Đã gửi meme.');
      await loadGroupMessages();
    } catch (e) {
      toast(`Chưa gửi được meme: ${e.message}`);
    }
  }

  function initMemePicker() {
    const toggle = $('toggleMemePicker');
    const close = $('closeMemePicker');
    const picker = $('memePicker');
    const list = $('memeList');
    if (!toggle || !picker || !list) return;

    toggle.addEventListener('click', async () => {
      picker.hidden = !picker.hidden;
      if (!picker.hidden) await loadMemeLibrary();
    });
    if (close) close.addEventListener('click', () => { picker.hidden = true; });
    list.addEventListener('click', async e => {
      const card = e.target.closest('[data-meme-id]');
      if (card) await sendSelectedMeme(card.dataset.memeId);
    });
  }

  async function loadGroupMessages() {
    if(!activeGroup||groupBusy||!USER.id)return;
    groupBusy=true;
    try {
      const data=await apiGet('studyGroupMessages',{groupId:activeGroup.id,userId:USER.id});
      const list=data.messages||[];
      $('groupMessages').innerHTML=list.map(m=>`<div class="message ${String(m.senderId)===USER.id?'mine':''}"><strong>${esc(m.senderName||m.senderId||'Học sinh')}</strong><br>${renderGroupMessageContent(m)}<div class="message-meta">${esc(formatTime(m.createdAt))}</div></div>`).join('')||'<div class="empty-state">Chưa có tin nhắn. Hãy đặt câu hỏi đầu tiên.</div>';
      $('groupMessages').scrollTop=$('groupMessages').scrollHeight;
      $('groupRoomStatus').textContent=`${activeGroup.name} · ${list.length} tin nhắn gần nhất`;
    } catch(e) { $('groupRoomStatus').textContent=`Chưa tải được tin nhắn: ${e.message}`; }
    finally {groupBusy=false;}
  }
  async function sendGroup(event) {
    event.preventDefault();
    if(sendingGroup||!activeGroup)return;
    const input=$('groupInput'),content=input.value.trim();if(!content)return;
    sendingGroup=true;const button=$('groupComposer').querySelector('button');button.disabled=true;
    try {
      await apiPost({action:'sendStudyGroupMessage',groupId:activeGroup.id,userId:USER.id,content});
      input.value='';await loadGroupMessages();
    } catch(e) {toast(e.blocked?`Tin nhắn bị chặn: ${e.reason||e.message}`:`Chưa gửi được tin nhắn nhóm: ${e.message}`);}
    finally {sendingGroup=false;button.disabled=false;input.focus();}
  }

  function saveLocalTasks(){localStorage.setItem(localTaskKey,JSON.stringify(tasks));}
  async function loadTasks() {
    taskSync=true;
    try {
      if(!USER.id) throw new Error('Chưa đăng nhập');
      const data=await apiGet('studentTasks',{userId:USER.id});
      tasks=Array.isArray(data.tasks)?data.tasks:[];
      $('taskSyncStatus').textContent='Đã tải nhiệm vụ từ máy chủ.';
      saveLocalTasks();
    } catch(e) {
      try {tasks=JSON.parse(localStorage.getItem(localTaskKey)||'[]');if(!Array.isArray(tasks))tasks=[];}catch(_){tasks=[];}
      $('taskSyncStatus').textContent='Đang dùng nhiệm vụ lưu trên thiết bị; đồng bộ máy chủ chưa sẵn sàng.';
    } finally {taskSync=false;renderTasks();}
  }
  async function persistTask(task) {
    if(!USER.id) throw new Error('Bạn cần đăng nhập để đồng bộ nhiệm vụ.');
    const data=await apiPost({action:'saveStudentTask',userId:USER.id,taskId:task.id,title:task.title,subject:task.subject,done:!!task.done});
    if(data.task) Object.assign(task,data.task);
    saveLocalTasks();
  }
  function renderTasks() {
    const host=$('taskList');
    if(!tasks.length)host.innerHTML='<div class="card"><p class="muted">Chưa có nhiệm vụ. Nhấn “Thêm nhiệm vụ” để đặt mục tiêu học tập.</p></div>';
    else host.innerHTML=tasks.map((t,i)=>`<div class="task-row">
      <input type="checkbox" data-task-done="${i}" ${t.done===true||String(t.done)==='true'?'checked':''} aria-label="Đánh dấu hoàn thành">
      <div class="task-body"><div class="task-title ${t.done===true||String(t.done)==='true'?'done':''}">${esc(t.title||'Nhiệm vụ')}</div><div class="task-subject">${esc(t.subject||'Tự học')}</div></div>
      <button class="delete-task" data-task-delete="${i}" type="button">Xóa</button></div>`).join('');
    const done=tasks.filter(t=>t.done===true||String(t.done)==='true').length;
    const pct=tasks.length?Math.round(done/tasks.length*100):0;
    $('statTotal').textContent=tasks.length;$('statDone').textContent=done;$('statPercent').textContent=`${pct}%`;
    $('progressText').textContent=`${pct}%`;$('progressFill').style.width=`${pct}%`;
    $('progressMessage').textContent=tasks.length?`Bạn đã hoàn thành ${done} trên ${tasks.length} nhiệm vụ.`:'Thêm nhiệm vụ để bắt đầu theo dõi.';
    host.querySelectorAll('[data-task-done]').forEach(el=>el.addEventListener('change',async()=>{
      const task=tasks[Number(el.dataset.taskDone)];if(!task)return;task.done=el.checked;renderTasks();saveLocalTasks();
      try {await persistTask(task);$('taskSyncStatus').textContent='Tiến độ đã đồng bộ.';}
      catch(e){toast(`Đã lưu cục bộ nhưng chưa đồng bộ máy chủ: ${e.message}`);}
    }));
    host.querySelectorAll('[data-task-delete]').forEach(el=>el.addEventListener('click',async()=>{
      const index=Number(el.dataset.taskDelete),task=tasks[index];if(!task)return;
      try {if(USER.id&&task.id&&!String(task.id).startsWith('local_'))await apiPost({action:'deleteStudentTask',userId:USER.id,taskId:task.id});}
      catch(e){toast(`Chưa xóa được trên máy chủ: ${e.message}`);return;}
      tasks.splice(index,1);saveLocalTasks();renderTasks();
    }));
  }
  async function addTask() {
    const title=prompt('Tên nhiệm vụ học tập:');if(!title||!title.trim())return;
    const subject=prompt('Môn học (Toán, Ngữ văn hoặc môn khác):','Toán')||'Tự học';
    const task={id:`local_${Date.now()}`,title:title.trim().slice(0,160),subject:subject.trim().slice(0,60),done:false,createdAt:new Date().toISOString()};
    try {await persistTask(task);$('taskSyncStatus').textContent='Nhiệm vụ đã lưu trên máy chủ.';}
    catch(e){saveLocalTasks();$('taskSyncStatus').textContent='Nhiệm vụ mới chỉ lưu trên thiết bị. '+e.message;}
    tasks.push(task);saveLocalTasks();renderTasks();
  }

  function init() {
    $('accountBadge').textContent=USER.id?`👤 ${USER.name||USER.id}`:'👤 Chưa đăng nhập';
    $('profileSummary').textContent=USER.id?`Mã học sinh: ${USER.id}${USER.name?` · ${USER.name}`:''}`:'Chưa nhận diện mã học sinh. Hãy đăng nhập qua Olympic HSG Online.';
    document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view)));
    $('contactSearch').addEventListener('input',renderContacts);
    $('directComposer').addEventListener('submit',sendDirect);
    $('groupComposer').addEventListener('submit',sendGroup);
    initMemePicker();
    $('createStudyGroupForm').addEventListener('submit',createStudyGroup);
    $('refreshStudyGroups').addEventListener('click',loadStudyGroups);
    $('searchStudyGroups').addEventListener('click',loadStudyGroups);
    $('studyGroupSearch').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();loadStudyGroups();}});
    $('leaveStudyGroup').addEventListener('click',leaveStudyGroup);
    $('studyGroupsList').addEventListener('click',e=>{const open=e.target.closest('[data-open-study-group]');const join=e.target.closest('[data-request-study-group]');if(open)openStudyGroup(open.dataset.openStudyGroup);else if(join)requestStudyGroup(join.dataset.requestStudyGroup);});
    $('studyGroupRequestsList').addEventListener('click',e=>{const b=e.target.closest('[data-review-request]');if(b)reviewStudyGroupRequest(b.dataset.reviewRequest,b.dataset.decision);});
    $('addTask').addEventListener('click',addTask);
    $('refreshChat').addEventListener('click',loadDirectMessages);
    $('refreshGroup').addEventListener('click',loadGroupMessages);
    loadStudyGroups();
    // Restore selected direct-chat target if it was previously selected in the old chat page.
    const oldId=(localStorage.getItem('chatTargetMaHS')||'').trim();
    if(oldId) {
      target={id:oldId,name:localStorage.getItem('chatTargetName')||oldId,className:localStorage.getItem('chatTargetClass')||'',avatar:localStorage.getItem('chatTargetAvatar')||''};
      $('chatName').textContent=target.name;
      $('chatStatus').textContent=`Mã học sinh: ${target.id}`;
    }
    loadContacts().then(()=>{renderContacts();if(target)loadDirectMessages();});
    loadTasks();
    setInterval(()=>{if(target)loadDirectMessages();},CFG.POLL_CHAT_MS||5000);
    setInterval(()=>{if(activeGroup)loadGroupMessages();},CFG.POLL_GROUP_MS||7000);
  }
  document.addEventListener('DOMContentLoaded',init);
})();

const dockToggle = document.getElementById('chatDockToggle');
const dockBody = document.getElementById('chatDockBody');
const dockClose = document.getElementById('chatDockClose');
const dockArrow = document.getElementById('chatDockArrow');
const unreadBadge = document.getElementById('chatUnreadBadge');

function setChatDockOpen(open) {
  dockBody.hidden = !open;
  dockToggle.setAttribute('aria-expanded', String(open));
  dockArrow.textContent = open ? '▼' : '▲';
}

dockToggle.addEventListener('click', () => {
  setChatDockOpen(dockBody.hidden);
});

dockClose.addEventListener('click', () => {
  setChatDockOpen(false);
});

// Gọi hàm này khi hệ thống phát hiện tin nhắn mới.
// Chưa tự phát hiện tin nhắn mới nếu chưa nối với API chat.
function setChatUnreadCount(count) {
  const total = Math.max(0, Number(count) || 0);
  unreadBadge.textContent = total > 99 ? '99+' : String(total);
  unreadBadge.hidden = total === 0;
}

document.getElementById('openFullChat')
  .addEventListener('click', () => {
    // Phần này cần nối với nút/khu vực chat hiện có.
    const chatSection = document.getElementById('chatSection');

    if (chatSection) {
      chatSection.hidden = false;
      chatSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      alert('Cần nối nút này với khung chat hiện có.');
    }
  });
