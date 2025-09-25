#!/bin/bash
# Sistema Pet Shop - Iniciar Servidor (Linux/Mac)
# Execute: ./start.sh

echo "🚀 Iniciando Sistema Pet Shop..."
echo

# Verificar se Python está instalado
if command -v python3 &> /dev/null; then
    echo "✅ Python encontrado"
    echo "📱 Iniciando servidor Python..."
    python3 server.py
    exit 0
fi

# Verificar se Node.js está instalado
if command -v node &> /dev/null; then
    echo "✅ Node.js encontrado"
    echo "📱 Iniciando servidor Node.js..."
    node server.js
    exit 0
fi

# Verificar se PHP está instalado
if command -v php &> /dev/null; then
    echo "✅ PHP encontrado"
    echo "📱 Iniciando servidor PHP..."
    php -S localhost:8000
    exit 0
fi

echo "❌ Nenhum servidor encontrado!"
echo
echo "💡 Instale uma das opções:"
echo "   - Python: https://python.org"
echo "   - Node.js: https://nodejs.org"
echo "   - PHP: https://php.net"
echo
echo "🔧 Ou abra index.html diretamente no navegador"
echo "   (algumas funcionalidades podem não funcionar)"