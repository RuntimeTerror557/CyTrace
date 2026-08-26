const { parseEmail } = require('./utils/emailParser');
const { analyzeHeaders } = require('./utils/headerAnalyzer');

const testEmail = `From: support@fake-bank.com
To: victim@company.com
Subject: Urgent Account Verification
Date: Mon, 26 Aug 2026 10:00:00 +0000
Message-ID: <123456789@fake-bank.com>
Return-Path: <support@fake-bank.com>
Reply-To: attacker@evil-example.com
Received: from suspicious-server.example (192.0.2.50)
    by mail.company.com with ESMTP;
    Mon, 26 Aug 2026 10:00:00 +0000
Authentication-Results: mail.company.com;
    spf=fail smtp.mailfrom=fake-bank.com;
    dkim=fail;
    dmarc=fail header.from=fake-bank.com

Content-Type: text/plain

Dear Customer,

Please verify your account immediately.
`;

async function testHeaderAnalyzer() {
    try {
        const parsedEmail = await parseEmail(testEmail);

        const result = analyzeHeaders(parsedEmail);

        console.log('✅ Header analysis successful');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('❌ Header analysis failed');
        console.error(error);
    }
}

testHeaderAnalyzer();