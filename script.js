// ⚙️ إعدادات الربط
const SUPABASE_URL = 'https://omjfsqwtaoyinfteqhqh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tamZzcXd0YW95aW5mdGVxaHFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MDI2ODAsImV4cCI6MjA4NTM3ODY4MH0._2OGGOMW6YUctrCyk-neskR0F7fGadlW79BmPrkyJXM';

// ✅ إنشاء العميل (تغيير الاسم إلى sb)
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// 📦 دالة استدعاء المكونات الخارجية (Components)
// 📦 دالة استدعاء المكونات (تعمل في أي مكان بدون سيرفر محلي)
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
    
    // حقن الكود في الأماكن المخصصة له
    document.querySelectorAll('.load-stats-here').forEach(container => {
        container.innerHTML = statsHTML;
    });
}
// 1️⃣ جلب الشاشات وتحديثها تلقائياً
async function fetchScreens() {
    const { data, error } = await sb.from('screens').select('*').order('last_ping', { ascending: false });
    if (error) console.error('Error fetching screens:', error);
    renderScreens(data || []);
    updateTargetSelect(data || []);
}

// 🌐 التنقل بين النوافذ
// 🌐 1. التنقل السريع بين النوافذ الثلاث (Dashboard, Screens, Content)
function switchTab(tabName) {
    // إخفاء/إظهار النوافذ
    document.getElementById('view-dashboard').style.display = tabName === 'dashboard' ? 'block' : 'none';
    document.getElementById('view-screens').style.display = tabName === 'screens' ? 'block' : 'none';
    document.getElementById('view-content').style.display = tabName === 'content' ? 'block' : 'none';
    document.getElementById('view-settings').style.display = tabName === 'settings' ? 'block' : 'none';
    
    // تفعيل الزر في القائمة الجانبية
    document.getElementById('tab-dashboard').classList.toggle('active', tabName === 'dashboard');
    if(document.getElementById('tab-screens')) document.getElementById('tab-screens').classList.toggle('active', tabName === 'screens');
    document.getElementById('tab-content').classList.toggle('active', tabName === 'content');
    if(document.getElementById('tab-settings')) document.getElementById('tab-settings').classList.toggle('active', tabName === 'settings');

    // تغيير عنوان الصفحة العُلوي
    const titles = {
        'dashboard': 'لوحة القيادة الرئيسية',
        'screens': 'إدارة الشاشات والأجهزة',
        'content': 'إدارة المحتوى والمكتبة',
        'settings': 'إعدادات النظام'
    };
    document.getElementById('pageTitle').innerText = titles[tabName];
}

