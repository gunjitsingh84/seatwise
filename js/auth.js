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
