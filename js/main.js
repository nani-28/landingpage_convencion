function iniciarCuentaRegresiva() {
  const etiqueta = document.getElementById("countdown-label");
  const pares = ["cd-dias", "cd-horas", "cd-minutos", "cd-segundos"].map((id) =>
    document.getElementById(id)
  );
  if (!etiqueta || pares.some((par) => !par)) return;

  const evento = new Date("2026-10-24T08:00:00-06:00");

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
      return;
    }

    const totalSegundos = Math.floor(restante / 1000);
    ponerPar(pares[0], Math.floor(totalSegundos / 86400));
    ponerPar(pares[1], Math.floor((totalSegundos % 86400) / 3600));
    ponerPar(pares[2], Math.floor((totalSegundos % 3600) / 60));
    ponerPar(pares[3], totalSegundos % 60);
  }

  actualizar();
  setInterval(actualizar, 1000);
}

iniciarCuentaRegresiva();

async function contarVisitas() {
  const total = document.getElementById("visitas-total");
  if (!total) return;

  const yaContada = sessionStorage.getItem("visita-contada") === "1";

  try {
    const respuesta = await fetch("/api/visitas", { method: yaContada ? "GET" : "POST" });
    if (!respuesta.ok) throw new Error("sin servidor");
    const datos = await respuesta.json();
    total.textContent = datos.total;
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