// 🖥️ 2. رسم الشاشات وحساب الإحصائيات (النسخة المدمجة والشاملة)
function renderScreens(screens) {
    // جلب الجداول (الجدول المختصر في الرئيسية، والجدول المفصل في إدارة الشاشات)
    const tbodyDashboard = document.getElementById('screensList');
    const tbodyDetailed = document.getElementById('detailedScreensList');
    
    if(tbodyDashboard) tbodyDashboard.innerHTML = '';
    if(tbodyDetailed) tbodyDetailed.innerHTML = '';

    // متغيرات للإحصائيات الذكية
    let onlineCount = 0;
    let offlineCount = 0;
    const now = new Date();

    screens.forEach(s => {
        // 💡 1. التحقق من التصريح
        const isLinked = s.status === 'linked';
        const statusClass = isLinked ? 'status-linked' : 'status-pending';
        const statusText = isLinked ? 'متصل ومفعل ✅' : 'بانتظار الموافقة ⏳';

        // 💡 2. التحقق من حالة العرض (يعرض إعلاناً أم الشاشة فارغة؟)
        const isPlaying = s.play_status === 'playing';
        const playBadge = isPlaying
            ? `<span style="background: #2196F3; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; margin-top: 5px; display: inline-block;">📺 يعرض الآن</span>`
            : `<span style="background: #f44336; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; margin-top: 5px; display: inline-block;">⚠️ شاشة فارغة</span>`;

        // 💡 3. حساب حالة الاتصال (Online/Offline) بناءً على آخر 5 دقائق
        const lastPing = new Date(s.last_ping);
        const diffMinutes = Math.abs(now - lastPing) / (1000 * 60);
        const isOnline = diffMinutes <= 5; 

        if (isOnline) onlineCount++; else offlineCount++;

        const connectionBadge = isOnline 
            ? `<span style="color: #2e7d32; font-weight:bold; font-size: 0.85em;"><i class="fa-solid fa-wifi"></i> متصل </span>` 
            : `<span style="color: #c62828; font-weight:bold; font-size: 0.85em;"><i class="fa-solid fa-plug-circle-xmark"></i> مفصول</span>`;

        // 💡 4. أزرار الإجراءات (تفعيل، إيقاف، وحذف)
        const actionBtn = isLinked
            ? `<button style="background: #f91616; class="btn-delete" onclick="updateScreenStatus('${s.device_id}', 'pending')">إيقاف</button>`
            : `<button style="background: #54dc5b; class="btn-approve" onclick="updateScreenStatus('${s.device_id}', 'linked')" >تفعيل</button>`;
        
        const deleteBtn = `<button class="btn-delete" style="background:#ed0707; margin-right:5px;" onclick="deleteScreen('${s.device_id}')"><i class="fa-solid fa-trash"></i></button>`;

        // ----------- إضافة البيانات للجدول المختصر (في لوحة القيادة) -----------
        if(tbodyDashboard) {
            tbodyDashboard.innerHTML += `
                <tr>
                    <td><strong>${s.device_id}</strong></td>
                    <td>${connectionBadge}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${isLinked ? playBadge : '-'}</td>
                </tr>
            `;
        }

        // ----------- إضافة البيانات للجدول المفصل (في نافذة إدارة الشاشات) -----------
        if(tbodyDetailed) {
            tbodyDetailed.innerHTML += `
                <tr>
                    <td><strong>${s.device_id}</strong></td>
                    <td>${s.ip_address || '-'} <br> ${connectionBadge}</td>
                    <td>
                        <span class="status-badge ${statusClass}">${statusText}</span><br>
                        ${isLinked ? playBadge : ''}
                    </td>
                    <td dir="ltr" style="text-align: right;">${lastPing.toLocaleTimeString('ar-EG')}</td>
                    <td>${actionBtn} ${deleteBtn}</td>
                </tr>
            `;
        }
    });

    // 💡 5. تحديث أرقام الإحصائيات العلوية في نافذة "إدارة الشاشات"
    document.querySelectorAll('.totalScreensVal').forEach(el => el.innerText = screens.length);
    document.querySelectorAll('.onlineScreensVal').forEach(el => el.innerText = onlineCount);
    document.querySelectorAll('.offlineScreensVal').forEach(el => el.innerText = offlineCount);
}

// 🗑️ 3. دالة حذف الشاشة (مهمة جداً لتعمل أيقونة الحذف الجديدة)
async function deleteScreen(id) {
    if(confirm('تحذير: هل أنت متأكد من حذف هذه الشاشة من النظام نهائياً؟')) {
        await sb.from('screens').delete().eq('device_id', id);
        fetchScreens(); // تحديث الجداول بعد الحذف
    }
}

async function updateScreenStatus(id, status) {
    await sb.from('screens').update({ status: status }).eq('device_id', id);
    fetchScreens();
}

function updateTargetSelect(screens) {
    const select = document.getElementById('targetScreen');
    select.innerHTML = '<option value="all">عرض على كل الشاشات</option>';
    screens.forEach(s => {
        select.innerHTML += `<option value="${s.device_id}">شاشة: ${s.device_id}</option>`;
    });
}


