let sins = []; 
let repentedSins = JSON.parse(localStorage.getItem('repentedSins_v4')) || [];
let notCommittedSins = JSON.parse(localStorage.getItem('notCommittedSins_v4')) || [];

// جلب البيانات من ملف data.json
async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error("Network response was not ok");
        
        sins = await response.json();
        renderSins();
    } catch (error) {
        console.error("Error loading JSON data:", error);
        document.getElementById('sins-container').innerHTML = `
            <div class="error-message">
                عذراً، حدث خطأ في تحميل ملف البيانات (data.json).<br>
                تأكد من تشغيل المشروع عبر سيرفر محلي (Live Server) وليس كملف عادي.
            </div>`;
    }
}

function updateStats() {
    if (sins.length === 0) return;
    const totalCompleted = repentedSins.length + notCommittedSins.length;
    document.getElementById('repented-count').innerText = repentedSins.length;
    document.getElementById('not-committed-count').innerText = notCommittedSins.length;
    document.getElementById('total-completed').innerText = totalCompleted;
    
    const percentage = (totalCompleted / sins.length) * 100;
    document.getElementById('progress-bar').style.width = percentage + '%';
}

function saveData() {
    localStorage.setItem('repentedSins_v4', JSON.stringify(repentedSins));
    localStorage.setItem('notCommittedSins_v4', JSON.stringify(notCommittedSins));
}

function repentSin(id) {
    if (!repentedSins.includes(id)) {
        repentedSins.push(id);
        notCommittedSins = notCommittedSins.filter(sinId => sinId !== id);
        saveData();
        renderSins(); 
    }
}

function markNotCommitted(id) {
    if (!notCommittedSins.includes(id)) {
        notCommittedSins.push(id);
        repentedSins = repentedSins.filter(sinId => sinId !== id);
        saveData();
        renderSins();
    }
}

function resetRow(id) {
    if (confirm("هل أنت متأكد من إلغاء التحديد؟")) {
        repentedSins = repentedSins.filter(sinId => sinId !== id);
        notCommittedSins = notCommittedSins.filter(sinId => sinId !== id);
        saveData();
        renderSins();
    }
}

function resetAll() {
    if ((repentedSins.length > 0 || notCommittedSins.length > 0) && confirm("تنبيه: هل أنت متأكد من تصفير ومسح كل السجلات والبدء من جديد؟")) {
        repentedSins = [];
        notCommittedSins = [];
        saveData();
        renderSins();
    }
}

// المنسق الذكي للنصوص
function formatArabicText(text) {
    if (!text) return "";
    
    let formatted = text;

    // إصلاح الكلمات الملتصقة
    formatted = formatted.replace(/\}([^\s.,،])/g, '} $1');
    formatted = formatted.replace(/([^\s.,،])\{/g, '$1 {');
    formatted = formatted.replace(/بِاللَّهفأكبر/g, 'بِاللَّه فأكبر');
    formatted = formatted.replace(/وَسَلَّمعد/g, 'وَسَلَّم عد');
    formatted = formatted.replace(/تَعَالَىالْكَبِيرَة/g, 'تَعَالَى الْكَبِيرَة');
    
    // تلوين الآيات القرآنية بأقواس المصحف
    formatted = formatted.replace(/\{([^}]+)\}/g, '<span class="quran-text">﴿ $1 ﴾</span>');
    
    // تلوين وتنسيق عبارة "صلى الله عليه وسلم"
    formatted = formatted.replace(/(صلى الله عَلَيْهِ وَسلم|صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ)/g, '<span class="pbuh-text">$1</span>');
    
    // إضافة أسطر جديدة قبل بدايات الأقوال 
    formatted = formatted.replace(/(قَالَ الله تَعَالَى|قَالَ اللَّهُ تَعَالَى|وَقَالَ تَعَالَى|وَقَالَ الله تَعَالَى|قَالَ النَّبِي|وَقَالَ النَّبِي|وَقَالَ صلى الله|قَالَ رَسُول الله|وَقَالَ رَسُول|وَفِي الصَّحِيح|وَعَن ابْن|وَعَن أبي|وَعَن|قَالَ ابْن|وَقَالَ|روى|عَن أبي|عَن ابْن)/g, '<span class="section-break"></span><span class="narrator-text">$1</span>');

    // تنسيق اسم الكبيرة إن وُجد ملتصقاً في بداية النص
    formatted = formatted.replace(/(الْكَبِيرَة [^\s]+ )/g, '<span class="section-break"></span><strong>$1</strong>');

    return formatted;
}

function openModal(id) {
    const sin = sins.find(s => s.id === id);
    document.getElementById('modalSinTitle').innerText = `${sin.id}. ${sin.title}`;
    
    // تمرير النص الخام على المنسق الذكي قبل عرضه
    const formattedHTML = formatArabicText(sin.full_content);
    document.getElementById('modalTextBody').innerHTML = formattedHTML;
    
    document.getElementById('modalBtnLink').href = sin.url;
    document.getElementById('sourceModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('sourceModal').style.display = 'none';
}

// إغلاق النافذة عند الضغط خارجها
window.onclick = function(event) {
    const modal = document.getElementById('sourceModal');
    if (event.target == modal) { closeModal(); }
}

function renderSins() {
    const container = document.getElementById('sins-container');
    container.innerHTML = ''; 
    
    sins.forEach((sin) => {
        const isRepented = repentedSins.includes(sin.id);
        const isNotCommitted = notCommittedSins.includes(sin.id);
        const isCompleted = isRepented || isNotCommitted;

        let cardClass = '';
        if (isRepented) cardClass = 'repented';
        else if (isNotCommitted) cardClass = 'not-committed';

        const actionButtons = isCompleted 
            ? `<button class="btn btn-reset-row" onclick="resetRow(${sin.id})">إلغاء التحديد</button>`
            : `<button class="btn btn-repent" onclick="repentSin(${sin.id})">أعلن توبتي</button>
               <button class="btn btn-not-committed" onclick="markNotCommitted(${sin.id})">لم أرتكبها</button>`;

        const card = document.createElement('div');
        card.className = `sin-card ${cardClass}`;
        
        // استخدام مقتطف صغير من النص
        const shortDesc = sin.full_content.substring(0, 150) + "...";

        card.innerHTML = `
            <div class="badge repented-badge">تمت التوبة الحمد لله</div>
            <div class="badge not-committed-badge">الحمد لله عافاني منها</div>
            <h2 class="sin-title">${sin.id}. ${sin.title}</h2>
            <p class="sin-desc">${shortDesc}</p>
            <div class="actions">
                ${actionButtons}
                <a href="${sin.url}" target="_blank" class="btn btn-source-tab">المصدر (صفحة جديدة)</a>
                <button class="btn btn-source-modal" onclick="openModal(${sin.id})">المصدر (نافذة)</button>
            </div>
        `;
        container.appendChild(card);
    });
    updateStats();
}

// تحميل البيانات عند فتح الصفحة
document.addEventListener('DOMContentLoaded', loadData);