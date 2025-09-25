<?php
/**
 * Servidor PHP para o Sistema Pet Shop
 * Execute: php server.php
 * Acesse: http://localhost:8000
 */

$port = 8000;
$host = 'localhost';

// Verificar se o arquivo index.html existe
if (!file_exists('index.html')) {
    echo "❌ Erro: Arquivo index.html não encontrado!\n";
    echo "   Certifique-se de estar na pasta correta do projeto.\n";
    exit(1);
}

echo "🚀 Servidor Pet Shop iniciado!\n";
echo "📱 Acesse: http://{$host}:{$port}\n";
echo "🛑 Para parar: Ctrl+C\n";
echo str_repeat("-", 50) . "\n";

// Iniciar servidor
$command = "php -S {$host}:{$port}";
exec($command);
?>
