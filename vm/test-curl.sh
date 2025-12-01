#!/bin/bash

# Curl-based testing script for VM resources
# Tests the deployed GitHub Pages site

BASE_URL="https://teslasolar.github.io/ignition-sandbox/vm"

echo "================================"
echo "Ignition VM - Curl Testing"
echo "================================"
echo ""

# Function to test with curl and show response details
test_with_curl() {
    local url="$1"
    local name="$2"

    echo "Testing: $name"
    echo "URL: $url"

    # Get full response with headers
    response=$(curl -sI "$url")
    status=$(echo "$response" | head -n 1 | cut -d' ' -f2)
    content_type=$(echo "$response" | grep -i "content-type:" | cut -d':' -f2- | tr -d ' \r')
    content_length=$(echo "$response" | grep -i "content-length:" | cut -d':' -f2- | tr -d ' \r')

    if [ "$status" = "200" ]; then
        echo "✓ Status: $status OK"
        echo "  Type: $content_type"
        echo "  Size: $content_length bytes"
    else
        echo "✗ Status: $status"
    fi
    echo ""
}

# Test main resources
echo "MAIN PAGES:"
echo "-----------"
test_with_curl "$BASE_URL/index.html" "VM Index"
test_with_curl "$BASE_URL/api.html" "API Interface"
test_with_curl "$BASE_URL/debug.html" "Debug Page"

echo "SCRIPTS:"
echo "--------"
test_with_curl "$BASE_URL/lib/v86-loader.js" "V86 Loader"

echo "BIOS FILES:"
echo "-----------"
test_with_curl "$BASE_URL/images/seabios/seabios.bin" "SeaBIOS"
test_with_curl "$BASE_URL/images/seabios/vgabios.bin" "VGA BIOS"

echo "LINUX ISOS:"
echo "-----------"
test_with_curl "$BASE_URL/images/linux/alpine-virt-3.19.0-x86.iso" "Alpine Linux"
test_with_curl "$BASE_URL/images/linux/TinyCore-15.0.iso" "TinyCore Linux"
test_with_curl "$BASE_URL/images/linux/slitaz-rolling.iso" "SliTaz Linux"

echo "CDN RESOURCES:"
echo "--------------"
test_with_curl "https://copy.sh/v86/build/libv86.js" "V86 Library"
test_with_curl "https://copy.sh/v86/build/v86.wasm" "V86 WASM"

echo ""
echo "================================"
echo "Testing Complete!"
echo "================================"

# Check if all critical files exist
echo ""
echo "Quick Summary:"
critical_files=(
    "$BASE_URL/index.html"
    "$BASE_URL/lib/v86-loader.js"
    "$BASE_URL/images/seabios/seabios.bin"
    "$BASE_URL/images/seabios/vgabios.bin"
)

all_good=true
for file in "${critical_files[@]}"; do
    if curl -sI "$file" | head -n1 | grep -q "200"; then
        echo "✓ $(basename $file)"
    else
        echo "✗ $(basename $file)"
        all_good=false
    fi
done

if $all_good; then
    echo ""
    echo "✓ All critical files accessible!"
    echo "VM should be ready to boot at: $BASE_URL/"
else
    echo ""
    echo "⚠ Some critical files are missing"
fi