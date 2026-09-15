let sins = []; 
let repentedSins = JSON.parse(localStorage.getItem('repentedSins_v5')) || [];
let notCommittedSins = JSON.parse(localStorage.getItem('notCommittedSins_v5')) || [];

async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error("Network response was not ok");
        sins = await response.json();
        renderSins();
    } catch (error) {
        console.error("Error loading JSON data:", error);
        document.getElementById('sins-container').innerHTML = `
            <div class="error-message">عذراً، حدث خطأ في تحميل ملف البيانات (data.json).</div>`;
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
    localStorage.setItem('repentedSins_v5', JSON.stringify(repentedSins));
    localStorage.setItem('notCommittedSins_v5', JSON.stringify(notCommittedSins));
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

// دالة لتجهيز النص للعرض
function formatContentForModal(htmlContent) {
    let formatted = htmlContent;
    // استبدال الأقواس العادية بأقواس الآيات المزخرفة 
    formatted = formatted.replace(/\{/g, '﴿ ').replace(/\}/g, ' ﴾');
    // تلوين الصلاة على النبي
    formatted = formatted.replace(/(صلى الله عَلَيْهِ وَسلم|صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ)/g, '<span class="pbuh-text">$1</span>');
    // مسح عنوان الكبيرة المكرر في بداية النص إن وجد
    formatted = formatted.replace(/^(<p>)?الْكَبِيرَة [^\s]+ [^\s]+(<\/p>)?/, '');
    
    return formatted;
}

function openModal(id) {
    const sin = sins.find(s => s.id === id);
    document.getElementById('modalSinTitle').innerText = `${sin.id}. ${sin.title}`;
    
    const textBody = document.getElementById('modalTextBody');
    textBody.innerHTML = formatContentForModal(sin.full_content);
    
    document.getElementById('modalBtnLink').href = sin.url;
    
    const modal = document.getElementById('sourceModal');
    modal.style.display = 'flex';
    
    setTimeout(() => {
        textBody.scrollTop = 0;
    }, 10);
}

function closeModal() {
    document.getElementById('sourceModal').style.display = 'none';
}

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
        
        // استخراج نص عادي للوصف الخارجي من الـ HTML
        let tempDiv = document.createElement('div');
        tempDiv.innerHTML = sin.full_content;
        let plainText = tempDiv.textContent || tempDiv.innerText || "";
        let shortDesc = plainText.replace(/^(الْكَبِيرَة [^\s]+ [^\s]+ )/, '').substring(0, 160) + "...";

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

document.addEventListener('DOMContentLoaded', loadData);