// ==========================================
//  رفع المحتوى (صور مباشر / فيديو بالحزم Chunked)
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
    
    // إظهار شريط التحميل
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    if(progressContainer) progressContainer.style.display = 'block';
    if(progressText) progressText.style.display = 'block';
    if(progressBar) progressBar.style.width = '0%';

    const fileExtension = file.name.split('.').pop() || (type === 'image' ? 'jpg' : 'mp4');
    const fileName = 'media_' + Date.now() + '.' + fileExtension;
    
    // =====================================
    // 🎥 حالة رفع الفيديو (بنظام الحزم - Chunked Upload)
    // =====================================
    if (type === 'video') {
        statusLabel.innerText = 'جاري رفع الفيديو (نظام الحزم الآمن)... ⏳';
        
        // استخدام مكتبة TUS للرفع المتقطع
        const upload = new tus.Upload(file, {
            endpoint: `${SUPABASE_URL}/storage/v1/upload/resumable`,
            retryDelays: [0, 3000, 5000, 10000, 20000], // إعادة المحاولة إذا انقطع النت
            headers: {
                authorization: `Bearer ${SUPABASE_KEY}`,
                'x-upsert': 'true'
            },
            uploadDataDuringCreation: true,
            removeFingerprintOnSuccess: true,
            metadata: {
                bucketName: 'media',
                objectName: fileName,
                contentType: file.type,
                cacheControl: '3600'
            },
            chunkSize: 5 * 1024 * 1024, //  حجم الحزمة: 5 ميجابايت (مثالي للإنترنت الضعيف)
            onError: function (error) {
                statusLabel.innerText = 'فشل الرفع: ' + error.message;
            },
            onProgress: function (bytesUploaded, bytesTotal) {
                const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(1);
                if(progressBar) progressBar.style.width = percentage + '%';
                if(progressText) progressText.innerText = percentage + '%';
            },
            onSuccess: async function () {
                await saveToDatabase(fileName, type, startsInput, expiresInput, statusLabel, fileInput);
            }
        });

        // التحقق من وجود رفع سابق معلق لنفس الملف لاستكماله
        upload.findPreviousUploads().then(function (previousUploads) {
            if (previousUploads.length) {
                upload.resumeFromPreviousUpload(previousUploads[0]);
            }
            upload.start(); // بدء الرفع
        });

    } 
    // =====================================
    //  حالة رفع الصور (رفع مباشر وسريع XHR)
    // =====================================
    else {
        statusLabel.innerText = 'جاري رفع الصورة... ';
        
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
        xhr.setRequestHeader('apikey', SUPABASE_KEY);
        xhr.setRequestHeader('x-upsert', 'true');
        xhr.setRequestHeader('Content-Type', file.type || 'image/jpeg');
        xhr.send(file);
    }
}

