const SEATWISE_SUPABASE_URL = 'https://axhyzxuclxjojhtispqp.supabase.co';
const SEATWISE_SUPABASE_KEY = 'sb_publishable_6biluj5Hfmtz3tplDaO6qw_ektOIx3h';

const seatwiseDb = supabase.createClient(
    SEATWISE_SUPABASE_URL,
    SEATWISE_SUPABASE_KEY
);

function setSeatwiseSession(user) {
    sessionStorage.setItem('seatwiseUser', JSON.stringify({
        id: user.id,
        name: user.name,
        phone: user.phone
    }));
}

function getSeatwiseSession() {
    try {
        const value = sessionStorage.getItem('seatwiseUser');
        return value ? JSON.parse(value) : null;
    } catch (error) {
        return null;
    }
}

function clearSeatwiseSession() {
    sessionStorage.removeItem('seatwiseUser');
    sessionStorage.removeItem('seatwiseAdmin');
}

function requireSeatwiseLogin() {
    const user = getSeatwiseSession();
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    return user;
}

async function logActivity(action, details = {}, userId = null) {
    const user = getSeatwiseSession();
    const id = userId || user?.id || null;

    const { error } = await seatwiseDb
        .from('activity_logs')
        .insert({
            user_id: id,
            action,
            details
        });

    if (error) {
        console.error('Activity log error:', error);
    }
}

async function findAdminByPhone(phone) {
    const normalizedPhone = phone.replace(/\D/g, '');

    const { data, error } = await seatwiseDb
        .from('admin_users')
        .select('id,name,phone,pin,must_change_pin')
        .eq('phone', normalizedPhone)
        .maybeSingle();

    return { data, error };
}

async function changeAdminPin(userId, newPin) {
    const { data, error } = await seatwiseDb
        .from('admin_users')
        .update({
            pin: newPin,
            must_change_pin: false
        })
        .eq('id', userId)
        .select('id,name,phone,must_change_pin')
        .single();

    return { data, error };
}

function normalizePhone(value) {
    return value.replace(/\D/g, '');
}

/*
 * SeatWise Academic Session
 * Academic year runs from 1 April through 31 March.
 * Example: 1 Apr 2026 - 31 Mar 2027 = 2026-2027.
 */
function getCurrentAcademicSession(date = new Date()) {
    const month = date.getMonth();
    const year = date.getFullYear();
    const startYear = month >= 3 ? year : year - 1;
    return `${startYear}-${startYear + 1}`;
}

async function ensureCurrentAcademicSession() {
    const sessionName = getCurrentAcademicSession();
    const startYear = Number(sessionName.slice(0, 4));

    const startDate = `${startYear}-04-01`;
    const endDate = `${startYear + 1}-03-31`;

    const { error } = await seatwiseDb
        .from('academic_sessions')
        .upsert(
            {
                session_name: sessionName,
                start_date: startDate,
                end_date: endDate
            },
            { onConflict: 'session_name' }
        );

    if (error) {
        console.error('Academic session error:', error);
    }

    return sessionName;
}

/* Show the current academic session wherever a saved class structure exists. */
async function initializeAcademicSessionUI() {
    const savedHead = document.querySelector('.saved-head');
    if (!savedHead) return;

    const sessionName = await ensureCurrentAcademicSession();
    const description = savedHead.querySelector('p');

    if (description) {
        description.textContent = `Current Session: ${sessionName}`;
    }
}

/* Route the login keypad to the 10 phone boxes first. */
(function setupLoginPhoneKeypad() {
    function getPhoneInputs() {
        return Array.from(document.querySelectorAll('#loginPhoneDigits .phone-digit'));
    }

    function getPhoneValue() {
        return getPhoneInputs().map(input => input.value).join('');
    }

    function addPhoneDigit(digit) {
        const inputs = getPhoneInputs();
        const nextIndex = inputs.findIndex(input => !input.value);
        if (nextIndex === -1) return;

        inputs[nextIndex].value = digit;

        if (nextIndex < inputs.length - 1) {
            inputs[nextIndex + 1].focus();
        } else {
            const pinBox = document.querySelector('#pinContainer .pin-box');
            if (pinBox) pinBox.classList.add('ready');
        }
    }

    function clearPhone() {
        const inputs = getPhoneInputs();
        inputs.forEach(input => input.value = '');
        if (inputs[0]) inputs[0].focus();
    }

    document.addEventListener('click', function(event) {
        const key = event.target.closest('.key[data-number]');
        const clear = event.target.closest('#clearButton');
        if (!key && !clear) return;

        const phone = getPhoneValue();

        if (key && phone.length < 10) {
            event.preventDefault();
            event.stopImmediatePropagation();
            addPhoneDigit(key.dataset.number);
            return;
        }

        if (clear && phone.length < 10) {
            event.preventDefault();
            event.stopImmediatePropagation();
            clearPhone();
        }
    }, true);
})();

/* Saved Class Structure layout: full-width class cards with a three-column section grid. */
(function applySavedClassReferenceLayout() {
    if (!document.querySelector('.saved-grid')) return;

    const style = document.createElement('style');
    style.id = 'seatwise-saved-class-reference-layout';
    style.textContent = `
        .saved-grid {
            display: block !important;
        }

        .saved-grid .class-card {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            margin: 0 0 18px 0 !important;
            width: 100%;
        }

        .saved-grid .class-card:last-child {
            margin-bottom: 0 !important;
        }

        .saved-grid .class-head {
            grid-column: 1 / -1;
            width: 100%;
        }

        .saved-grid .section-row {
            min-width: 0;
            border-bottom: 1px solid #eef1f5;
            border-right: 1px solid #eef1f5;
        }

        .saved-grid .section-row:nth-child(3n) {
            border-right: 0;
        }

        .saved-grid .section-row:last-child {
            border-bottom: 0;
        }

        @media (max-width: 1100px) {
            .saved-grid .class-card {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
            .saved-grid .section-row:nth-child(3n) {
                border-right: 1px solid #eef1f5;
            }
            .saved-grid .section-row:nth-child(2n) {
                border-right: 0;
            }
        }

        @media (max-width: 650px) {
            .saved-grid .class-card {
                grid-template-columns: 1fr;
            }
            .saved-grid .section-row,
            .saved-grid .section-row:nth-child(2n),
            .saved-grid .section-row:nth-child(3n) {
                border-right: 0;
            }
        }
    `;
    document.head.appendChild(style);
})();

/* Keep the main navigation consistent across every SeatWise page. */
(function initializeGlobalSidebar() {
    function applySidebar() {
        const nav = document.querySelector('.nav');
        if (!nav) return;

        const file = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
        const items = [
            ['dashboard.html', '▦', 'Dashboard'],
            ['students.html', '♙', 'Classes & Sections'],
            ['rooms.html', '⌂', 'Rooms'],
            ['subjects.html', '◈', 'Subjects'],
            ['#', '◫', 'Exam Planner'],
            ['#', '▤', 'Exams'],
            ['#', '◧', 'Seating Plans'],
            ['#', '◷', 'History']
        ];

        nav.innerHTML = '<div class="nav-label">Main Menu</div>' + items.map(([href, icon, label]) => {
            const active = href !== '#' && href === file ? ' class="active"' : '';
            const target = href === '#' ? ' href="#"' : ` href="${href}"`;
            return `<a${target}${active}><span class="nav-icon">${icon}</span>${label}</a>`;
        }).join('');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applySidebar);
    } else {
        applySidebar();
    }
})();

document.addEventListener('DOMContentLoaded', initializeAcademicSessionUI);
