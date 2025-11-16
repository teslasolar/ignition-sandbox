FROM debian:bullseye

# Install dependencies
RUN apt-get update && \
    apt-get install -y \
    wget \
    curl \
    openjdk-11-jre-headless \
    unzip \
    procps \
    net-tools \
    vim \
    nano \
    && rm -rf /var/lib/apt/lists/*

# Download Ignition installer
# NOTE: You'll need to manually download this and add it to the build context
# Or modify to download from your GitHub release
WORKDIR /tmp

# Option 1: Copy from local build context (after you download it)
# COPY Ignition-linux-x64-installer.run /tmp/ignition-installer.run

# Option 2: Download from GitHub release (once uploaded)
# RUN wget -O ignition-installer.run https://github.com/teslasolar/ignition-sandbox/releases/download/v1.0-ignition/Ignition-linux-x64-installer.run

# For now, use a placeholder that downloads from IA (may not work in build)
# You'll need to replace this with Option 1 or 2 above
RUN echo "#!/bin/bash\necho 'Ignition will be installed on first boot'\n" > /tmp/install-ignition.sh && \
    chmod +x /tmp/install-ignition.sh

# Create installation directory
RUN mkdir -p /opt/ignition

# Copy installation script
COPY ignition-install.sh /usr/local/bin/install-ignition.sh
RUN chmod +x /usr/local/bin/install-ignition.sh

# Create startup script that runs on boot
RUN echo '#!/bin/bash\n\
echo "================================================"\n\
echo "  🏭 Ignition Gateway WebVM Sandbox"\n\
echo "================================================"\n\
echo ""\n\
echo "Starting Ignition installation..."\n\
/usr/local/bin/install-ignition.sh\n\
echo ""\n\
echo "================================================"\n\
echo "  ✅ Ignition Gateway Ready!"\n\
echo "================================================"\n\
echo ""\n\
echo "Access Ignition at: http://localhost:8088"\n\
echo "Default credentials: admin/password"\n\
echo ""\n\
' > /startup.sh && chmod +x /startup.sh

# Set working directory
WORKDIR /root

# Add helpful message to bashrc
RUN echo 'echo ""' >> /root/.bashrc && \
    echo 'echo "🏭 Ignition Gateway Sandbox"' >> /root/.bashrc && \
    echo 'echo "Access gateway: http://localhost:8088"' >> /root/.bashrc && \
    echo 'echo "Credentials: admin/password"' >> /root/.bashrc && \
    echo 'echo ""' >> /root/.bashrc && \
    echo 'echo "Commands:"' >> /root/.bashrc && \
    echo 'echo "  /opt/ignition/ignition.sh start    - Start Ignition"' >> /root/.bashrc && \
    echo 'echo "  /opt/ignition/ignition.sh stop     - Stop Ignition"' >> /root/.bashrc && \
    echo 'echo "  /opt/ignition/ignition.sh restart  - Restart Ignition"' >> /root/.bashrc && \
    echo 'echo ""' >> /root/.bashrc

# Expose Ignition ports
EXPOSE 8088 8043

CMD ["/bin/bash"]