// 📦 دالة مساعدة لحفظ البيانات بعد اكتمال الرفع
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
        const progressContainer = document.getElementById('progressContainer');
        const progressText = document.getElementById('progressText');
        if(progressContainer) progressContainer.style.display = 'none';
        if(progressText) progressText.style.display = 'none';
    }, 3000);
    
    fetchPlaylist();
}
// 3️⃣ إدارة قائمة التشغيل
// 3️⃣ إدارة قائمة التشغيل (شكل المعرض)
// 3️⃣ إدارة قائمة التشغيل (مع الجدولة الزمنية)
async function fetchPlaylist() {
    const { data } = await sb.from('playlist').select('*').order('created_at', { ascending: false });
    const gallery = document.getElementById('mediaGallery');
    if (!gallery) return;
    
    gallery.innerHTML = '';
    
    if(data) {
        const now = new Date();
        data.forEach(item => {
            const startDate = item.starts_at ? new Date(item.starts_at) : new Date(0);
            const expDate = item.expires_at ? new Date(item.expires_at) : null;
            
            // تحديد حالة الإعلان الذكية
            let statusText = 'غير معروف';
            let statusColor = 'gray';
            let opacity = '1';

            if (expDate && now > expDate) {
                statusText = 'منتهي 🔴';
                statusColor = '#e53935';
                opacity = '0.6';
            } else if (now < startDate) {
                statusText = 'مجدول ⏳ (لم يبدأ)';
                statusColor = '#ffa726'; // برتقالي
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
}
async function deleteItem(id) {
    if (confirm('هل أنت متأكد من حذف هذا المحتوى؟')) {
        await sb.from('playlist').delete().eq('id', id);
        fetchPlaylist();
    }
}

// 4 دوال شريط الأخبار (المصححة)
async function updateTicker() {
    const text = document.getElementById('newsInput').value;
    if (!text) return;
    await sb.from('settings').upsert({ key: 'news_ticker', value: text });
    alert('تم تحديث النص! ');
}

async function toggleTickerVisibility() {
    const isVisible = document.getElementById('tickerToggle').checked;
    await sb.from('settings').upsert({ key: 'show_ticker', value: isVisible.toString() });
}
//  1. دالة الإظهار والإخفاء المتزامنة (تعمل من النافذتين)
async function toggleTickerVisibility(source) {
    // تحديد حالة الزر بناءً على النافذة التي ضغط منها المستخدم
    const isVisible = source === 'dashboard' 
        ? document.getElementById('tickerToggle').checked 
        : document.getElementById('settingsTickerToggle').checked;

    try {
        await sb.from('settings').upsert({ key: 'show_ticker', value: isVisible.toString() });
        
        // مزامنة الزر الآخر ليكونوا بنفس الحالة دائماً
        if(document.getElementById('tickerToggle')) document.getElementById('tickerToggle').checked = isVisible;
        if(document.getElementById('settingsTickerToggle')) document.getElementById('settingsTickerToggle').checked = isVisible;
        
    } catch (err) {
        console.error("خطأ في تحديث حالة الشريط:", err);
    }
}

// 🚀 2. دالة حفظ الشريط الشاملة (تحفظ النص، الألوان، والسرعة دفعة واحدة)
async function updateAdvancedTicker() {
    const text = document.getElementById('newsInput').value;
    const bgColor = document.getElementById('tickerBgColor').value;
    const txtColor = document.getElementById('tickerTextColor').value;
    const speed = document.getElementById('tickerSpeed').value;

    try {
        await sb.from('settings').upsert([
            { key: 'news_ticker', value: text },
            { key: 'ticker_bg', value: bgColor },
            { key: 'ticker_color', value: txtColor },
            { key: 'ticker_speed', value: speed }
        ]);
        
        // مزامنة النص مع نافذة الإعدادات (إذا كانت موجودة)
        if(document.getElementById('settingsNewsInput')) {
            document.getElementById('settingsNewsInput').value = text;
        }
        
        alert('تم بث النص والألوان والسرعة لجميع الشاشات بنجاح! 📡');
    } catch (err) {
        alert('حدث خطأ أثناء البث: ' + err.message);
    }
}

// دالة لجلب الإعدادات عند فتح الصفحة
async function fetchSettings() {
    const { data } = await sb.from('settings').select('*');
    if (data) {
        // تحديث شريط الأخبار
        const showSetting = data.find(item => item.key === 'show_ticker');
        const isShowing = showSetting ? (showSetting.value === 'true') : true;
        if (document.getElementById('tickerToggle')) document.getElementById('tickerToggle').checked = isShowing;
        if (document.getElementById('settingsTickerToggle')) document.getElementById('settingsTickerToggle').checked = isShowing;

        const newsSetting = data.find(item => item.key === 'news_ticker');
        if (newsSetting) {
            if(document.getElementById('newsInput')) document.getElementById('newsInput').value = newsSetting.value;
            if(document.getElementById('settingsNewsInput')) document.getElementById('settingsNewsInput').value = newsSetting.value;
        }

        // تحديث الشعار الافتراضي
        const fallbackSetting = data.find(item => item.key === 'fallback_image');
        if (fallbackSetting && fallbackSetting.value) {
            if(document.getElementById('currentFallbackPreview')){
                document.getElementById('currentFallbackPreview').src = fallbackSetting.value;
                document.getElementById('currentFallbackPreview').style.display = 'block';
                document.getElementById('fallbackPlaceholder').style.display = 'none';
            }
        }

        // تحديث الألوان وهوية النظام
        const sysName = data.find(item => item.key === 'system_name')?.value || 'SabaPost';
        const primaryColor = data.find(item => item.key === 'theme_primary')?.value || '#5c6bc0';
        const sidebarColor = data.find(item => item.key === 'theme_sidebar')?.value || '#2b2b44';
        
        document.querySelectorAll('.brand span').forEach(el => el.innerText = sysName);
        if(document.getElementById('systemName')) document.getElementById('systemName').value = sysName;
        
        document.documentElement.style.setProperty('--primary', primaryColor);
        document.documentElement.style.setProperty('--sidebar-bg', sidebarColor);
        // 🟢 جلب وتطبيق الألوان الثلاثة الجديدة
        const bgColor = data.find(item => item.key === 'theme_bg')?.value || '#f4f7fa';
        const cardBgColor = data.find(item => item.key === 'theme_card_bg')?.value || '#ffffff';
        const textColor = data.find(item => item.key === 'theme_text')?.value || '#333333';
        
        document.documentElement.style.setProperty('--bg-color', bgColor);
        document.documentElement.style.setProperty('--card-bg', cardBgColor);
        document.documentElement.style.setProperty('--text-color', textColor);

        if(document.getElementById('bgColor')) {
            document.getElementById('bgColor').value = bgColor;
            document.getElementById('bgColorText').value = bgColor;
        }
        if(document.getElementById('cardBgColor')) {
            document.getElementById('cardBgColor').value = cardBgColor;
            document.getElementById('cardBgColorText').value = cardBgColor;
        }
        if(document.getElementById('textColor')) {
            document.getElementById('textColor').value = textColor;
            document.getElementById('textColorText').value = textColor;
        }
        
        if(document.getElementById('primaryColor')) {
            document.getElementById('primaryColor').value = primaryColor;
            document.getElementById('primaryColorText').value = primaryColor;
        }
        if(document.getElementById('sidebarColor')) {
            document.getElementById('sidebarColor').value = sidebarColor;
            document.getElementById('sidebarColorText').value = sidebarColor;
        }

        // 🟢 تحديث ألوان الشريط الأخباري (تعبئة النافذتين معاً)
        const tBg = data.find(item => item.key === 'ticker_bg')?.value || '#000000';
        const tColor = data.find(item => item.key === 'ticker_color')?.value || '#ffffff';
        const tSpeed = data.find(item => item.key === 'ticker_speed')?.value || '50';
        
        // تعبئة حقول لوحة القيادة
        if(document.getElementById('tickerBgColor')) document.getElementById('tickerBgColor').value = tBg;
        if(document.getElementById('tickerTextColor')) document.getElementById('tickerTextColor').value = tColor;
        if(document.getElementById('tickerSpeed')) document.getElementById('tickerSpeed').value = tSpeed;
        
        // تعبئة حقول الإعدادات
        if(document.getElementById('settingsTickerBgColor')) document.getElementById('settingsTickerBgColor').value = tBg;
        if(document.getElementById('settingsTickerTextColor')) document.getElementById('settingsTickerTextColor').value = tColor;
        if(document.getElementById('settingsTickerSpeed')) document.getElementById('settingsTickerSpeed').value = tSpeed;
    }
}

// دالة إظهار وإخفاء الشريط
async function toggleTickerVisibility(source) {
    const isVisible = source === 'dashboard' 
        ? document.getElementById('tickerToggle').checked 
        : document.getElementById('settingsTickerToggle').checked;

    try {
        await sb.from('settings').upsert({ key: 'show_ticker', value: isVisible.toString() });
        if(document.getElementById('tickerToggle')) document.getElementById('tickerToggle').checked = isVisible;
        if(document.getElementById('settingsTickerToggle')) document.getElementById('settingsTickerToggle').checked = isVisible;
    } catch (err) {
        console.error("خطأ:", err);
    }
}


//  دالة الحفظ من نافذة (لوحة القيادة)
async function updateAdvancedTicker() {
    const text = document.getElementById('newsInput').value;
    const bgColor = document.getElementById('tickerBgColor').value;
    const txtColor = document.getElementById('tickerTextColor').value;
    const speed = document.getElementById('tickerSpeed').value;

    try {
        await sb.from('settings').upsert([
            { key: 'news_ticker', value: text },
            { key: 'ticker_bg', value: bgColor },
            { key: 'ticker_color', value: txtColor },
            { key: 'ticker_speed', value: speed }
        ]);
        
        // مزامنة البيانات مع نافذة الإعدادات
        if(document.getElementById('settingsNewsInput')) document.getElementById('settingsNewsInput').value = text;
        if(document.getElementById('settingsTickerBgColor')) document.getElementById('settingsTickerBgColor').value = bgColor;
        if(document.getElementById('settingsTickerTextColor')) document.getElementById('settingsTickerTextColor').value = txtColor;
        if(document.getElementById('settingsTickerSpeed')) document.getElementById('settingsTickerSpeed').value = speed;
        
        alert('تم بث النص والألوان والسرعة لجميع الشاشات بنجاح! 📡');
    } catch (err) {
        alert('حدث خطأ: ' + err.message);
    }
}

// 5️⃣ Realtime Listeners
sb.channel('admin-dashboard')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'screens' }, fetchScreens)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'playlist' }, fetchPlaylist)
    .subscribe();

    // 📺 1. دالة المعاينة التلقائية عند اختيار ملف من الكمبيوتر
