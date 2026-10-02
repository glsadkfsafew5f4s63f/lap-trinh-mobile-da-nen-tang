const crypto = require('crypto');

const CREATE_URL = process.env.MOMO_CREATE_URL || 'https://test-payment.momo.vn/v2/gateway/api/create';
const REFUND_URL = process.env.MOMO_REFUND_URL || 'https://test-payment.momo.vn/v2/gateway/api/refund';

function isMockPaymentEnabled() {
    return process.env.MOMO_MOCK_PAYMENTS === 'true' && process.env.NODE_ENV !== 'production';
}

function config() {
    const values = {
        partnerCode: process.env.MOMO_PARTNER_CODE,
        accessKey: process.env.MOMO_ACCESS_KEY,
        secretKey: process.env.MOMO_SECRET_KEY,
        ipnUrl: process.env.MOMO_IPN_URL,
        redirectUrl: process.env.MOMO_REDIRECT_URL || 'anhuyqa://payment-result',
    };
    const missing = Object.entries(values)
        .filter(([key, value]) => key !== 'redirectUrl' && !value)
        .map(([key]) => key);
    if (missing.length) {
        throw new Error(`Thiếu cấu hình MoMo: ${missing.join(', ')}.`);
    }
    return values;
}

function signature(raw, secretKey) {
    return crypto.createHmac('sha256', secretKey).update(raw, 'utf8').digest('hex');
}

function secureEqual(left, right) {
    const leftBuffer = Buffer.from(String(left || ''), 'utf8');
    const rightBuffer = Buffer.from(String(right || ''), 'utf8');
    return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function createSignature(data, accessKey) {
    return [
        `accessKey=${accessKey}`,
        `amount=${data.amount}`,
        `extraData=${data.extraData}`,
        `ipnUrl=${data.ipnUrl}`,
        `orderId=${data.orderId}`,
        `orderInfo=${data.orderInfo}`,
        `partnerCode=${data.partnerCode}`,
        `redirectUrl=${data.redirectUrl}`,
        `requestId=${data.requestId}`,
        `requestType=${data.requestType}`,
    ].join('&');
}

function refundSignature(data, accessKey) {
    return [
        `accessKey=${accessKey}`,
        `amount=${data.amount}`,
        `description=${data.description}`,
        `orderId=${data.orderId}`,
        `partnerCode=${data.partnerCode}`,
        `requestId=${data.requestId}`,
        `transId=${data.transId}`,
    ].join('&');
}

function verifyIpn(data) {
    const settings = config();
    const raw = [
        `accessKey=${settings.accessKey}`,
        `amount=${data.amount}`,
        `extraData=${data.extraData}`,
        `message=${data.message}`,
        `orderId=${data.orderId}`,
        `orderInfo=${data.orderInfo}`,
        `orderType=${data.orderType}`,
        `partnerCode=${data.partnerCode}`,
        `payType=${data.payType}`,
        `requestId=${data.requestId}`,
        `responseTime=${data.responseTime}`,
        `resultCode=${data.resultCode}`,
        `transId=${data.transId}`,
    ].join('&');
    return data.partnerCode === settings.partnerCode && secureEqual(data.signature, signature(raw, settings.secretKey));
}

async function post(url, body) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result) {
        const resultCode = result?.resultCode == null ? '' : `, mã ${result.resultCode}`;
        const message = result?.message ? `: ${result.message}` : '';
        throw new Error(`MoMo phản hồi HTTP ${response.status}${resultCode}${message}.`);
    }
    return result;
}

async function createPayment({ amount, orderId, requestId, orderInfo }) {
    const settings = config();
    const data = {
        partnerCode: settings.partnerCode,
        accessKey: settings.accessKey,
        requestId,
        amount: String(Math.round(Number(amount))),
        orderId,
        orderInfo,
        redirectUrl: settings.redirectUrl,
        ipnUrl: settings.ipnUrl,
        extraData: '',
        requestType: 'captureWallet',
        lang: 'vi',
    };
    data.signature = signature(createSignature(data, settings.accessKey), settings.secretKey);
    const result = await post(CREATE_URL, data);
    if (Number(result.resultCode) !== 0 || !result.payUrl) {
        throw new Error(result.message || 'MoMo không tạo được giao dịch.');
    }
    return { payUrl: result.payUrl, redirectUrl: settings.redirectUrl };
}

async function refundPayment({ amount, orderId, requestId, transId, description }) {
    const settings = config();
    const data = {
        partnerCode: settings.partnerCode,
        accessKey: settings.accessKey,
        requestId,
        amount: String(Math.round(Number(amount))),
        orderId,
        transId: String(transId),
        description,
        lang: 'vi',
    };
    data.signature = signature(refundSignature(data, settings.accessKey), settings.secretKey);
    const result = await post(REFUND_URL, data);
    if (Number(result.resultCode) !== 0) {
        throw new Error(result.message || 'MoMo từ chối yêu cầu hoàn tiền.');
    }
    return result;
}

module.exports = { createPayment, refundPayment, verifyIpn, isMockPaymentEnabled };
