#!/usr/bin/env python3
"""
Servidor local para o Sistema Pet Shop
Execute: python server.py
Acesse: http://localhost:8000
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Adicionar headers CORS para desenvolvimento
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        # Responder a requisições OPTIONS (CORS preflight)
        self.send_response(200)
        self.end_headers()

def main():
    # Verificar se o arquivo index.html existe
    if not os.path.exists('index.html'):
        print("❌ Erro: Arquivo index.html não encontrado!")
        print("   Certifique-se de estar na pasta correta do projeto.")
        sys.exit(1)

    # Criar servidor
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print("🚀 Servidor Pet Shop iniciado!")
        print(f"📱 Acesse: http://localhost:{PORT}")
        print("🛑 Para parar: Ctrl+C")
        print("-" * 50)
        
        # Abrir navegador automaticamente
        try:
            webbrowser.open(f'http://localhost:{PORT}')
        except:
            pass
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Servidor parado.")
            sys.exit(0)

if __name__ == "__main__":
    main()
