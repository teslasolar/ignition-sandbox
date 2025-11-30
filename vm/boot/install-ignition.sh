#!/bin/sh
# Ignition Gateway Installer for Browser VM
# Optimized for Alpine Linux / minimal environments

set -e

IGNITION_VERSION="8.1.33"
INSTALL_DIR="/opt/ignition"
DOWNLOAD_URL="https://files.inductiveautomation.com/release/ia/8.1.33/20231102-1437/Ignition-linux-64-8.1.33.zip"

echo "============================================"
echo "  Ignition Gateway Installer (Browser VM)"
echo "============================================"
echo ""

# Detect OS
if [ -f /etc/alpine-release ]; then
    OS="alpine"
    PKG_MGR="apk"
    echo "[*] Detected Alpine Linux"
elif [ -f /etc/debian_version ]; then
    OS="debian"
    PKG_MGR="apt"
    echo "[*] Detected Debian/Ubuntu"
else
    OS="unknown"
    echo "[!] Unknown OS, attempting generic install"
fi

# Check memory
MEM_TOTAL=$(free -m | awk '/^Mem:/{print $2}')
echo "[*] Available memory: ${MEM_TOTAL}MB"

if [ "$MEM_TOTAL" -lt 400 ]; then
    echo "[!] Warning: Less than 400MB RAM available"
    echo "[!] Ignition may not run properly"
    echo ""
fi

# Install dependencies
echo "[*] Installing dependencies..."

if [ "$OS" = "alpine" ]; then
    apk update
    apk add --no-cache \
        openjdk17-jre-headless \
        curl \
        unzip \
        bash \
        coreutils
elif [ "$OS" = "debian" ]; then
    apt-get update
    apt-get install -y \
        openjdk-17-jre-headless \
        curl \
        unzip
fi

# Verify Java
echo "[*] Checking Java..."
if command -v java > /dev/null 2>&1; then
    JAVA_VER=$(java -version 2>&1 | head -1)
    echo "[*] Java: $JAVA_VER"
else
    echo "[!] Error: Java not found"
    exit 1
fi

# Create install directory
echo "[*] Creating directories..."
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Download Ignition (or use cached)
if [ -f "$INSTALL_DIR/ignition.zip" ]; then
    echo "[*] Using cached installer..."
else
    echo "[*] Downloading Ignition Gateway..."
    echo "[*] This may take a while..."

    # For browser VM, we might need to use a smaller/cached version
    # Check if we have a local mirror first
    if curl -sI "http://localhost:8000/ignition.zip" > /dev/null 2>&1; then
        curl -L "http://localhost:8000/ignition.zip" -o ignition.zip
    else
        # Direct download (will be slow in VM)
        curl -L "$DOWNLOAD_URL" -o ignition.zip
    fi
fi

# Extract
echo "[*] Extracting..."
unzip -q -o ignition.zip

# Configure for low memory
echo "[*] Configuring for low memory environment..."
cat > "$INSTALL_DIR/data/ignition.conf" << 'CONF'
# Browser VM optimized settings
wrapper.java.initmemory=128
wrapper.java.maxmemory=384
wrapper.startup.timeout=300
wrapper.ping.timeout=300
CONF

# Create control script
echo "[*] Creating control script..."
cat > "$INSTALL_DIR/ignition.sh" << 'SCRIPT'
#!/bin/sh
IGNITION_HOME="/opt/ignition"
cd "$IGNITION_HOME"

case "$1" in
    start)
        echo "Starting Ignition Gateway..."
        ./ignition-gateway start
        echo "Gateway starting on http://localhost:8088"
        ;;
    stop)
        echo "Stopping Ignition Gateway..."
        ./ignition-gateway stop
        ;;
    restart)
        $0 stop
        sleep 2
        $0 start
        ;;
    status)
        ./ignition-gateway status
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac
SCRIPT
chmod +x "$INSTALL_DIR/ignition.sh"

# Done
echo ""
echo "============================================"
echo "  Installation Complete!"
echo "============================================"
echo ""
echo "Start gateway:  /opt/ignition/ignition.sh start"
echo "Stop gateway:   /opt/ignition/ignition.sh stop"
echo "Web interface:  http://localhost:8088"
echo ""
echo "Note: First startup may take several minutes"
echo "      in the browser VM environment."
echo ""
