#!/usr/bin/env node
/**
 * Servidor Node.js para o Sistema Pet Shop
 * Execute: node server.js
 * Acesse: http://localhost:8000
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const PORT = 8000;
const HOST = "localhost";

// MIME types
const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

// Verificar se o arquivo index.html existe
if (!fs.existsSync("index.html")) {
  console.log("❌ Erro: Arquivo index.html não encontrado!");
  console.log("   Certifique-se de estar na pasta correta do projeto.");
  process.exit(1);
}

// Criar servidor
const server = http.createServer((req, res) => {
  let filePath = "." + req.url;

  // Se for diretório, procurar index.html
  if (filePath === "./") {
    filePath = "./index.html";
  }

  // Verificar se arquivo existe
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("<h1>404 - Arquivo não encontrado</h1>");
    return;
  }

  // Obter extensão do arquivo
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || "application/octet-stream";

  // Ler e servir arquivo
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/html" });
      res.end("<h1>500 - Erro interno do servidor</h1>");
      return;
    }

    // Headers CORS para desenvolvimento
    res.writeHead(200, {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });

    res.end(data);
  });
});

// Iniciar servidor
server.listen(PORT, HOST, () => {
  console.log("🚀 Servidor Pet Shop iniciado!");
  console.log(`📱 Acesse: http://${HOST}:${PORT}`);
  console.log("🛑 Para parar: Ctrl+C");
  console.log("-".repeat(50));

  // Abrir navegador automaticamente
  const start =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
      ? "start"
      : "xdg-open";

  exec(`${start} http://${HOST}:${PORT}`, (err) => {
    if (err) {
      console.log("💡 Abra manualmente: http://" + HOST + ":" + PORT);
    }
  });
});

// Tratar interrupção
process.on("SIGINT", () => {
  console.log("\n🛑 Servidor parado.");
  process.exit(0);
});
