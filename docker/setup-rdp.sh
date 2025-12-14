#!/bin/bash

# Script to enable RDP on Ubuntu
# This installs and configures xrdp for remote desktop access

set -e

echo "🔧 Setting up RDP on Ubuntu..."

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run with sudo: sudo ./setup-rdp.sh"
    exit 1
fi

echo "📦 Installing xrdp..."
apt-get update
apt-get install -y xrdp

echo "🔐 Installing xfce4 desktop environment (lightweight and works well with xrdp)..."
apt-get install -y xfce4 xfce4-goodies

echo "⚙️  Configuring xrdp..."
# Create xrdp user profile
echo "xfce4-session" > /etc/xrdp/startwm.sh
chmod +x /etc/xrdp/startwm.sh

# Enable and start xrdp service
echo "🚀 Starting xrdp service..."
systemctl enable xrdp
systemctl restart xrdp

# Configure firewall (if ufw is active)
if command -v ufw &> /dev/null; then
    if ufw status | grep -q "Status: active"; then
        echo "🔥 Configuring firewall..."
        ufw allow 3389/tcp
        echo "✅ Firewall rule added for port 3389"
    fi
fi

echo ""
echo "✅ RDP setup complete!"
echo ""
echo "📋 Connection details:"
echo "   - Server: $(hostname -I | awk '{print $1}')"
echo "   - Port: 3389"
echo "   - Protocol: RDP"
echo ""
echo "🔑 Login:"
echo "   - Username: Your Ubuntu username"
echo "   - Password: Your Ubuntu password"
echo ""
echo "💡 To connect from Windows:"
echo "   - Press Win+R, type: mstsc"
echo "   - Enter the server IP address"
echo ""
echo "💡 To connect from Linux/Mac:"
echo "   - Use Remmina, rdesktop, or FreeRDP"
echo ""
echo "🛠️  Useful commands:"
echo "   - Check status: sudo systemctl status xrdp"
echo "   - Restart: sudo systemctl restart xrdp"
echo "   - View logs: sudo journalctl -u xrdp -f"
