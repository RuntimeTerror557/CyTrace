const { analyzeUrls } = require('./utils/urlAnalyzer');

const html = `
<html>
<body>
    <p>Your account has been suspended.</p>

    <a href="http://bit.ly/fake-verify-link">
        Verify Account
    </a>

    <a href="https://example.com/safe-page">
        Help
    </a>
</body>
</html>
`;

const text = `
Please verify your account immediately:
http://bit.ly/fake-verify-link
`;

const result = analyzeUrls(html, text);

console.log('✅ URL analysis successful');
console.log(JSON.stringify(result, null, 2));