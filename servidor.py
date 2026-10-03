import json
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ARCHIVO = ROOT / "data" / "visitas.json"


class Manejador(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        if self.path.split("?", 1)[0] == "/api/visitas":
            self.responder_visitas(sumar=False)
            return
        super().do_GET()

    def do_POST(self):
        if self.path.split("?", 1)[0] == "/api/visitas":
            self.responder_visitas(sumar=True)
            return
        self.send_error(404)

    def responder_visitas(self, sumar):
        ARCHIVO.parent.mkdir(exist_ok=True)
        total = 0
        if ARCHIVO.exists():
            total = json.loads(ARCHIVO.read_text(encoding="utf-8")).get("total", 0)
        if sumar:
            total += 1
            ARCHIVO.write_text(json.dumps({"total": total}), encoding="utf-8")

        cuerpo = json.dumps({"total": total}).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(cuerpo)))
        self.end_headers()
        self.wfile.write(cuerpo)


if __name__ == "__main__":
    servidor = ThreadingHTTPServer(("127.0.0.1", 8000), Manejador)
    print("Página en http://127.0.0.1:8000")
    servidor.serve_forever()
