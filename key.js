const fs = require('fs');
const { ethers } = require('ethers');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { machineIdSync } = require('node-machine-id');
const readline = require('readline');

// ======================== [ ĐỊNH NGHĨA MÀU SẮC (ANSI) ] ========================
const reset = "\x1b[0m";
const green = "\x1b[32m";
const magenta = "\x1b[35m";
const white = "\x1b[37m";
const gray = "\x1b[90m";
const blue = "\x1b[34m";
const yellow = "\x1b[33m";
const red = "\x1b[31m";
const cyan = "\x1b[36m";

// ======================== [ CẤU HÌNH LICENSE ] ========================
const LICENSE_SETTINGS = {
    serverUrl: "https://server-50us-1.onrender.com", 
    licenseFile: "./license.txt"
};

// ======================== [ CẤU HÌNH TOOL ] ========================
const MAX_THREADS = 5;          
const TARGET_ACCOUNTS = 100000;   
const SUCCESS_FILE = 'success.txt';

// ======================== [ HÀM HỖ TRỢ LICENSE ] ========================
const getLogTime = () => `${gray}[${new Date().toLocaleTimeString()}]${reset}`;

function askLicenseKey() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        console.log(`${cyan}--------------------------------------------------${reset}`);
        rl.question(`${yellow}=> License Key : ${reset}`, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function checkLicense() {
    console.log(`${getLogTime()} ${blue}[LICENSE]${reset} Đang kiểm tra bản quyền thiết bị...`);
    
    try {
        const hwid = machineIdSync();
        let key = "";

        if (fs.existsSync(LICENSE_SETTINGS.licenseFile)) {
            key = fs.readFileSync(LICENSE_SETTINGS.licenseFile, 'utf8').trim();
        }

        if (!key || key === "" || key.length < 5) {
            key = await askLicenseKey();
            if (!key) {
                console.log(`${red}=> Lỗi: Bạn không nhập Key. Tool sẽ tự đóng!${reset}`);
                process.exit(0);
            }
            fs.writeFileSync(LICENSE_SETTINGS.licenseFile, key, 'utf8');
        }

        const response = await axios.post(`${LICENSE_SETTINGS.serverUrl}/verify`, {
            key: key,
            hwid: hwid
        }, { timeout: 15000 });

        const data = response.data;

        if (data.status === "ok") {
            console.log(`${getLogTime()} ${green}[LICENSE] Xác thực thành công!${reset}`);
            console.log(`${getLogTime()} ${green}[LICENSE] HWID: ${white}${hwid}${reset}`);
            
            if (data.bind === "new") {
                console.log(`${getLogTime()} ${magenta}[LICENSE] Đã kích hoạt máy mới trên hệ thống.${reset}`);
            }
            console.log(`${cyan}--------------------------------------------------${reset}`);
            return true;
        } else {
            const errorMap = {
                "invalid": "Key này không tồn tại trên hệ thống!",
                "expired": "Key của bạn đã hết hạn sử dụng!",
                "hwid_mismatch": "Key đã được sử dụng cho một máy tính khác!"
            };
            
            console.log(`${red}\n[LỖI BẢN QUYỀN]: ${errorMap[data.status] || "Không rõ lỗi"}${reset}`);
            console.log(`${yellow}HWID máy bạn: ${hwid}${reset}`);
            
            fs.writeFileSync(LICENSE_SETTINGS.licenseFile, ""); 
            process.exit(0);
        }
    } catch (error) {
        console.log(`${red}\n[LỖI KẾT NỐI]: Không thể liên lạc với Server License!${reset}`);
        console.log(`${red}Chi tiết: ${error.message}${reset}`);
        process.exit(0);
    }
}

// ======================== [ HÀM HỖ TRỢ TOOL ] ========================
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const randomString = (len) => Math.random().toString(36).substring(2, 2 + len);

function getTimestamp() {
    return new Date().toLocaleTimeString('vi-VN', { hour12: false }).replace(/:/g, '.');
}

function shortAddr(addr) {
    return `${addr.slice(0, 7)}.....${addr.slice(-5)}`;
}

function customLog(index, total, ip, address, content, point = "") {
    const timePart = `${green}[ ${getTimestamp()} ]${reset}`;
    const infoPart = `Ví ${index}/${total} | IP : ${ip} | ${shortAddr(address)}`;
    const contentPart = `${green}${content}${reset}`;
    const pointPart = point ? `| ${magenta}${point}${reset}` : "";
    
    console.log(`${timePart} ${infoPart} | ${contentPart} ${pointPart}`);
}

const readFile = (p) => fs.existsSync(p) ? fs.readFileSync(p, 'utf8').split('\n').filter(Boolean).map(l => l.trim()) : [];

// ======================== [ KHỞI TẠO DỮ LIỆU ] ========================
const PROXIES = readFile('proxy.txt');
const REF_CODES = readFile('ref.txt');
const USER_AGENTS = readFile('user_agents.txt');

if (PROXIES.length === 0 || REF_CODES.length === 0) {
    console.log(`Loi: Kiem tra file proxy.txt va ref.txt!`);
    process.exit(1);
}

// ======================== [ XỬ LÝ CHÍNH ] ========================
async function getIP(proxy) {
    try {
        const agent = new HttpsProxyAgent(proxy);
        const res = await axios.get('https://api.ipify.org?format=json', { httpsAgent: agent, timeout: 5000 });
        return res.data.ip;
    } catch { return null; }
}

async function createMail(proxy) {
    const agent = new HttpsProxyAgent(proxy);
    try {
        const domains = await axios.get('https://api.mail.tm/domains', { httpsAgent: agent, timeout: 10000 });
        const domain = domains.data['hydra:member'][0].domain;
        const email = `${randomString(10)}@${domain}`;
        const password = randomString(12);
        await axios.post('https://api.mail.tm/accounts', { address: email, password }, { httpsAgent: agent });
        const tokenRes = await axios.post('https://api.mail.tm/token', { address: email, password }, { httpsAgent: agent });
        return { email, password, token: tokenRes.data.token };
    } catch { return null; }
}

async function getMailOtp(token, proxy) {
    const agent = new HttpsProxyAgent(proxy);
    for (let i = 0; i < 12; i++) {
        try {
            const res = await axios.get('https://api.mail.tm/messages', {
                headers: { Authorization: `Bearer ${token}` },
                httpsAgent: agent
            });
            if (res.data['hydra:member']?.length) {
                const msg = await axios.get(`https://api.mail.tm/messages/${res.data['hydra:member'][0].id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    httpsAgent: agent
                });
                const code = (msg.data.text || msg.data.intro).match(/\b\d{6}\b/);
                if (code) return code[0];
            }
        } catch {}
        await sleep(5000);
    }
    return null;
}

async function request(method, url, data, config, proxy) {
    const agent = new HttpsProxyAgent(proxy);
    const headers = {
        'authority': 'api.fairshares.io',
        'authorization': config.token ? `jwt ${config.token}` : undefined,
        'user-agent': config.ua,
        'origin': 'https://app.fairshares.io',
        'referer': 'https://app.fairshares.io/'
    };
    try {
        const res = await axios({ method, url, data, headers, httpsAgent: agent, timeout: 15000, validateStatus: false });
        return res.data;
    } catch { return { error: true }; }
}

async function processAccount(index, total) {
    const wallet = ethers.Wallet.createRandom();
    const address = wallet.address.toLowerCase();
    const proxy = PROXIES[index % PROXIES.length];
    const ua = USER_AGENTS[index % USER_AGENTS.length] || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    
    let ip = await getIP(proxy);
    if (!ip) return false;

    const msg = "Welcome to FairShares\n\nSign this message to join the FairShares waitlist.\nThis signature does not trigger any blockchain transaction.";
    const sig = await wallet.signMessage(msg);
    const login = await request('POST', 'https://api.fairshares.io/user_public/evm_connect', 
        { walletAddress: address, signature: sig, message: msg }, { ua }, proxy);

    if (!login?.data?.token) return false;
    const token = login.data.token;
    customLog(index + 1, total, ip, address, "Login successful");

    let refRaw = REF_CODES[Math.floor(Math.random() * REF_CODES.length)];
    const ref = refRaw.includes('=') ? refRaw.split('=').pop() : refRaw;
    const bindRes = await request('GET', `https://api.fairshares.io/user/bind_invite?inviteCode=${ref}`, null, { token, ua }, proxy);
    customLog(index + 1, total, ip, address, `Bind Ref successful : ${ref}`);

    const mail = await createMail(proxy);
    if (!mail) return false;

    const send = await request('POST', 'https://api.fairshares.io/email/send_code', { email: mail.email }, { token, ua }, proxy);
    if (send?.code === 200) {
        const otp = await getMailOtp(mail.token, proxy);
        if (otp) {
            const bindEmail = await request('POST', 'https://api.fairshares.io/email/bind_email', { email: mail.email, code: otp }, { token, ua }, proxy);
            if (bindEmail?.code === 200) {
                customLog(index + 1, total, ip, address, "Email Verification Successful");
                fs.appendFileSync(SUCCESS_FILE, `${address}|${wallet.privateKey}|${mail.email}|${mail.password}\n`);
                return true;
            }
        }
    }
    return false;
}

// ======================== [ KHỞI CHẠY ] ========================
async function main() {
    // 1. Kiểm tra bản quyền trước
    await checkLicense();

    console.log(`${cyan}====================================================${reset}`);
    console.log(`${cyan}   FAIRSHARES AUTOMATOR - PM2 OPTIMIZED MODE        ${reset}`);
    console.log(`${cyan}====================================================${reset}`);
    
    let successCount = 0;
    let currentTask = 0;

    const worker = async () => {
        while (successCount < TARGET_ACCOUNTS) {
            let taskId = currentTask++;
            let isOk = await processAccount(taskId, TARGET_ACCOUNTS);
            if (isOk) successCount++;
            await sleep(1000); 
        }
    };

    const threads = [];
    for (let i = 0; i < MAX_THREADS; i++) {
        threads.push(worker());
        await sleep(1500);
    }

    await Promise.all(threads);
    console.log(`Da hoan thanh muc tieu ${TARGET_ACCOUNTS} tai khoan!`);
}

main();