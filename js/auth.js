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
