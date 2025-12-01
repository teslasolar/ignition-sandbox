#!/usr/bin/env node

/**
 * Direct VM Testing - Tests the live GitHub Pages deployment
 */

const https = require('https');

console.log('🧪 Direct VM Testing');
console.log('Testing: https://teslasolar.github.io/ignition-sandbox/vm/');
console.log('=' .repeat(60));

// Test 1: Check main VM page
async function testMainPage() {
    console.log('\n📄 Test 1: Main VM Page');
    return new Promise((resolve) => {
        https.get('https://teslasolar.github.io/ignition-sandbox/vm/', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const hasV86Loader = data.includes('v86-loader.js');
                const hasBootOptions = data.includes('Alpine Linux') && data.includes('TinyCore');
                const hasVMObject = data.includes('const VM={');
                const hasMessageHandler = data.includes('vm-command');

                console.log('  ✓ Page loads: ' + (res.statusCode === 200 ? 'Yes' : 'No'));
                console.log('  ✓ V86 loader present: ' + (hasV86Loader ? 'Yes' : 'No'));
                console.log('  ✓ Boot options present: ' + (hasBootOptions ? 'Yes' : 'No'));
                console.log('  ✓ VM object defined: ' + (hasVMObject ? 'Yes' : 'No'));
                console.log('  ✓ API handler present: ' + (hasMessageHandler ? 'Yes' : 'No'));

                resolve(res.statusCode === 200 && hasV86Loader && hasBootOptions);
            });
        });
    });
}

// Test 2: Check V86 CDN availability
async function testV86CDN() {
    console.log('\n🌐 Test 2: V86 CDN Resources');
    const resources = [
        { name: 'libv86.js', url: 'https://copy.sh/v86/build/libv86.js' },
        { name: 'v86.wasm', url: 'https://copy.sh/v86/build/v86.wasm' }
    ];

    for (const resource of resources) {
        await new Promise((resolve) => {
            https.get(resource.url, (res) => {
                console.log(`  ✓ ${resource.name}: ${res.statusCode === 200 ? 'Available' : 'Not Found'}`);
                resolve();
            }).on('error', (e) => {
                console.log(`  ✗ ${resource.name}: Error - ${e.message}`);
                resolve();
            });
        });
    }
}

// Test 3: Check Linux ISOs
async function testLinuxISOs() {
    console.log('\n🐧 Test 3: Linux ISO Files');
    const isos = [
        { name: 'Alpine', path: '/images/linux/alpine-virt-3.19.0-x86.iso' },
        { name: 'TinyCore', path: '/images/linux/TinyCore-15.0.iso' },
        { name: 'SliTaz', path: '/images/linux/slitaz-rolling.iso' }
    ];

    for (const iso of isos) {
        await new Promise((resolve) => {
            https.get('https://teslasolar.github.io/ignition-sandbox/vm' + iso.path, (res) => {
                const size = res.headers['content-length'];
                const sizeMB = size ? (parseInt(size) / 1024 / 1024).toFixed(1) : '?';
                console.log(`  ✓ ${iso.name}: ${res.statusCode === 200 ? `Available (${sizeMB} MB)` : 'Not Found'}`);
                resolve();
            }).on('error', (e) => {
                console.log(`  ✗ ${iso.name}: Error`);
                resolve();
            });
        });
    }
}

// Test 4: Check BIOS files
async function testBIOS() {
    console.log('\n💾 Test 4: BIOS Files');
    const files = [
        { name: 'SeaBIOS', path: '/images/seabios/seabios.bin', expectedSize: 131072 },
        { name: 'VGA BIOS', path: '/images/seabios/vgabios.bin', expectedSize: 36352 }
    ];

    for (const file of files) {
        await new Promise((resolve) => {
            https.get('https://teslasolar.github.io/ignition-sandbox/vm' + file.path, (res) => {
                const size = parseInt(res.headers['content-length'] || 0);
                const sizeOk = size === file.expectedSize;
                console.log(`  ✓ ${file.name}: ${res.statusCode === 200 ? `Available (${size} bytes)` : 'Not Found'}`);
                if (res.statusCode === 200 && !sizeOk) {
                    console.log(`    ⚠️  Size mismatch: expected ${file.expectedSize} bytes`);
                }
                resolve();
            }).on('error', (e) => {
                console.log(`  ✗ ${file.name}: Error`);
                resolve();
            });
        });
    }
}

// Test 5: Test API endpoints
async function testAPI() {
    console.log('\n🔌 Test 5: API Endpoints');
    const endpoints = [
        { name: 'API Interface', path: '/api.html' },
        { name: 'Health Check', path: '/health.html' },
        { name: 'Debug Page', path: '/debug.html' }
    ];

    for (const endpoint of endpoints) {
        await new Promise((resolve) => {
            https.get('https://teslasolar.github.io/ignition-sandbox/vm' + endpoint.path, (res) => {
                console.log(`  ✓ ${endpoint.name}: ${res.statusCode === 200 ? 'Available' : 'Not Found'}`);
                resolve();
            }).on('error', (e) => {
                console.log(`  ✗ ${endpoint.name}: Error`);
                resolve();
            });
        });
    }
}

// Main test runner
async function runTests() {
    const start = Date.now();

    await testMainPage();
    await testV86CDN();
    await testLinuxISOs();
    await testBIOS();
    await testAPI();

    const duration = ((Date.now() - start) / 1000).toFixed(1);

    console.log('\n' + '=' .repeat(60));
    console.log('✅ Testing Complete!');
    console.log(`Time: ${duration}s`);
    console.log('\n📌 VM URLs:');
    console.log('  Main: https://teslasolar.github.io/ignition-sandbox/vm/');
    console.log('  API:  https://teslasolar.github.io/ignition-sandbox/vm/api.html');
    console.log('  Health: https://teslasolar.github.io/ignition-sandbox/vm/health.html');
    console.log('\n💡 To test VMs interactively:');
    console.log('  1. Open https://teslasolar.github.io/ignition-sandbox/vm/');
    console.log('  2. Click on Alpine Linux to boot');
    console.log('  3. Wait ~30 seconds for boot');
    console.log('  4. Type commands like "uname -a" or "ls /"');
}

runTests().catch(console.error);