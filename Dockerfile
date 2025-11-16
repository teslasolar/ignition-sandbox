FROM debian:bullseye

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64

# Install system dependencies
RUN apt-get update && \
    apt-get install -y \
    openjdk-11-jre-headless \
    wget \
    curl \
    unzip \
    procps \
    net-tools \
    vim \
    nano \
    sudo \
    systemctl \
    && rm -rf /var/lib/apt/lists/*

# Create ignition user
RUN useradd -m -s /bin/bash ignition && \
    echo "ignition:ignition" | chpasswd && \
    usermod -aG sudo ignition

# Copy Ignition installer (you'll add this file to the repo)
# Download from: https://inductiveautomation.com/downloads/ignition/
COPY Ignition-linux-x64-installer.run /tmp/ignition-installer.run

# Install Ignition
RUN chmod +x /tmp/ignition-installer.run && \
    /tmp/ignition-installer.run --unattendedmodeui none --mode unattended --prefix /opt/ignition && \
    rm /tmp/ignition-installer.run

# Configure Ignition
RUN mkdir -p /opt/ignition/data && \
    cat > /opt/ignition/data/ignition.conf << 'EOF'
gateway.publicAddress.autoDetect=true
gateway.useSSL=false
gateway.http.port=8088
gateway.https.port=8043
EOF

# Set permissions
RUN chown -R ignition:ignition /opt/ignition

# Create auto-start script
RUN cat > /usr/local/bin/start-ignition.sh << 'EOF'
#!/bin/bash
echo ""
echo "================================================"
echo "  🏭 Ignition Gateway WebVM"
echo "================================================"
echo ""
echo "🚀 Starting Ignition Gateway..."
/opt/ignition/ignition.sh start
sleep 5
echo ""
echo "✅ Ignition Gateway is running!"
echo ""
echo "🌐 Access at: http://localhost:8088"
echo "🔑 Login: admin / password"
echo ""
echo "================================================"
echo ""
EOF

RUN chmod +x /usr/local/bin/start-ignition.sh

# Add to bashrc for auto-start on login
RUN cat >> /root/.bashrc << 'EOF'

# Auto-start Ignition if not already running
if ! pgrep -f "ignition" > /dev/null; then
    /usr/local/bin/start-ignition.sh
else
    echo ""
    echo "🏭 Ignition Gateway is running"
    echo "🌐 Access at: http://localhost:8088"
    echo ""
fi
EOF

# Add helpful aliases
RUN cat >> /root/.bashrc << 'EOF'
alias ignition-start='/opt/ignition/ignition.sh start'
alias ignition-stop='/opt/ignition/ignition.sh stop'
alias ignition-restart='/opt/ignition/ignition.sh restart'
alias ignition-status='/opt/ignition/ignition.sh status'
EOF

# Expose ports
EXPOSE 8088 8043

# Set working directory
WORKDIR /root

# Default command
CMD ["/bin/bash", "-l"]
