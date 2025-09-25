@echo off
REM Sistema Pet Shop - Iniciar Servidor (Windows)
REM Execute: start.bat

echo 🚀 Iniciando Sistema Pet Shop...
echo.

REM Verificar se Python está instalado
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Python encontrado
    echo 📱 Iniciando servidor Python...
    python server.py
    goto :end
)

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Node.js encontrado
    echo 📱 Iniciando servidor Node.js...
    node server.js
    goto :end
)

REM Verificar se PHP está instalado
php --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ PHP encontrado
    echo 📱 Iniciando servidor PHP...
    php -S localhost:8000
    goto :end
)

echo ❌ Nenhum servidor encontrado!
echo.
echo 💡 Instale uma das opções:
echo    - Python: https://python.org
echo    - Node.js: https://nodejs.org
echo    - PHP: https://php.net
echo.
echo 🔧 Ou abra index.html diretamente no navegador
echo    (algumas funcionalidades podem não funcionar)

:end
pause