document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const placeholder = document.getElementById('previewPlaceholder');
    const imgPreview = document.getElementById('imagePreview');
    const vidPreview = document.getElementById('videoPreview');

    // إخفاء كل شيء أولاً
    placeholder.style.display = 'none';
    imgPreview.style.display = 'none';
    vidPreview.style.display = 'none';
    vidPreview.pause();

    // إنشاء رابط مؤقت للملف
    const fileURL = URL.createObjectURL(file);

    // التحقق من نوع الملف وعرضه
    if (file.type.startsWith('image/')) {
        imgPreview.src = fileURL;
        imgPreview.style.display = 'block';
        document.getElementById('fileType').value = 'image'; // التحديد التلقائي لنوع الملف
    } else if (file.type.startsWith('video/')) {
        vidPreview.src = fileURL;
        vidPreview.style.display = 'block';
        document.getElementById('fileType').value = 'video'; // التحديد التلقائي لنوع الملف
    }
});

// 📺 2. دالة معاينة المحتوى المحفوظ من جدول قائمة العرض
function previewFromPlaylist(url, type) {
    const placeholder = document.getElementById('previewPlaceholder');
    const imgPreview = document.getElementById('imagePreview');
    const vidPreview = document.getElementById('videoPreview');

    placeholder.style.display = 'none';
    imgPreview.style.display = 'none';
    vidPreview.style.display = 'none';
    vidPreview.pause();

    if (type === 'image') {
        imgPreview.src = url;
        imgPreview.style.display = 'block';
    } else {
        vidPreview.src = url;
        vidPreview.style.display = 'block';
        vidPreview.play(); // تشغيل الفيديو تلقائياً
    }
    
    // التمرير السلس لأعلى الصفحة لرؤية الشاشة
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ⚙️ دالة رفع وتعيين المحتوى الافتراضي (Fallback)
async function uploadFallbackImage() {
    const fileInput = document.getElementById('fallbackInput');
    const file = fileInput.files[0];
    if (!file) return alert('الرجاء اختيار صورة الشعار أولاً!');

    const statusLabel = document.getElementById('fallbackStatus');
    statusLabel.innerText = 'جاري رفع الشعار... ⏳';

    try {
        const fileExtension = file.name.split('.').pop();
        const fileName = 'fallback_' + Date.now() + '.' + fileExtension;
        
        // رفع الصورة
        const { data, error } = await sb.storage.from('media').upload(fileName, file);
        if (error) throw error;

        // جلب الرابط العام
        const { data: { publicUrl } } = sb.storage.from('media').getPublicUrl(fileName);

        // حفظ الرابط في جدول الإعدادات
        await sb.from('settings').upsert({ key: 'fallback_image', value: publicUrl });

        statusLabel.innerText = 'تم تعيين الشعار بنجاح! سيظهر على الشاشات الفارغة فوراً ✅';
        fileInput.value = '';
        fetchSettings(); // لتحديث الصورة في لوحة التحكم

    } catch (err) {
        console.error(err);
        statusLabel.innerText = 'فشل الرفع: ' + err.message;
    }
}

// دالة حذف الشعار الافتراضي من النظام
async function deleteFallbackImage() {
if (confirm('هل أنت متأكد من حذف الشعار الافتراضي؟ ستعود الشاشات لعرض رسالة "الشاشة متاحة" عند فراغها.')) {
const statusLabel = document.getElementById('fallbackStatus');
statusLabel.innerText = 'جاري الحذف... ⏳';

}}

// التحكم في اللالوان

// 🎨 1. دالة حفظ ألوان وهوية لوحة التحكم
async function saveThemeSettings() {
    const sysName = document.getElementById('systemName').value;
    const primary = document.getElementById('primaryColor').value;
    const sidebar = document.getElementById('sidebarColor').value;
    
    // الألوان الجديدة
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
            { key: 'theme_text', value: textC }
        ]);
        alert('تم حفظ وتطبيق المظهر بنجاح! ');
        fetchSettings();
    } catch (err) {
        alert('حدث خطأ أثناء الحفظ');
    }
}
//  2. دالة حفظ إعدادات شريط الأخبار المتقدمة (ترسل للشاشات)
//  دالة الحفظ من نافذة (الإعدادات)
async function saveAdvancedTicker() {
    // 1. نقرأ القيم من نافذة الإعدادات
    const text = document.getElementById('settingsNewsInput').value;
    const bgColor = document.getElementById('settingsTickerBgColor').value;
    const txtColor = document.getElementById('settingsTickerTextColor').value;
    const speed = document.getElementById('settingsTickerSpeed').value;

    try {
        // 2. نرسل القيم للسيرفر (تطبيق Flutter سيتغير لونه فوراً في هذه الخطوة بفضل الاستماع المباشر)
        await sb.from('settings').upsert([
            { key: 'news_ticker', value: text },
            { key: 'ticker_bg', value: bgColor },
            { key: 'ticker_color', value: txtColor },
            { key: 'ticker_speed', value: speed }
        ]);
        
        // 3. التزامن السحري: ننسخ القيم ونضعها في حقول (لوحة القيادة) لتبقى متطابقة 100%
        if(document.getElementById('newsInput')) document.getElementById('newsInput').value = text;
        if(document.getElementById('tickerBgColor')) document.getElementById('tickerBgColor').value = bgColor;
        if(document.getElementById('tickerTextColor')) document.getElementById('tickerTextColor').value = txtColor;
        if(document.getElementById('tickerSpeed')) document.getElementById('tickerSpeed').value = speed;
        
        alert('تم التحديث! تغير التطبيق، وتزامنت لوحة القيادة بنجاح ');
    } catch (err) {
        alert('حدث خطأ أثناء البث: ' + err.message);
    }
}
// 🔄 3. تحديث تزامن الألوان المباشر في واجهة المستخدم
document.getElementById('primaryColor').addEventListener('input', function(e) {
    document.getElementById('primaryColorText').value = e.target.value;
    document.documentElement.style.setProperty('--primary', e.target.value);
});
document.getElementById('sidebarColor').addEventListener('input', function(e) {
    document.getElementById('sidebarColorText').value = e.target.value;
    document.documentElement.style.setProperty('--sidebar-bg', e.target.value);
});



// 🟢 مزامنة الألوان الحية للخلفيات والنصوص
['bgColor', 'cardBgColor', 'textColor'].forEach(id => {
    if(document.getElementById(id)) {
        document.getElementById(id).addEventListener('input', function(e) {
            document.getElementById(id + 'Text').value = e.target.value;
            let cssVar = id === 'bgColor' ? '--bg-color' : (id === 'cardBgColor' ? '--card-bg' : '--text-color');
            document.documentElement.style.setProperty(cssVar, e.target.value);
        });
    }
});
// تشغيل الدوال عند فتح الصفحة
loadComponents(); // 1. نحقن الكود أولاً
fetchScreens();   // 2. نجلب البيانات ونحدث الأرقام
fetchPlaylist();
fetchSettings();
