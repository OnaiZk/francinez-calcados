"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("admin-login-form");
  const pwInput = document.getElementById("login-password");
  const hpInput = document.getElementById("login-website");
  const toggleBtn = document.getElementById("toggle-pw-btn");
  const submitBtn = document.getElementById("login-submit-btn");
  const errorBox = document.getElementById("login-error");

  function showError(msg) {
    if (!errorBox) return;
    errorBox.textContent = msg;
    errorBox.hidden = false;
  }

  if (toggleBtn && pwInput) {
    toggleBtn.addEventListener("click", () => {
      const isHidden = pwInput.type === "password";
      pwInput.type = isHidden ? "text" : "password";
      toggleBtn.textContent = isHidden ? "OCULTAR" : "MOSTRAR";
      pwInput.focus();
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (errorBox) errorBox.hidden = true;

      const password = pwInput ? pwInput.value : "";
      const website = hpInput ? hpInput.value : "";

      if (!password || password.length < 8) {
        showError("Digite a senha administrativa completa.");
        if (pwInput) pwInput.focus();
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "VERIFICANDO CREDENCIAL...";
      }

      try {
        const resp = await fetch("/api/auth/login", {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({ password, website })
        });

        const data = await resp.json().catch(() => ({}));

        if (!resp.ok || !data.ok) {
          showError(data.error || "Senha incorreta. Verifique e tente novamente.");
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "ENTRAR NO PAINEL DA LOJA";
          }
          if (pwInput) {
            pwInput.value = "";
            pwInput.focus();
          }
          return;
        }

        window.location.reload();
      } catch (_) {
        showError("Falha de conexão com o servidor seguro. Tente novamente.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "ENTRAR NO PAINEL DA LOJA";
        }
      }
    });
  }
});
