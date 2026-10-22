window.REYLEX_CONFIG = {
  brand: "REYLEX",
  legalName: "REYLEX Systems",
  tagline: "Operational software for the physical world.",
  products: { jworks: "https://jworks.jeffmyall6.workers.dev", trace: null },
  brandStatus: "provisional"
};
document.querySelectorAll('[data-brand]').forEach(el=>el.textContent=window.REYLEX_CONFIG.brand);
