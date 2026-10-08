window.JELIX_CONFIG = {
  brand: "JELIX",
  legalName: "JELIX Systems",
  tagline: "Operational software for the physical world.",
  products: { jworks: "https://jworks.jeffmyall6.workers.dev", trace: null },
  brandStatus: "provisional"
};
document.querySelectorAll('[data-brand]').forEach(el=>el.textContent=window.JELIX_CONFIG.brand);
