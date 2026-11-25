// ===== CONFIGURAÇÃO =====
// Número com DDI + DDD (somente números)
const WHATSAPP_NUMERO = "5571997439198";
// Mensagem padrão (botões com data-msg usam a mensagem própria)
const WHATSAPP_MENSAGEM = "Olá! Vi seu site e gostaria de um orçamento para criação de site.";

const reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Links do WhatsApp
document.querySelectorAll(".js-whats").forEach((a) => {
  const msg = a.dataset.msg || WHATSAPP_MENSAGEM;
  a.href = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(msg)}`;
});

// Ano no rodapé
document.getElementById("ano").textContent = new Date().getFullYear();

// Menu mobile
const toggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", open);
});
nav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  })
);

// Item ativo do menu: acompanha a seção em que a pessoa está.
// Seções que não estão no menu marcam o item que vem antes delas.
const links = [...document.querySelectorAll(".nav__link")];
const idsNoMenu = links.map((l) => l.getAttribute("href").slice(1));
const secoes = [...document.querySelectorAll("main section[id]")];
const itemDaSecao = {};
let atual = idsNoMenu[0];
secoes.forEach((s) => {
  if (idsNoMenu.includes(s.id)) atual = s.id;
  itemDaSecao[s.id] = atual;
});
const marcarMenu = () => {
  const linha = window.innerHeight * 0.4;
  let ativa = secoes[0];
  secoes.forEach((s) => {
    if (s.getBoundingClientRect().top <= linha) ativa = s;
  });
  const id = itemDaSecao[ativa.id];
  links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === "#" + id));
};

// Header (some ao descer, volta ao subir) + botões fixos do WhatsApp
const header = document.querySelector(".header");
const botoesFixos = document.querySelectorAll(".whats-float, .mobile-cta");
let ultimoY = window.scrollY;
const onScroll = () => {
  const y = window.scrollY;
  header.classList.toggle("is-scrolled", y > 30);
  if (!nav.classList.contains("is-open")) header.classList.toggle("is-hidden", y > ultimoY && y > 300);
  if (y < ultimoY - 2 || y < 300) header.classList.remove("is-hidden");
  ultimoY = y;
  botoesFixos.forEach((b) => b.classList.toggle("is-visible", y > window.innerHeight * 0.6));
  marcarMenu();
};
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("hashchange", marcarMenu);
onScroll();

// Dúvidas: abrem e fecham deslizando
document.querySelectorAll(".faq__list details").forEach((d) => {
  const resumo = d.querySelector("summary");
  let anim = null;
  resumo.addEventListener("click", (e) => {
    if (reduzMovimento) return;
    e.preventDefault();
    anim?.cancel();
    const inicio = d.offsetHeight;
    const abrindo = !d.open;
    if (abrindo) d.open = true;
    const borda = d.offsetHeight - d.clientHeight;
    const fim = (abrindo ? d.scrollHeight : resumo.offsetHeight) + borda;
    anim = d.animate({ height: [`${inicio}px`, `${fim}px`] }, { duration: 380, easing: "cubic-bezier(.22, 1, .36, 1)" });
    anim.onfinish = () => {
      if (!abrindo) d.open = false;
      anim = null;
    };
  });
});

// Portfólio: carrossel que passa sozinho (pausa com o mouse em cima ou fora da tela)
const pfPainel = document.getElementById("pfPanel");
if (pfPainel) {
  const slides = [...pfPainel.querySelectorAll(".pf-slide")];
  const pontos = [...pfPainel.querySelectorAll(".pf-dot")];
  const numero = document.getElementById("pfNum");
  let ativo = 0;
  const mostrar = (i) => {
    const novo = (i + slides.length) % slides.length;
    if (novo === ativo) return;
    slides[ativo].classList.add("is-leaving");
    const saindo = slides[ativo];
    setTimeout(() => saindo.classList.remove("is-leaving"), 700);
    ativo = novo;
    slides.forEach((s, k) => {
      s.classList.toggle("is-active", k === ativo);
      s.setAttribute("aria-hidden", k === ativo ? "false" : "true");
      s.querySelectorAll("a, button").forEach((el) => (el.tabIndex = k === ativo ? 0 : -1));
    });
    pontos.forEach((p, k) => {
      p.classList.toggle("is-done", k < ativo);
      p.classList.remove("is-active");
      p.setAttribute("aria-selected", k === ativo ? "true" : "false");
    });
    void pontos[ativo].offsetWidth; // reinicia a barrinha de progresso
    pontos[ativo].classList.add("is-active");
    numero.textContent = String(ativo + 1).padStart(2, "0");
  };
  // estado inicial
  slides.forEach((s, k) => {
    s.setAttribute("aria-hidden", k === 0 ? "false" : "true");
    if (k) s.querySelectorAll("a, button").forEach((el) => (el.tabIndex = -1));
  });
  pontos.forEach((p, k) => p.setAttribute("aria-selected", k === 0 ? "true" : "false"));

  // quando a barrinha enche, passa para o próximo
  pontos.forEach((p) => p.querySelector("i").addEventListener("animationend", () => mostrar(ativo + 1)));
  pontos.forEach((p, k) => p.addEventListener("click", () => mostrar(k)));
  document.getElementById("pfPrev").addEventListener("click", () => mostrar(ativo - 1));
  document.getElementById("pfNext").addEventListener("click", () => mostrar(ativo + 1));

  // pausa com o mouse em cima, com foco dentro, ou fora da tela
  const stage = pfPainel.closest(".pf-stage");
  let mouse = false, foco = false, visivel = false;
  const atualizarPausa = () => pfPainel.classList.toggle("is-paused", mouse || foco || !visivel);
  stage.addEventListener("mouseenter", () => { mouse = true; atualizarPausa(); });
  stage.addEventListener("mouseleave", () => { mouse = false; atualizarPausa(); });
  stage.addEventListener("focusin", () => { foco = true; atualizarPausa(); });
  stage.addEventListener("focusout", () => { foco = false; atualizarPausa(); });
  new IntersectionObserver((e) => { visivel = e[0].isIntersecting; atualizarPausa(); }, { threshold: 0.35 }).observe(pfPainel);
  atualizarPausa();

  // arrastar com o dedo no celular
  let x0 = null;
  pfPainel.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  pfPainel.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 45) mostrar(ativo + (dx < 0 ? 1 : -1));
    x0 = null;
  });
}

// Planos: abas à esquerda trocam a prévia do site à direita
const tipos = [...document.querySelectorAll(".tipo")];
if (tipos.length) {
  const url = document.getElementById("pvUrl");
  const ativar = (alvo, focar) => {
    tipos.forEach((t) => {
      const on = t === alvo;
      t.classList.toggle("is-active", on);
      const btn = t.querySelector(".tipo__btn");
      btn.setAttribute("aria-selected", on ? "true" : "false");
      btn.tabIndex = on ? 0 : -1;
      t.querySelectorAll(".tipo__mais a").forEach((a) => (a.tabIndex = on ? 0 : -1));
      const tela = document.getElementById(btn.getAttribute("aria-controls"));
      tela.classList.toggle("is-active", on);
      if (on) { url.textContent = tela.dataset.dominio; tela.scrollTop = 0; }
    });
    if (focar) alvo.querySelector(".tipo__btn").focus();
  };
  tipos.forEach((t, i) => {
    const btn = t.querySelector(".tipo__btn");
    btn.addEventListener("click", () => ativar(t));
    btn.addEventListener("keydown", (e) => {
      const passo = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!passo) return;
      e.preventDefault();
      ativar(tipos[(i + passo + tipos.length) % tipos.length], true);
    });
  });
  ativar(tipos[0]);
}
