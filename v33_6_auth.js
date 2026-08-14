
/*
 WealthPilot AI V33.7 — Auth State + E2E Hardening
 Single source of truth for public/authenticated state.
*/
(() => {
  let mode = "signin";
  let otpSent = false;
  let otpTimer = null;
  let switchingMode = false;

  const $ = (id) => document.getElementById(id);
  const gate = $("publicGate");
  const shell = $("appShell");
  const form = $("authForm");
  const email = $("authEmail");
  const password = $("authPassword");
  const passwordLabel = $("passwordLabel");
  const otpArea = $("otpArea");
  const otpCode = $("otpCode");
  const submit = $("authSubmit");
  const status = $("authStatus");
  const hint = $("authHint");
  const forgotRow = $("forgotRow");
  const title = $("authTitle");
  const subtitle = $("authSubtitle");
  const resend = $("resendOtp");

  function setStatus(message, type="neutral") {
    if (!status) return;
    status.textContent = message;
    status.className = `auth-status ${type}`;
  }

  function clearSensitiveFields() {
    if (password) password.value = "";
    if (otpCode) otpCode.value = "";
  }

  function clearAuthInputs() {
    if (email) email.value = "";
    clearSensitiveFields();
  }

  function resetOtpState() {
    otpSent = false;
    if (otpCode) otpCode.value = "";
    if (resend) {
      resend.disabled = true;
      resend.textContent = "Resend code";
    }
    if (otpTimer) clearInterval(otpTimer);
    otpTimer = null;
  }

  function setPublic() {
    if (gate) gate.style.display = "flex";
    if (shell) shell.style.display = "none";
    clearSensitiveFields();
    resetOtpState();
    setStatus("Secure login • Your data stays protected");
    const dropdown = $("accountDropdown");
    if (dropdown) dropdown.hidden = true;
  }

  function setAuthenticated(user) {
    if (!user) return setPublic();
    if (gate) gate.style.display = "none";
    if (shell) shell.style.display = "block";

    const value = user.email || "Account";
    const accountEmail = $("accountEmail");
    const accountEmailDropdown = $("accountEmailDropdown");
    const accountAvatar = $("accountAvatar");
    if (accountEmail) accountEmail.textContent = value;
    if (accountEmailDropdown) accountEmailDropdown.textContent = value;
    if (accountAvatar) accountAvatar.textContent = value.charAt(0).toUpperCase();

    // Never leave credentials in the public form after authentication.
    clearSensitiveFields();
  }

  async function syncSession() {
    try {
      const user = await currentUser();
      if (user) setAuthenticated(user);
      else setPublic();
    } catch {
      setPublic();
    }
  }

  function setMode(next) {
    switchingMode = true;
    mode = next;

    // Critical UX rule: every auth tab starts with a clean form.
    clearAuthInputs();
    resetOtpState();

    [$("authSignIn"), $("authCreate"), $("authOtp")]
      .forEach((b) => b?.classList.remove("active"));
    $(next === "signin" ? "authSignIn" : next === "signup" ? "authCreate" : "authOtp")
      ?.classList.add("active");

    if (otpArea) otpArea.hidden = next !== "otp";
    if (passwordLabel) passwordLabel.style.display = next === "otp" ? "none" : "";
    if (forgotRow) forgotRow.style.display = next === "signin" ? "flex" : "none";
    if (password) {
      password.type = "password";
      password.autocomplete = next === "signup" ? "new-password" : "current-password";
      password.placeholder = next === "signup" ? "Create a strong password" : "Enter your password";
    }

    if (next === "signin") {
      title.textContent = "Welcome back";
      subtitle.textContent = "Sign in to see your personal portfolio, goals and insights.";
      submit.textContent = "Sign in securely";
      hint.textContent = "Your session stays active across refreshes until you sign out or it expires.";
    } else if (next === "signup") {
      title.textContent = "Create your WealthPilot";
      subtitle.textContent = "Set up your secure personal wealth space in minutes.";
      submit.textContent = "Create account";
      hint.textContent = "We'll verify your email if email confirmation is enabled.";
    } else {
      title.textContent = "Sign in with email OTP";
      subtitle.textContent = "No password required. We'll send a one-time verification code.";
      submit.textContent = "Send OTP";
      hint.textContent = "OTP codes are single-use. Never share your code with anyone.";
    }

    setStatus("Secure login • Your data stays protected");
    // Do not let browser autofill race with a tab switch.
    queueMicrotask(() => {
      if (switchingMode && email) email.value = "";
      switchingMode = false;
    });
  }

  function sanitizeOtpInput() {
    if (!otpCode) return;
    otpCode.value = otpCode.value.replace(/\D/g, "").slice(0, 6);
  }

  function startCooldown() {
    let remaining = 30;
    if (!resend) return;
    clearInterval(otpTimer);
    resend.disabled = true;
    resend.textContent = `Resend in ${remaining}s`;

    otpTimer = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(otpTimer);
        otpTimer = null;
        resend.disabled = false;
        resend.textContent = "Resend code";
      } else {
        resend.textContent = `Resend in ${remaining}s`;
      }
    }, 1000);
  }

  async function submitAuth(event) {
    event.preventDefault();

    const address = email.value.trim().toLowerCase();
    if (!address) return setStatus("Enter your email address.", "error");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      return setStatus("Enter a valid email address.", "error");
    }

    submit.disabled = true;

    try {
      if (mode === "signin") {
        if (!password.value || password.value.length < 6) {
          throw new Error("Enter your password (minimum 6 characters).");
        }
        await signIn(address, password.value);
        clearAuthInputs();
        setStatus("Signed in successfully.", "success");
        await syncSession();

      } else if (mode === "signup") {
        if (!password.value || password.value.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }
        const result = await signUp(address, password.value);
        clearAuthInputs();

        if (result.session?.user) {
          setAuthenticated(result.session.user);
        } else {
          setStatus("Account created. Check your email to verify it.", "success");
        }

      } else {
        sanitizeOtpInput();

        if (!otpSent) {
          await sendEmailOtp(address);
          otpSent = true;
          otpArea.hidden = false;
          if (resend) resend.disabled = false;
          submit.textContent = "Verify OTP";
          setStatus("OTP sent. Check your email.", "success");
          startCooldown();
          otpCode?.focus();
          return;
        }

        const code = otpCode.value.trim();
        if (!/^\d{6}$/.test(code)) {
          throw new Error("OTP must contain exactly 6 digits.");
        }

        const result = await verifyEmailOtp(address, code);
        clearAuthInputs();
        if (result.session?.user) setAuthenticated(result.session.user);
        setStatus("OTP verified. Signed in successfully.", "success");
        await syncSession();
      }
    } catch (e) {
      setStatus(e?.message || "Authentication failed. Please try again.", "error");
    } finally {
      submit.disabled = false;
      if (mode === "signin") submit.textContent = "Sign in securely";
      else if (mode === "signup") submit.textContent = "Create account";
      else if (otpSent) submit.textContent = "Verify OTP";
      else submit.textContent = "Send OTP";
    }
  }

  async function resendOtp() {
    if (mode !== "otp") return;
    const address = email.value.trim().toLowerCase();
    if (!address) return setStatus("Enter your email address first.", "error");

    try {
      await sendEmailOtp(address);
      setStatus("A new OTP has been sent.", "success");
      startCooldown();
    } catch (e) {
      setStatus(e?.message || "Could not resend OTP.", "error");
    }
  }

  async function forgotPassword() {
    const address = email.value.trim().toLowerCase();
    if (!address) return setStatus("Enter your email address first.", "error");

    try {
      await resetPassword(address);
      setStatus("If that email has an account, a password-reset email has been sent.", "success");
    } catch (e) {
      setStatus(e?.message || "Could not start password reset.", "error");
    }
  }

  async function logout() {
    const button = $("logoutBtn");
    if (button) {
      button.disabled = true;
      button.textContent = "Logging out…";
    }

    try {
      await signOut();
      setPublic();
      setMode("signin");
    } catch (e) {
      setStatus(e?.message || "Logout failed. Please try again.", "error");
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Log out securely";
      }
    }
  }

  function wireAccountMenu() {
    const btn = $("accountBtn");
    const dropdown = $("accountDropdown");

    btn?.addEventListener("click", () => {
      if (!dropdown) return;
      dropdown.hidden = !dropdown.hidden;
      btn.setAttribute("aria-expanded", String(!dropdown.hidden));
    });

    $("logoutBtn")?.addEventListener("click", logout);

    document.addEventListener("click", (event) => {
      if (dropdown && btn && !dropdown.contains(event.target) && !btn.contains(event.target)) {
        dropdown.hidden = true;
        btn.setAttribute("aria-expanded", "false");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("authSignIn")?.addEventListener("click", () => setMode("signin"));
    $("authCreate")?.addEventListener("click", () => setMode("signup"));
    $("authOtp")?.addEventListener("click", () => setMode("otp"));

    form?.addEventListener("submit", submitAuth);
    resend?.addEventListener("click", resendOtp);
    $("forgotPassword")?.addEventListener("click", forgotPassword);

    otpCode?.addEventListener("input", sanitizeOtpInput);
    otpCode?.addEventListener("paste", () => queueMicrotask(sanitizeOtpInput));
    otpCode?.addEventListener("keydown", (event) => {
      const allowed = ["Backspace","Delete","ArrowLeft","ArrowRight","Tab","Home","End"];
      if (!allowed.includes(event.key) && !/^\d$/.test(event.key)) event.preventDefault();
    });

    $("togglePassword")?.addEventListener("click", () => {
      if (!password) return;
      const visible = password.type === "text";
      password.type = visible ? "password" : "text";
      $("togglePassword").textContent = visible ? "Show" : "Hide";
      $("togglePassword").setAttribute("aria-label", visible ? "Show password" : "Hide password");
    });

    wireAccountMenu();
    setMode("signin");
    syncSession();

    const client = getSupabase();
    client?.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setAuthenticated(session.user);
      else setPublic();
    });
  });
})();
