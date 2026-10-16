function iniciarCuentaRegresiva() {
  const etiqueta = document.getElementById("countdown-label");
  const pares = ["cd-dias", "cd-horas", "cd-minutos", "cd-segundos"].map((id) =>
    document.getElementById(id)
  );
  if (!etiqueta || pares.some((par) => !par)) return;

  const evento = new Date("2026-10-24T08:00:00-06:00");
  const aviso = document.getElementById("countdown-started");
  let reloj;

  function ponerPar(par, valor) {
    const texto = String(Math.max(0, valor)).padStart(2, "0").slice(-2);
    const cifras = par.querySelectorAll("b");
    cifras[0].textContent = texto[0];
    cifras[1].textContent = texto[1];
  }

  function actualizar() {
    const restante = evento.getTime() - Date.now();
    if (restante <= 0) {
      etiqueta.textContent = "La convención ya comenzó";
      pares.forEach((par) => ponerPar(par, 0));
      if (aviso) aviso.hidden = false;
      clearInterval(reloj);
      return;
    }

    const totalSegundos = Math.floor(restante / 1000);
    ponerPar(pares[0], Math.floor(totalSegundos / 86400));
    ponerPar(pares[1], Math.floor((totalSegundos % 86400) / 3600));
    ponerPar(pares[2], Math.floor((totalSegundos % 3600) / 60));
    ponerPar(pares[3], totalSegundos % 60);
  }

  actualizar();
  if (evento.getTime() - Date.now() > 0) {
    reloj = setInterval(actualizar, 1000);
  }
}

iniciarCuentaRegresiva();

async function contarVisitas() {
  const total = document.getElementById("visitas-total");
  if (!total) return;

  const yaContada = sessionStorage.getItem("visita-contada") === "1";
  const esLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  const url = esLocal
    ? "/api/visitas"
    : `https://abacus.jasoncameron.dev/${yaContada ? "get" : "hit"}/landing-umg-reu/xiv-convencion`;

  try {
    const respuesta = await fetch(url, {
      method: esLocal && !yaContada ? "POST" : "GET",
      signal: AbortSignal.timeout(8000)
    });
    if (!respuesta.ok) throw new Error("sin contador");
    const datos = await respuesta.json();
    const valor = Number(esLocal ? datos.total : datos.value);
    if (!Number.isFinite(valor) || valor < 0) throw new Error("respuesta invalida");
    total.textContent = valor;
    sessionStorage.setItem("visita-contada", "1");
  } catch {
    const clave = "visitas-locales";
    let visitas = Number(localStorage.getItem(clave) || 0);
    if (!yaContada) {
      visitas += 1;
      localStorage.setItem(clave, String(visitas));
      sessionStorage.setItem("visita-contada", "1");
    }
    total.textContent = visitas;
  }
}

contarVisitas();

const toggle = document.getElementById("nav-toggle");
const nav = document.getElementById("nav-principal");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const abierto = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(abierto));
  });

  nav.querySelectorAll("a").forEach((enlace) => {
    enlace.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

document.querySelectorAll("video").forEach((video) => {
  const reproducir = () => {
    const promesa = video.play();
    if (promesa) promesa.catch(() => {});
  };

  if (video.readyState >= 2) reproducir();
  else video.addEventListener("canplay", reproducir, { once: true });
});
