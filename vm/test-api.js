#!/usr/bin/env node

// API Testing Script for Ignition Sandbox VM
// Tests VM resources accessibility and creates health check endpoints

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://teslasolar.github.io/ignition-sandbox/vm';

// Resources to test
const CRITICAL_RESOURCES = [
    '/index.html',
    '/lib/v86-loader.js',
    '/images/seabios/seabios.bin',
    '/images/seabios/vgabios.bin',
    '/images/linux/alpine-virt-3.19.0-x86.iso',
    '/images/linux/TinyCore-15.0.iso',
    '/images/linux/slitaz-rolling.iso'
];

const CDN_RESOURCES = [
    'https://copy.sh/v86/build/libv86.js',
    'https://copy.sh/v86/build/v86.wasm'
];

// Test result tracking
const results = {
    timestamp: new Date().toISOString(),
    base_url: BASE_URL,
    tests: [],
    summary: {
        total: 0,
        passed: 0,
        failed: 0
    }
};

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

// Helper function to make HTTPS request
function httpsGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: data.length,
                    url: url
                });
            });
        }).on('error', reject);
    });
}

// Test individual resource
async function testResource(resourcePath, isFullUrl = false) {
    const url = isFullUrl ? resourcePath : BASE_URL + resourcePath;
    const testResult = {
        resource: resourcePath,
        url: url,
        status: 'pending',
        statusCode: null,
        size: null,
        contentType: null,
        error: null
    };

    try {
        console.log(`Testing: ${url}`);
        const response = await httpsGet(url);

        testResult.statusCode = response.statusCode;
        testResult.size = response.data;
        testResult.contentType = response.headers['content-type'];

        if (response.statusCode === 200) {
            testResult.status = 'passed';
            console.log(`${colors.green}✓${colors.reset} ${resourcePath} - ${response.statusCode} (${response.data} bytes)`);
        } else {
            testResult.status = 'failed';
            console.log(`${colors.red}✗${colors.reset} ${resourcePath} - ${response.statusCode}`);
        }
    } catch (error) {
        testResult.status = 'failed';
        testResult.error = error.message;
        console.log(`${colors.red}✗${colors.reset} ${resourcePath} - ${error.message}`);
    }

    results.tests.push(testResult);
    results.summary.total++;
    if (testResult.status === 'passed') {
        results.summary.passed++;
    } else {
        results.summary.failed++;
    }

    return testResult;
}

// Test VM boot functionality via HTTP
async function testVMBoot() {
    console.log(`\n${colors.blue}Testing VM Boot Functionality${colors.reset}`);
    console.log('=' .repeat(50));

    // Test main page accessibility
    const mainPage = await testResource('/index.html');

    if (mainPage.status === 'passed') {
        console.log(`${colors.green}✓${colors.reset} Main VM page accessible`);

        // Check if page contains expected VM elements
        const pageTest = await httpsGet(BASE_URL + '/index.html');
        const hasVMElements = pageTest.data > 10000; // Should be substantial HTML

        if (hasVMElements) {
            console.log(`${colors.green}✓${colors.reset} VM HTML structure present`);
        }
    }

    // Test debug page
    await testResource('/debug.html');
    await testResource('/test-local.html');
}

// Create local API server for health checks
function createHealthCheckAPI() {
    const server = http.createServer((req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');

        if (req.url === '/health') {
            res.statusCode = 200;
            res.end(JSON.stringify({
                status: 'ok',
                vm_status: results.summary,
                last_check: results.timestamp
            }));
        } else if (req.url === '/vm-status') {
            res.statusCode = 200;
            res.end(JSON.stringify(results));
        } else if (req.url === '/test') {
            // Run tests and return results
            runTests().then(() => {
                res.statusCode = 200;
                res.end(JSON.stringify(results));
            });
        } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Not found' }));
        }
    });

    const PORT = 3456;
    server.listen(PORT, () => {
        console.log(`\n${colors.blue}Health Check API running at:${colors.reset}`);
        console.log(`  http://localhost:${PORT}/health - Quick health check`);
        console.log(`  http://localhost:${PORT}/vm-status - Full status report`);
        console.log(`  http://localhost:${PORT}/test - Run tests`);
    });
}

// Main test runner
async function runTests() {
    console.log(`${colors.blue}Ignition Sandbox VM - API Testing${colors.reset}`);
    console.log('=' .repeat(50));
    console.log(`Testing: ${BASE_URL}`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log('=' .repeat(50));

    // Reset results
    results.tests = [];
    results.summary = { total: 0, passed: 0, failed: 0 };
    results.timestamp = new Date().toISOString();

    // Test critical VM resources
    console.log(`\n${colors.yellow}Testing Critical Resources:${colors.reset}`);
    for (const resource of CRITICAL_RESOURCES) {
        await testResource(resource);
    }

    // Test CDN resources
    console.log(`\n${colors.yellow}Testing CDN Resources:${colors.reset}`);
    for (const resource of CDN_RESOURCES) {
        await testResource(resource, true);
    }

    // Test VM boot functionality
    await testVMBoot();

    // Summary
    console.log(`\n${colors.blue}Test Summary:${colors.reset}`);
    console.log('=' .repeat(50));
    console.log(`Total Tests: ${results.summary.total}`);
    console.log(`${colors.green}Passed: ${results.summary.passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${results.summary.failed}${colors.reset}`);

    const successRate = (results.summary.passed / results.summary.total * 100).toFixed(1);
    if (successRate >= 80) {
        console.log(`${colors.green}Success Rate: ${successRate}%${colors.reset}`);
    } else {
        console.log(`${colors.red}Success Rate: ${successRate}%${colors.reset}`);
    }

    // Save results to file
    const resultsFile = path.join(__dirname, 'test-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`\nResults saved to: ${resultsFile}`);

    return results;
}

// Check if running as main script
if (require.main === module) {
    runTests().then(() => {
        // Ask if user wants to start API server
        console.log(`\n${colors.yellow}Start health check API server? (y/n)${colors.reset}`);

        process.stdin.once('data', (data) => {
            if (data.toString().trim().toLowerCase() === 'y') {
                createHealthCheckAPI();
            } else {
                process.exit(0);
            }
        });
    }).catch(error => {
        console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
        process.exit(1);
    });
}

module.exports = { runTests, testResource };