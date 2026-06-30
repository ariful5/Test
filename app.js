const axios = require('axios');

// কনফিগারেশন
const config = {
    BASE_URL: 'https://www.jeevansathi.com/app-gateway',
    PROFILE_CHECK: '/jsprofilecreator/v1/profile-exists',
    OTP_SEND: '/auth/v1/phone/otp'
};

// Headers সেট করুন
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Origin': 'https://www.jeevansathi.com',
    'Referer': 'https://www.jeevansathi.com/login?source=home_hero',
    'X-Requested-With': 'XMLHttpRequest',
    'js-user-agent': 'JSMS',
    'jb-profile-identifier': 'js-profile-identifier'
});

// ১. প্রোফাইল চেক করুন
async function checkProfile(phoneNumber, isd = '91') {
    try {
        console.log(`\n📱 প্রোফাইল চেক করছি: ${phoneNumber}...`);
        
        const url = `${config.BASE_URL}${config.PROFILE_CHECK}?phoneNumber=${phoneNumber}&isd=${isd}`;
        
        const response = await axios.get(url, {
            headers: getHeaders()
        });
        
        console.log('✅ প্রোফাইল চেক সফল:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ প্রোফাইল চেক ব্যর্থ:', error.message);
        return null;
    }
}

// ২. OTP সেন্ড করুন
async function sendOTP(phoneNumber, isd = '91', otpType = 'LOGIN_PROFILE') {
    try {
        console.log(`\n📤 OTP পাঠাচ্ছি: ${phoneNumber}...`);
        
        const url = `${config.BASE_URL}${config.OTP_SEND}`;
        
        const payload = {
            userId: phoneNumber,
            isd: isd,
            otpType: otpType
        };
        
        const response = await axios.post(url, payload, {
            headers: getHeaders()
        });
        
        console.log('✅ OTP সফলভাবে পাঠানো হয়েছে!');
        console.log('📧 Status:', response.status);
        return true;
    } catch (error) {
        console.error('❌ OTP পাঠানো ব্যর্থ:', error.response?.data || error.message);
        return false;
    }
}

// ৩. মূল অটোমেশন ফাংশন
async function automateRegistration(phoneNumber, isd = '91') {
    try {
        console.log('\n🚀 ========== JeevanSathi OTP অটোমেশন শুরু ==========');
        
        // ধাপ ১: প্রোফাইল চেক করুন
        const profileCheck = await checkProfile(phoneNumber, isd);
        
        if (!profileCheck) {
            console.log('⚠️ প্রোফাইল চেক করা যায়নি');
            return false;
        }
        
        // ২-৩ সেকেন্ড অপেক্ষা করুন
        console.log('\n⏳ ২ সেকেন্ড অপেক্ষা করছি...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // ধাপ ২: OTP পাঠান
        const otpResult = await sendOTP(phoneNumber, isd);
        
        if (otpResult) {
            console.log('\n✨ OTP সফলভাবে পাঠানো হয়েছে!');
            console.log(`📱 নম্বর: ${phoneNumber}`);
            console.log('⏱️  OTP আপনার ফোনে আসবে...');
            console.log('🚀 ========== প্রক্রিয়া সম্পন্ন ==========\n');
            return true;
        } else {
            console.log('\n❌ OTP পাঠাতে ব্যর্থ হয়েছে');
            return false;
        }
    } catch (error) {
        console.error('❌ অটোমেশন ত্রুটি:', error.message);
        return false;
    }
}

// ৪. একাধিক নম্বর প্রসেস করুন
async function processBatch(phoneNumbers) {
    console.log('\n📊 ব্যাচ প্রসেসিং শুরু...');
    
    for (const phoneNumber of phoneNumbers) {
        await automateRegistration(phoneNumber);
        
        // প্রতিটির মধ্যে ৫ সেকেন্ড অপেক্ষা করুন
        if (phoneNumbers.indexOf(phoneNumber) < phoneNumbers.length - 1) {
            console.log('⏳ পরবর্তী নম্বরের জন্য ৫ সেকেন্ড অপেক্ষা...\n');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    
    console.log('✅ সব নম্বর প্রসেস সম্পন্ন!');
}

// ===== মেইন এক্সিকিউশন =====

// ব্যবহার করুন:
const phoneNumbers = [
    '9102808298',  // একক নম্বর পরীক্ষা করুন
    // '9876543210',
    // '9123456789'
];

// অটোমেশন চালান
processBatch(phoneNumbers).catch(console.error);

// এক্সপোর্ট করুন (অন্য ফাইল থেকে ব্যবহারের জন্য)
module.exports = { automateRegistration, sendOTP, checkProfile };
