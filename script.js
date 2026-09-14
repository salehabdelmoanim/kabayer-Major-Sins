let sins = []; 
let repentedSins = JSON.parse(localStorage.getItem('repentedSins_v4')) || [];
let notCommittedSins = JSON.parse(localStorage.getItem('notCommittedSins_v4')) || [];

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
                تأكد من تشغيل المشروع عبر سيرفر محلي (Live Server).
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

// دالة تنظيف النص من الالتصاقات
function fixStuckWords(text) {
    if (!text) return "";
    let formatted = text;

    const fixes = [
        /بِاللَّهفأكبر/g, 'بِاللَّه فأكبر',
        /النَّفسقَالَ/g, 'النَّفس قَالَ',
        /السحرلِأَن/g, 'السحر لِأَن',
        /الصَّلَاةقَالَ/g, 'الصَّلَاة قَالَ',
        /الزَّكَاةقَالَ/g, 'الزَّكَاة قَالَ',
        /عذرقَالَ/g, 'عذر قَالَ',
        /عذرعَن/g, 'عذر عَن',
        /عَلَيْهِقَالَ/g, 'عَلَيْهِ قَالَ',
        /الْوَالِدينقَالَ/g, 'الْوَالِدين قَالَ',
        /الْأَقَارِبقَالَ/g, 'الْأَقَارِب قَالَ',
        /الزِّنَاوَبَعضه/g, 'الزِّنَا وَبَعضه',
        /اللواطقد/g, 'اللواط قد',
        /اللواطقَدْ/g, 'اللواط قَدْ',
        /الرِّبَاقَالَ/g, 'الرِّبَا قَالَ',
        /وظلمهقَالَ/g, 'وظلمه قَالَ',
        /وَسَلَّمقَالَ/g, 'وَسَلَّم قَالَ',
        /الزَّحْفإِذا/g, 'الزَّحْف إِذا',
        /لَهُمقَالَ/g, 'لَهُم قَالَ',
        /الْكبرالْكبر/g, 'الْكبر الْكبر',
        /الزُّورقَالَ/g, 'الزُّور قَالَ',
        /الْخمرقَالَ/g, 'الْخمر قَالَ',
        /الْقمَارقَالَ/g, 'الْقمَار قَالَ',
        /الْمُحْصنَاتقَالَ/g, 'الْمُحْصنَات قَالَ',
        /الْغَنِيمَةوَهِي/g, 'الْغَنِيمَة وَهِي',
        /السّرقَةقَالَ/g, 'السّرقَة قَالَ',
        /الطَّرِيققَالَ/g, 'الطَّرِيق قَالَ',
        /الْغمُوسقَالَ/g, 'الْغمُوس قَالَ',
        /الظُّلمبِأَكْل/g, 'الظُّلم بِأَكْل',
        /المكاسوَهُوَ/g, 'المكاس وَهُوَ',
        /كَانَقَالَ/g, 'كَانَ قَالَ',
        /نَفسهقَالَ/g, 'نَفسه قَالَ',
        /أَقْوَالهقَالَ/g, 'أَقْوَاله قَالَ',
        /السوءقَالَ/g, 'السوء قَالَ',
        /الحكيمقَالَ/g, 'الحكيم قَالَ',
        /الحكمقَالَ/g, 'الحكم قَالَ',
        /بِالنسَاءفِي/g, 'بِالنسَاء فِي',
        /أَهلهقَالَ/g, 'أَهله قَالَ',
        /لَهُصَحَّ/g, 'لَهُ صَحَّ',
        /النَّصَارَىقَالَ/g, 'النَّصَارَى قَالَ',
        /الرِّيَاءقَالَ/g, 'الرِّيَاء قَالَ',
        /الْعلمقَالَ/g, 'الْعلم قَالَ',
        /الْخِيَانَةقَالَ/g, 'الْخِيَانَة قَالَ',
        /المنانقَالَ/g, 'المنان قَالَ',
        /بِالْقدرِقَالَ/g, 'بِالْقدرِ قَالَ',
        /يسرونقَالَ/g, 'يسرون قَالَ',
        /النماموَهُوَ/g, 'النمام وَهُوَ',
        /اللعانقَالَ/g, 'اللعان قَالَ',
        /بالعهدقَالَ/g, 'بالعهد قَالَ',
        /والمنجمقَالَ/g, 'والمنجم قَالَ',
        /زَوجهَاقَالَ/g, 'زَوجهَا قَالَ',
        /بإتلافهاقَالَ/g, 'بإتلافها قَالَ',
        /الْمُصِيبَةروينَا/g, 'الْمُصِيبَة روينَا',
        /الْبَغيقَالَ/g, 'الْبَغي قَالَ',
        /وَالدَّابَّةلِأَن/g, 'وَالدَّابَّة لِأَن',
        /الْجَارثَبت/g, 'الْجَار ثَبت',
        /وشتمهمقَالَ/g, 'وشتمهم قَالَ',
        /عَلَيْهِمقَالَ/g, 'عَلَيْهِم قَالَ',
        /وخيلاءقَالَ/g, 'وخيلاء قَالَ',
        /للرِّجَالفِي/g, 'للرِّجَال فِي',
        /العَبْدروى/g, 'العَبْد روى',
        /وَجلمثل/g, 'وَجل مثل',
        /يعلمعَن/g, 'يعلم عَن',
        /واللددقَالَ/g, 'واللدد قَالَ',
        /المَاءقَالَ/g, 'المَاء قَالَ',
        /ذَلِكقَالَ/g, 'ذَلِك قَالَ',
        /اللهقَالَ/g, 'الله قَالَ',
        /عذرعَن/g, 'عذر عَن',
        /الْوَصِيَّةقَالَ/g, 'الْوَصِيَّة قَالَ',
        /والخديعةقَالَ/g, 'والخديعة قَالَ',
        /عورتهمفِيهِ/g, 'عورتهم فِيهِ',
        /عَلَيْهِمثَبت/g, 'عَلَيْهِم ثَبت',
        /الْمُسلمينقَالَ/g, 'الْمُسلمين قَالَ',
        /\}([^\s.,،])/g, '} $1',
        /([^\s.,،])\{/g, '$1 {',
        /\}الْكَبِيرَة/g, '} الْكَبِيرَة',
        /\} الْكَبِيرَة/g, '} الْكَبِيرَة'
    ];

    for (let i = 0; i < fixes.length; i += 2) {
        formatted = formatted.replace(fixes[i], fixes[i + 1]);
    }

    // إزالة أرقام الصفحات الزائدة التي دمجها السكريبت دون التأثير على القرآن أو النصوص
    formatted = formatted.replace(/(?:الكبيرة|الْكَبِيرَة|فصل|موعظة|حكاية|ذكر|حكي)[\s\S]{0,60}?\d+\s+\d+\s*/g, '');

    return formatted;
}

