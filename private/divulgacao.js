"use strict";

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-copy-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-copy-target");
      const textEl = document.getElementById(targetId);
      if (!textEl) return;
      navigator.clipboard.writeText(textEl.textContent).then(() => {
        const original = btn.textContent;
        btn.textContent = "COPIADO COM SUCESSO!";
        setTimeout(() => {
          btn.textContent = original;
        }, 1600);
      });
    });
  });
});
