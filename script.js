// ==========================================
// ⚙️ 1. إعدادات الربط مع Supabase
// ==========================================
const SUPABASE_URL = 'https://omjfsqwtaoyinfteqhqh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tamZzcXd0YW95aW5mdGVxaHFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MDI2ODAsImV4cCI6MjA4NTM3ODY4MH0._2OGGOMW6YUctrCyk-neskR0F7fGadlW79BmPrkyJXM';

// إنشاء العميل
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// 📦 2. حقن المكونات الأساسية (الإحصائيات)
// ==========================================
function loadComponents() {
    const statsHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon" style="background: #e3f2fd; color: #1976d2;"><i class="fa-solid fa-tv"></i></div>
                <div class="stat-info"><h4 class="totalScreensVal">0</h4><span>إجمالي الشاشات</span></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: #e8f5e9; color: #2e7d32;"><i class="fa-solid fa-wifi"></i></div>
                <div class="stat-info"><h4 class="onlineScreensVal">0</h4><span>متصلة الآن (Online)</span></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: #ffebee; color: #c62828;"><i class="fa-solid fa-triangle-exclamation"></i></div>
                <div class="stat-info"><h4 class="offlineScreensVal">0</h4><span>مفصولة (Offline)</span></div>
            </div>
        </div>
    `;
    
    document.querySelectorAll('.load-stats-here').forEach(container => {
        container.innerHTML = statsHTML;
    });
}

// ==========================================
// 🌐 3. التنقل وإدارة واجهة المستخدم (محدثة لتكون آمنة)
// ==========================================
// ==========================================
// 🌐 3. التنقل وإدارة واجهة المستخدم (محدثة وآمنة للتصميم)
// ==========================================
// ==========================================
// 🌐 1. التنقل السريع بين النوافذ (محدثة لتحافظ على التصميم)
// ==========================================
function switchTab(tabName) {
    ['dashboard', 'screens', 'content', 'settings'].forEach(id => {
        const view = document.getElementById('view-' + id);
        const tab = document.getElementById('tab-' + id);
        
        if (view) {
            if (id === tabName) {
                // إزالة الإخفاء ليأخذ التنسيق الأصلي من ملف CSS الخاص بك
                view.style.display = ''; 
                // إذا كان لا يزال مخفياً، نعطيه flex ليملأ الشاشة ولا ينكمش
                if (window.getComputedStyle(view).display === 'none' || window.getComputedStyle(view).display === 'block') {
                    view.style.display = 'flex';
                    view.style.flexDirection = 'column';
                    view.style.width = '100%';
                }
            } else {
                view.style.display = 'none';
            }
        }
        
        if (tab) tab.classList.toggle('active', id === tabName);
    });

    const titles = {
        'dashboard': 'لوحة القيادة الرئيسية',
        'screens': 'إدارة الشاشات والأجهزة',
        'content': 'إدارة المحتوى والمكتبة',
        'settings': 'إعدادات النظام'
    };
    
    const pageTitle = document.getElementById('pageTitle');
    if(pageTitle) pageTitle.innerText = titles[tabName];
    
    // إغلاق القائمة الجانبية تلقائياً في الموبايل بعد اختيار أي قسم
    if (window.innerWidth <= 768) {
        document.querySelector('.sidebar')?.classList.remove('active');
        document.getElementById('sidebar-overlay')?.classList.remove('active');
    }
}

function toggleSidebar() {
    document.querySelector('.sidebar')?.classList.toggle('active');
    document.getElementById('sidebar-overlay')?.classList.toggle('active');
}

// ==========================================
// 🖥️ 4. إدارة الشاشات والبيانات
// ==========================================
async function fetchScreens() {
    try {
        const { data, error } = await sb.from('screens').select('*').order('last_ping', { ascending: false });
        if (error) throw error;
        const screens = data || [];
        renderScreens(screens);
        updateTargetSelect(screens);
    } catch (err) {
        console.error('Error fetching screens:', err);
    }
}

function renderScreens(screens) {
    const tbodyDashboard = document.getElementById('screensList');
    const tbodyDetailed = document.getElementById('detailedScreensList');
    
    if(tbodyDashboard) tbodyDashboard.innerHTML = '';
    if(tbodyDetailed) tbodyDetailed.innerHTML = '';

    let onlineCount = 0;
    let offlineCount = 0;
    const now = new Date();

    screens.forEach(s => {
        const displayName = s.screen_name ? s.screen_name : `شاشة (${s.device_id})`;
        const isLinked = s.status === 'linked';
        const statusClass = isLinked ? 'status-linked' : 'status-pending';
        const statusText = isLinked ? 'متصل ومفعل ✅' : 'بانتظار الموافقة ⏳';

        const isPlaying = s.play_status === 'playing';
        const playBadge = isPlaying
            ? `<span style="background: #2196F3; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; margin-top: 5px; display: inline-block;">📺 يعرض الآن</span>`
            : `<span style="background: #f44336; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; margin-top: 5px; display: inline-block;">⚠️ شاشة فارغة</span>`;

        const lastPing = new Date(s.last_ping);
        const diffMinutes = Math.abs(now - lastPing) / (1000 * 60);
        const isOnline = diffMinutes <= 5; 

        if (isOnline) onlineCount++; else offlineCount++;

        const connectionBadge = isOnline 
            ? `<span style="color: #2e7d32; font-weight:bold; font-size: 0.85em;"><i class="fa-solid fa-wifi"></i> متصل </span>` 
            : `<span style="color: #c62828; font-weight:bold; font-size: 0.85em;"><i class="fa-solid fa-plug-circle-xmark"></i> مفصول</span>`;

        const actionBtn = isLinked
            ? `<button style="background: #f91616;" class="btn-delete" onclick="updateScreenStatus('${s.device_id}', 'pending')">إيقاف</button>`
            : `<button style="background: #54dc5b;" class="btn-approve" onclick="updateScreenStatus('${s.device_id}', 'linked')" >تفعيل</button>`;
        
        const deleteBtn = `<button class="btn-delete" style="background:#ed0707; margin-right:5px;" onclick="deleteScreen('${s.device_id}')"><i class="fa-solid fa-trash"></i></button>`;
        const renameBtn = `<button class="btn btn-warning" style="padding: 5px 10px; font-size:12px; margin-right:5px;" onclick="renameScreen('${s.device_id}', '${s.screen_name || ''}')"><i class="fa-solid fa-pen"></i></button>`;

        if(tbodyDashboard) {
            tbodyDashboard.innerHTML += `
                <tr>
                    <td style="color: var(--primary); font-weight: bold; font-size: 14px;">${displayName}</td>
                    <td>${connectionBadge}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${isLinked ? playBadge : '-'}</td>
                </tr>
            `;
        }

        if(tbodyDetailed) {
            tbodyDetailed.innerHTML += `
                <tr>
                    <td>
                        <strong style="font-size: 15px;">${displayName}</strong><br>
                        <small style="color: #888;">ID: ${s.device_id}</small>
                    </td>
                    <td>${s.ip_address || '-'} <br> ${connectionBadge}</td>
                    <td>
                        <span class="status-badge ${statusClass}">${statusText}</span><br>
                        ${isLinked ? playBadge : ''}
                    </td>
                    <td dir="ltr" style="text-align: right;">${lastPing.toLocaleTimeString('ar-EG')}</td>
                    <td>${actionBtn} ${renameBtn} ${deleteBtn}</td>
                </tr>
            `;
        }
    });

    document.querySelectorAll('.totalScreensVal').forEach(el => el.innerText = screens.length);
    document.querySelectorAll('.onlineScreensVal').forEach(el => el.innerText = onlineCount);
    document.querySelectorAll('.offlineScreensVal').forEach(el => el.innerText = offlineCount);
}

function updateTargetSelect(screens) {
    const select = document.getElementById('targetScreen');
    if(!select) return;
    select.innerHTML = '<option value="all">عرض على كل الشاشات</option>';
    screens.forEach(s => {
        const displayName = s.screen_name ? s.screen_name : `شاشة (${s.device_id})`;
        select.innerHTML += `<option value="${s.device_id}">${displayName}</option>`;
    });
}

async function renameScreen(deviceId, currentName) {
    const newName = prompt('أدخل اسماً مميزاً لهذه الشاشة:', currentName !== 'null' ? currentName : '');
    if (newName === null) return; 
    try {
        const { error } = await sb.from('screens').update({ screen_name: newName }).eq('device_id', deviceId);
        if (error) throw error;
        fetchScreens(); 
    } catch (err) {
        alert('حدث خطأ أثناء تغيير اسم الشاشة.');
    }
}

async function updateScreenStatus(id, status) {
    await sb.from('screens').update({ status: status }).eq('device_id', id);
    fetchScreens();
}

async function deleteScreen(id) {
    if(confirm('تحذير: هل أنت متأكد من حذف هذه الشاشة من النظام نهائياً؟')) {
        await sb.from('screens').delete().eq('device_id', id);
        fetchScreens();
    }
}

// 🟢 إدارة إضافة شاشة جديدة
function openAddScreenModal() {
    const modal = document.getElementById('addScreenModal');
    if (modal) modal.style.display = 'flex';
    if (document.getElementById('newScreenId')) document.getElementById('newScreenId').value = '';
    if (document.getElementById('newScreenName')) document.getElementById('newScreenName').value = '';
}

function closeAddScreenModal() {
    const modal = document.getElementById('addScreenModal');
    if (modal) modal.style.display = 'none';
}

async function submitNewScreen() {
    const id = document.getElementById('newScreenId').value.trim();
    const name = document.getElementById('newScreenName').value.trim();

    if (!id || !name) {
        return alert('الرجاء إدخال ID الشاشة واسمها!');
    }

    try {
        const { error } = await sb.from('screens').upsert([
            { 
                device_id: id, 
                screen_name: name, 
                status: 'linked', 
                last_ping: new Date().toISOString() 
            }
        ]);

        if (error) throw error;

        closeAddScreenModal();
        alert('تم ربط الشاشة بنجاح! ستتحول الشاشة للعمل فوراً. 🚀');
        fetchScreens(); 

    } catch (err) {
        alert('حدث خطأ أثناء إضافة الشاشة: ' + err.message);
    }
}

// ==========================================
// 🚀 5. رفع المحتوى والوسائط
// ==========================================
async function uploadContent() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) return alert('الرجاء اختيار ملف!');

    const startsInput = document.getElementById('startsAt').value;
    const expiresInput = document.getElementById('expiresAt').value;

    if (!startsInput || !expiresInput) return alert('الرجاء تحديد تاريخ ووقت البدء والانتهاء!');
    if (new Date(startsInput) >= new Date(expiresInput)) return alert('خطأ: وقت الانتهاء يجب أن يكون بعد وقت البدء!');

    const statusLabel = document.getElementById('uploadStatus');
    const type = document.getElementById('fileType').value;
    
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    if(progressContainer) progressContainer.style.display = 'block';
    if(progressText) progressText.style.display = 'block';
    if(progressBar) progressBar.style.width = '0%';

    const fileExtension = file.name.split('.').pop() || (type === 'image' ? 'jpg' : 'mp4');
    const fileName = 'media_' + Date.now() + '.' + fileExtension;
    
    if (type === 'video') {
        statusLabel.innerText = 'جاري رفع الفيديو (نظام الحزم الآمن)... ⏳';
        const upload = new tus.Upload(file, {
            endpoint: `${SUPABASE_URL}/storage/v1/upload/resumable`,
            retryDelays: [0, 3000, 5000, 10000, 20000],
            headers: { authorization: `Bearer ${SUPABASE_KEY}`, 'x-upsert': 'true' },
            uploadDataDuringCreation: true,
            removeFingerprintOnSuccess: true,
            metadata: { bucketName: 'media', objectName: fileName, contentType: file.type, cacheControl: '3600' },
            chunkSize: 5 * 1024 * 1024,
            onError: function (error) { statusLabel.innerText = 'فشل الرفع: ' + error.message; },
            onProgress: function (bytesUploaded, bytesTotal) {
                const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(1);
                if(progressBar) progressBar.style.width = percentage + '%';
                if(progressText) progressText.innerText = percentage + '%';
            },
            onSuccess: async function () { await saveToDatabase(fileName, type, startsInput, expiresInput, statusLabel, fileInput); }
        });
        upload.findPreviousUploads().then(function (previousUploads) {
            if (previousUploads.length) upload.resumeFromPreviousUpload(previousUploads[0]);
            upload.start();
        });
    } else {
        statusLabel.innerText = 'جاري رفع الصورة... ⏳';
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = function(event) {
            if (event.lengthComputable) {
                const percentComplete = ((event.loaded / event.total) * 100).toFixed(1);
                if(progressBar) progressBar.style.width = percentComplete + '%';
                if(progressText) progressText.innerText = percentComplete + '%';
            }
        };
        xhr.onload = async function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                await saveToDatabase(fileName, type, startsInput, expiresInput, statusLabel, fileInput);
            } else {
                statusLabel.innerText = 'فشل الرفع المباشر للصورة.';
            }
        };
        xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/media/${fileName}`, true);
        xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_KEY}`);
        xhr.setRequestHeader('x-upsert', 'true');
        xhr.setRequestHeader('Content-Type', file.type || 'image/jpeg');
        xhr.send(file);
    }
}

async function saveToDatabase(fileName, type, startsInput, expiresInput, statusLabel, fileInput) {
    statusLabel.innerText = 'جاري الجدولة... 💾';
    const { data: { publicUrl } } = sb.storage.from('media').getPublicUrl(fileName);
    const duration = document.getElementById('duration').value;
    const target = document.getElementById('targetScreen').value;

    await sb.from('playlist').insert({
        url: publicUrl, type: type, duration: parseInt(duration),
        target_screen_id: target,
        starts_at: new Date(startsInput).toISOString(),
        expires_at: new Date(expiresInput).toISOString() 
    });

    statusLabel.innerText = 'تم الرفع والجدولة بنجاح! ✅';
    fileInput.value = '';
    if(document.getElementById('fileNameDisplay')) document.getElementById('fileNameDisplay').innerHTML = 'اسحب الملف هنا أو <span>اضغط للاستعراض</span>';
    
    setTimeout(() => {
        if(document.getElementById('progressContainer')) document.getElementById('progressContainer').style.display = 'none';
        if(document.getElementById('progressText')) document.getElementById('progressText').style.display = 'none';
    }, 3000);
    
    fetchPlaylist();
}

// 🟢 حماية حدث تغيير الملفات من إيقاف السكربت
document.getElementById('fileInput')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const placeholder = document.getElementById('previewPlaceholder');
    const imgPreview = document.getElementById('imagePreview');
    const vidPreview = document.getElementById('videoPreview');

    if(placeholder) placeholder.style.display = 'none';
    if(imgPreview) imgPreview.style.display = 'none';
    
    if(vidPreview) {
        vidPreview.style.display = 'none';
        vidPreview.pause();
    }

    const fileURL = URL.createObjectURL(file);
    if (file.type.startsWith('image/')) {
        if(imgPreview) {
            imgPreview.src = fileURL;
            imgPreview.style.display = 'block';
        }
        if(document.getElementById('fileType')) document.getElementById('fileType').value = 'image';
    } else if (file.type.startsWith('video/')) {
        if(vidPreview) {
            vidPreview.src = fileURL;
            vidPreview.style.display = 'block';
        }
        if(document.getElementById('fileType')) document.getElementById('fileType').value = 'video';
    }
});

// ==========================================
// 🎞️ 6. إدارة مكتبة المحتوى (المعرض)
// ==========================================
async function fetchPlaylist() {
    try {
        const { data } = await sb.from('playlist').select('*').order('created_at', { ascending: false });
        const gallery = document.getElementById('mediaGallery');
        if (!gallery) return;
        
        gallery.innerHTML = '';
        
        if(data) {
            const now = new Date();
            data.forEach(item => {
                const startDate = item.starts_at ? new Date(item.starts_at) : new Date(0);
                const expDate = item.expires_at ? new Date(item.expires_at) : null;
                
                let statusText = 'غير معروف';
                let statusColor = 'gray';
                let opacity = '1';

                if (expDate && now > expDate) {
                    statusText = 'منتهي 🔴';
                    statusColor = '#e53935';
                    opacity = '0.6';
                } else if (now < startDate) {
                    statusText = 'مجدول ⏳ (لم يبدأ)';
                    statusColor = '#ffa726';
                } else {
                    statusText = 'نشط 🟢 (يعرض الآن)';
                    statusColor = '#2e7d32';
                }
                
                const thumb = item.type === 'image' ? `<img src="${item.url}">` : `<video src="${item.url}"></video>`;
                const icon = item.type === 'image' ? '<i class="fa-solid fa-image"></i>' : '<i class="fa-solid fa-film"></i>';

                gallery.innerHTML += `
                    <div class="media-card" style="opacity: ${opacity};">
                        <div class="media-thumb">
                            <span class="media-type-icon">${icon}</span>
                            ${thumb}
                        </div>
                        <div class="media-info">
                            <strong style="font-size:12px;">يبدأ:</strong> <span style="font-size:11px;">${startDate.toLocaleString('ar-EG')}</span><br>
                            <strong style="font-size:12px;">ينتهي:</strong> <span style="font-size:11px;">${expDate ? expDate.toLocaleString('ar-EG') : 'غير محدد'}</span><br>
                            <div style="margin-top: 8px; font-weight: bold; color: ${statusColor};">${statusText}</div>
                        </div>
                        <div class="media-actions">
                            <button class="btn btn-warning" style="padding: 5px 10px; font-size:12px;" onclick="previewFromPlaylist('${item.url}', '${item.type}')"><i class="fa-solid fa-play"></i> عرض</button>
                            <button class="btn btn-danger" style="padding: 5px 10px; font-size:12px;" onclick="deleteItem('${item.id}')"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                `;
            });
        }
    } catch (err) {
        console.error("خطأ في جلب المحتوى:", err);
    }
}

async function deleteItem(id) {
    if (confirm('هل أنت متأكد من حذف هذا المحتوى؟')) {
        await sb.from('playlist').delete().eq('id', id);
        fetchPlaylist();
    }
}

function previewFromPlaylist(url, type) {
    const placeholder = document.getElementById('previewPlaceholder');
    const imgPreview = document.getElementById('imagePreview');
    const vidPreview = document.getElementById('videoPreview');

    if(placeholder) placeholder.style.display = 'none';
    if(imgPreview) imgPreview.style.display = 'none';
    if(vidPreview) {
        vidPreview.style.display = 'none';
        vidPreview.pause();
    }

    if (type === 'image') {
        if(imgPreview) {
            imgPreview.src = url;
            imgPreview.style.display = 'block';
        }
    } else {
        if(vidPreview) {
            vidPreview.src = url;
            vidPreview.style.display = 'block';
            vidPreview.play();
        }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 🎨 7. الإعدادات، المظهر، وشريط الأخبار
// ==========================================
async function fetchSettings() {
    try {
        const { data } = await sb.from('settings').select('*');
        if (data) {
            const showSetting = data.find(item => item.key === 'show_ticker');
            const isShowing = showSetting ? (showSetting.value === 'true') : true;
            if (document.getElementById('tickerToggle')) document.getElementById('tickerToggle').checked = isShowing;
            if (document.getElementById('settingsTickerToggle')) document.getElementById('settingsTickerToggle').checked = isShowing;

            const newsSetting = data.find(item => item.key === 'news_ticker');
            if (newsSetting) {
                if(document.getElementById('newsInput')) document.getElementById('newsInput').value = newsSetting.value;
                if(document.getElementById('settingsNewsInput')) document.getElementById('settingsNewsInput').value = newsSetting.value;
            }

            const fallbackSetting = data.find(item => item.key === 'fallback_image');
            if (fallbackSetting && fallbackSetting.value) {
                if(document.getElementById('currentFallbackPreview')){
                    document.getElementById('currentFallbackPreview').src = fallbackSetting.value;
                    document.getElementById('currentFallbackPreview').style.display = 'block';
                    if(document.getElementById('fallbackPlaceholder')) document.getElementById('fallbackPlaceholder').style.display = 'none';
                }
            }

            const sysName = data.find(item => item.key === 'system_name')?.value || 'SabaPost';
            const primaryColor = data.find(item => item.key === 'theme_primary')?.value || '#5c6bc0';
            const sidebarColor = data.find(item => item.key === 'theme_sidebar')?.value || '#2b2b44';
            const bgColor = data.find(item => item.key === 'theme_bg')?.value || '#f4f7fa';
            const cardBgColor = data.find(item => item.key === 'theme_card_bg')?.value || '#ffffff';
            const textColor = data.find(item => item.key === 'theme_text')?.value || '#333333';
            const showIdSetting = data.find(item => item.key === 'show_device_id');
            const isShowId = showIdSetting ? (showIdSetting.value === 'true') : true;

            document.querySelectorAll('.brand span').forEach(el => el.innerText = sysName);
            if(document.getElementById('systemName')) document.getElementById('systemName').value = sysName;
            if(document.getElementById('showDeviceIdToggle')) document.getElementById('showDeviceIdToggle').checked = isShowId;
            
            document.documentElement.style.setProperty('--primary', primaryColor);
            document.documentElement.style.setProperty('--sidebar-bg', sidebarColor);
            document.documentElement.style.setProperty('--bg-color', bgColor);
            document.documentElement.style.setProperty('--card-bg', cardBgColor);
            document.documentElement.style.setProperty('--text-color', textColor);

            // 🟢 إزالة طريقة eval الخطيرة واستبدالها بربط آمن ومباشر
            const themeColors = {
                'bgColor': bgColor,
                'cardBgColor': cardBgColor,
                'textColor': textColor,
                'primaryColor': primaryColor,
                'sidebarColor': sidebarColor
            };

            for (const [id, colorValue] of Object.entries(themeColors)) {
                if(document.getElementById(id)) {
                    document.getElementById(id).value = colorValue;
                    if(document.getElementById(id + 'Text')) document.getElementById(id + 'Text').value = colorValue;
                }
            }

            const tBg = data.find(item => item.key === 'ticker_bg')?.value || '#000000';
            const tColor = data.find(item => item.key === 'ticker_color')?.value || '#ffffff';
            const tSpeed = data.find(item => item.key === 'ticker_speed')?.value || '50';
            
            ['tickerBgColor', 'settingsTickerBgColor'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).value = tBg; });
            ['tickerTextColor', 'settingsTickerTextColor'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).value = tColor; });
            ['tickerSpeed', 'settingsTickerSpeed'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).value = tSpeed; });
        }
    } catch (err) {
        console.error("خطأ في جلب الإعدادات:", err);
    }
}

async function saveThemeSettings() {
    const sysName = document.getElementById('systemName').value;
    const primary = document.getElementById('primaryColor').value;
    const sidebar = document.getElementById('sidebarColor').value;
    const bg = document.getElementById('bgColor').value;
    const cardBg = document.getElementById('cardBgColor').value;
    const textC = document.getElementById('textColor').value;

    try {
        await sb.from('settings').upsert([
            { key: 'system_name', value: sysName },
            { key: 'theme_primary', value: primary },
            { key: 'theme_sidebar', value: sidebar },
            { key: 'theme_bg', value: bg },
            { key: 'theme_card_bg', value: cardBg },
            { key: 'theme_text', value: textC },
        ]);
        alert('تم حفظ وتطبيق المظهر بنجاح! 🎨');
        fetchSettings();
    } catch (err) {
        alert('حدث خطأ أثناء الحفظ');
    }
}

async function autoSaveSystemPreferences() {
    const showIdBtn = document.getElementById('showDeviceIdToggle');
    if(!showIdBtn) return;
    try {
        await sb.from('settings').upsert([ { key: 'show_device_id', value: showIdBtn.checked.toString() } ]);
    } catch (err) { console.error('حدث خطأ في الاتصال.'); }
}

async function toggleTickerVisibility(source) {
    const isVisible = source === 'dashboard' 
        ? document.getElementById('tickerToggle').checked 
        : document.getElementById('settingsTickerToggle').checked;
    try {
        await sb.from('settings').upsert({ key: 'show_ticker', value: isVisible.toString() });
        if(document.getElementById('tickerToggle')) document.getElementById('tickerToggle').checked = isVisible;
        if(document.getElementById('settingsTickerToggle')) document.getElementById('settingsTickerToggle').checked = isVisible;
    } catch (err) { console.error(err); }
}

async function updateAdvancedTicker() {
    const text = document.getElementById('newsInput')?.value || '';
    const bgColor = document.getElementById('tickerBgColor')?.value || '#000000';
    const txtColor = document.getElementById('tickerTextColor')?.value || '#ffffff';
    const speed = document.getElementById('tickerSpeed')?.value || '50';
    try {
        await sb.from('settings').upsert([
            { key: 'news_ticker', value: text },
            { key: 'ticker_bg', value: bgColor },
            { key: 'ticker_color', value: txtColor },
            { key: 'ticker_speed', value: speed }
        ]);
        if(document.getElementById('settingsNewsInput')) document.getElementById('settingsNewsInput').value = text;
        if(document.getElementById('settingsTickerBgColor')) document.getElementById('settingsTickerBgColor').value = bgColor;
        if(document.getElementById('settingsTickerTextColor')) document.getElementById('settingsTickerTextColor').value = txtColor;
        if(document.getElementById('settingsTickerSpeed')) document.getElementById('settingsTickerSpeed').value = speed;
        alert('تم بث النص والألوان والسرعة لجميع الشاشات بنجاح! 📡');
    } catch (err) { alert('حدث خطأ: ' + err.message); }
}

async function saveAdvancedTicker() {
    const text = document.getElementById('settingsNewsInput')?.value || '';
    const bgColor = document.getElementById('settingsTickerBgColor')?.value || '#000000';
    const txtColor = document.getElementById('settingsTickerTextColor')?.value || '#ffffff';
    const speed = document.getElementById('settingsTickerSpeed')?.value || '50';
    try {
        await sb.from('settings').upsert([
            { key: 'news_ticker', value: text },
            { key: 'ticker_bg', value: bgColor },
            { key: 'ticker_color', value: txtColor },
            { key: 'ticker_speed', value: speed }
        ]);
        if(document.getElementById('newsInput')) document.getElementById('newsInput').value = text;
        if(document.getElementById('tickerBgColor')) document.getElementById('tickerBgColor').value = bgColor;
        if(document.getElementById('tickerTextColor')) document.getElementById('tickerTextColor').value = txtColor;
        if(document.getElementById('tickerSpeed')) document.getElementById('tickerSpeed').value = speed;
        alert('تم التحديث! وتزامنت لوحة القيادة بنجاح 📡');
    } catch (err) { alert('حدث خطأ: ' + err.message); }
}

// ==========================================
// 🖼️ 8. الشعار الافتراضي (الرفع والحذف الفعلي)
// ==========================================
async function uploadFallbackImage() {
    const fileInput = document.getElementById('fallbackInput');
    const file = fileInput.files[0];
    if (!file) return alert('الرجاء اختيار صورة الشعار أولاً!');
    const statusLabel = document.getElementById('fallbackStatus');
    statusLabel.innerText = 'جاري رفع الشعار... ⏳';

    try {
        const fileExtension = file.name.split('.').pop();
        const fileName = 'fallback_' + Date.now() + '.' + fileExtension;
        const { data, error } = await sb.storage.from('media').upload(fileName, file);
        if (error) throw error;
        const { data: { publicUrl } } = sb.storage.from('media').getPublicUrl(fileName);
        await sb.from('settings').upsert({ key: 'fallback_image', value: publicUrl });
        statusLabel.innerText = 'تم تعيين الشعار بنجاح! ✅';
        fileInput.value = '';
        fetchSettings(); 
    } catch (err) {
        statusLabel.innerText = 'فشل الرفع: ' + err.message;
    }
}

async function deleteFallbackImage() {
    if (confirm('هل أنت متأكد من حذف الشعار الافتراضي؟ ستعود الشاشات لعرض رسالة "الشاشة متاحة" عند فراغها.')) {
        const statusLabel = document.getElementById('fallbackStatus');
        statusLabel.innerText = 'جاري الحذف... ⏳';
        try {
            await sb.from('settings').delete().eq('key', 'fallback_image');
            if(document.getElementById('currentFallbackPreview')) {
                document.getElementById('currentFallbackPreview').style.display = 'none';
                if(document.getElementById('fallbackPlaceholder')) document.getElementById('fallbackPlaceholder').style.display = 'flex';
                document.getElementById('currentFallbackPreview').src = '';
            }
            statusLabel.innerText = 'تم حذف الشعار بنجاح! 🗑️';
        } catch (err) {
            statusLabel.innerText = 'حدث خطأ أثناء الحذف.';
        }
    }
}

// ==========================================
// 🔄 9. تحديث الألوان الحية في المتصفح
// ==========================================
document.getElementById('primaryColor')?.addEventListener('input', e => {
    if(document.getElementById('primaryColorText')) document.getElementById('primaryColorText').value = e.target.value;
    document.documentElement.style.setProperty('--primary', e.target.value);
});
document.getElementById('sidebarColor')?.addEventListener('input', e => {
    if(document.getElementById('sidebarColorText')) document.getElementById('sidebarColorText').value = e.target.value;
    document.documentElement.style.setProperty('--sidebar-bg', e.target.value);
});

['bgColor', 'cardBgColor', 'textColor'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', e => {
        if(document.getElementById(id + 'Text')) document.getElementById(id + 'Text').value = e.target.value;
        let cssVar = id === 'bgColor' ? '--bg-color' : (id === 'cardBgColor' ? '--card-bg' : '--text-color');
        document.documentElement.style.setProperty(cssVar, e.target.value);
    });
});

// ==========================================
// 📡 10. تشغيل النظام اللحظي (Real-time) وبدء العمل
// ==========================================
sb.channel('admin-dashboard')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'screens' }, fetchScreens)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'playlist' }, fetchPlaylist)
    .subscribe();

// تشغيل النظام
loadComponents();
fetchScreens();  
fetchPlaylist();
fetchSettings();