// المنسق الذكي للنصوص (يضيف الألوان والآيات القرآنية)
function formatArabicHTML(text) {
    let formatted = fixStuckWords(text);
    
    // الأقواس والآيات
    formatted = formatted.replace(/\{([^}]+)\}/g, '<span class="quran-text">﴿ $1 ﴾</span>');
    
    // الصلاة على النبي
    formatted = formatted.replace(/(صلى الله عَلَيْهِ وَسلم|صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ)/g, '<span class="pbuh-text">$1</span>');
    
    // ترتيب صارم للرواة لفصل الفقرات
    const narratorsRegex = /(وَقَالَ رَسُولُ اللَّهِ|قَالَ رَسُولُ اللَّهِ|وَقَالَ رَسُول الله|قَالَ رَسُول الله|وَقَالَ الله تَعَالَى|قَالَ الله تَعَالَى|وَقَالَ اللَّهُ تَعَالَى|قَالَ اللَّهُ تَعَالَى|وَقَالَ تَعَالَى|قَالَ تَعَالَى|وَقَالَ النَّبِي|قَالَ النَّبِي|وَقَالَ صلى الله|قَالَ صلى الله|وَفِي الصَّحِيحَيْنِ|فِي الصَّحِيحَيْنِ|وَفِي الصَّحِيح|فِي الصَّحِيح|وَقَالَ ابْن|قَالَ ابْن|وَعَن ابْن|عَن ابْن|وَعَن أبي|عَن أبي|وَعَن|عَن|وَقَالَ|قَالَ|وروى|روى)/g;
    
    formatted = formatted.replace(narratorsRegex, '<span class="section-break"></span><span class="narrator-text">$1</span>');

    // إخفاء اسم الكبيرة في البداية إن ظهر مكرراً
    formatted = formatted.replace(/^(الْكَبِيرَة [^\s]+ [^\s]+)/, '');

    return formatted;
}

function openModal(id) {
    const sin = sins.find(s => s.id === id);
    document.getElementById('modalSinTitle').innerText = `${sin.id}. ${sin.title}`;
    
    const formattedHTML = formatArabicHTML(sin.full_content);
    const textBody = document.getElementById('modalTextBody');
    textBody.innerHTML = formattedHTML;
    
    document.getElementById('modalBtnLink').href = sin.url;
    
    const modal = document.getElementById('sourceModal');
    modal.style.display = 'flex';
    
    // إعادة التمرير للصفر فوراً ثم بعد فتح النافذة لضمان الاستجابة من المتصفح
    textBody.scrollTop = 0;
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
        
        let cleanTextForPreview = fixStuckWords(sin.full_content).replace(/[\{\}]/g, '');
        let shortDesc = cleanTextForPreview.replace(/^(الْكَبِيرَة [^\s]+ [^\s]+ )/, '');
        shortDesc = shortDesc.substring(0, 160) + "...";

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