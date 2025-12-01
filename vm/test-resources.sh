#!/bin/bash

# Quick resource testing script for Ignition Sandbox VM
BASE_URL="https://teslasolar.github.io/ignition-sandbox/vm"

echo "Testing Ignition Sandbox VM Resources"
echo "======================================"
echo "Base URL: $BASE_URL"
echo ""

# Function to test a resource
test_resource() {
    local url="$1"
    local name="$2"

    echo -n "Testing $name... "

    # Use curl with head request to check if resource exists
    status_code=$(curl -s -o /dev/null -w "%{http_code}" -I "$url")

    if [ "$status_code" = "200" ]; then
        # Get size if successful
        size=$(curl -sI "$url" | grep -i content-length | awk '{print $2}' | tr -d '\r')
        echo "✓ OK ($status_code) - ${size:-unknown} bytes"
        return 0
    else
        echo "✗ FAILED ($status_code)"
        return 1
    fi
}

# Test main pages
echo "Main Pages:"
test_resource "$BASE_URL/index.html" "VM Index"
test_resource "$BASE_URL/debug.html" "Debug Page"
test_resource "$BASE_URL/test-local.html" "Local Test"

echo ""
echo "VM Scripts:"
test_resource "$BASE_URL/lib/v86-loader.js" "V86 Loader"

echo ""
echo "BIOS Files:"
test_resource "$BASE_URL/images/seabios/seabios.bin" "SeaBIOS"
test_resource "$BASE_URL/images/seabios/vgabios.bin" "VGA BIOS"

echo ""
echo "Linux ISOs:"
test_resource "$BASE_URL/images/linux/alpine-virt-3.19.0-x86.iso" "Alpine Linux"
test_resource "$BASE_URL/images/linux/TinyCore-15.0.iso" "Tiny Core Linux"
test_resource "$BASE_URL/images/linux/slitaz-rolling.iso" "SliTaz Linux"

echo ""
echo "CDN Resources:"
test_resource "https://copy.sh/v86/build/libv86.js" "V86 Library"
test_resource "https://copy.sh/v86/build/v86.wasm" "V86 WASM"

echo ""
echo "Testing complete!"