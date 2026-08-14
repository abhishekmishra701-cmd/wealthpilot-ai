
/*
 WealthPilot AI V33.6 — Single Auth Controller
 - One Supabase auth listener.
 - Protected shell is shown only when a real session exists.
 - Logout clears UI state.
 - Password is never written to local/session storage by the app.
 - OTP uses an inline verification field instead of browser prompt.
 - Session persistence/auto-refresh are configured in supabase.js.
*/
(() => {
  let mode = "signin";
  let otpSent = false;
  let otpCooldown = 0;
  let otpTimer = null;

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

  function setStatus(message, type="neutral") {
    if (!status) return;
    status.textContent = message;
    status.className = `auth-status ${type}`;
  }

  function clearSensitiveFields() {
    if (password) password.value = "";
    if (otpCode) otpCode.value = "";
  }

  function setPublic() {
    if (gate) gate.style.display = "flex";
    if (shell) shell.style.display = "none";
    clearSensitiveFields();
    setStatus("Secure login • Your data stays protected");
    const accountDropdown = $("accountDropdown");
    if (accountDropdown) accountDropdown.hidden = true;
  }

  function setAuthenticated(user) {
    if (!user) return setPublic();
    if (gate) gate.style.display = "none";
    if (shell) shell.style.display = "block";
    const accountEmail = $("accountEmail");
    const accountEmailDropdown = $("accountEmailDropdown");
    const accountAvatar = $("accountAvatar");
    const value = user.email || "Account";
    if (accountEmail) accountEmail.textContent = value;
    if (accountEmailDropdown) accountEmailDropdown.textContent = value;
    if (accountAvatar) accountAvatar.textContent = value.charAt(0).toUpperCase();
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
    mode = next;
    [$("authSignIn"), $("authCreate"), $("authOtp")].forEach((b) => b?.classList.remove("active"));
    $(next === "signin" ? "authSignIn" : next === "signup" ? "authCreate" : "authOtp")?.classList.add("active");

    otpSent = false;
    if (otpArea) otpArea.hidden = next !== "otp";
    if (passwordLabel) passwordLabel.style.display = next === "otp" ? "none" : "";
    if (forgotRow) forgotRow.style.display = next === "signin" ? "flex" : "none";
    if (password) {
      password.value = "";
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
  }

  async function submitAuth(event) {
    event.preventDefault();
    const address = email.value.trim().toLowerCase();
    if (!address) return setStatus("Enter your email address.", "error");

    submit.disabled = true;
    const original = submit.textContent;
    submit.textContent = mode === "otp" && otpSent ? "Verifying…" : "Working…";

    try {
      if (mode === "signin") {
        if (!password.value || password.value.length < 6) throw new Error("Enter your password.");
        await signIn(address, password.value);
        clearSensitiveFields();
        setStatus("Signed in successfully.", "success");
      } else if (mode === "signup") {
        if (!password.value || password.value.length < 6) throw new Error("Password must be at least 6 characters.");
        const result = await signUp(address, password.value);
        clearSensitiveFields();
        if (result.session?.user) {
          setAuthenticated(result.session.user);
          return;
        }
        setStatus("Account created. Check your email to verify it.", "success");
      } else {
        if (!otpSent) {
          await sendEmailOtp(address);
          otpSent = true;
          otpArea.hidden = false;
          submit.textContent = "Verify OTP";
          setStatus("OTP sent. Check your email.", "success");
          startCooldown();
          return;
        }
        const code = otpCode.value.trim();
        if (!/^\d{6}$/.test(code)) throw new Error("Enter the 6-digit OTP.");
        const result = await verifyEmailOtp(address, code);
        clearSensitiveFields();
        if (result.session?.user) setAuthenticated(result.session.user);
        setStatus("OTP verified. Signed in successfully.", "success");
      }
    } catch (e) {
      setStatus(e?.message || "Authentication failed. Please try again.", "error");
    } finally {
      submit.disabled = false;
      if (mode === "signin") submit.textContent = "Sign in securely";
      else if (mode === "signup") submit.textContent = "Create account";
      else if (otpSent) submit.textContent = "Verify OTP";
      else submit.textContent = original;
    }
  }

  function startCooldown() {
    otpCooldown = 30;
    const btn = $("resendOtp");
    if (!btn) return;
    clearInterval(otpTimer);
    btn.disabled = true;
    btn.textContent = `Resend in ${otpCooldown}s`;
    otpTimer = setInterval(() => {
      otpCooldown -= 1;
      if (otpCooldown <= 0) {
        clearInterval(otpTimer);
        btn.disabled = false;
        btn.textContent = "Resend code";
      } else btn.textContent = `Resend in ${otpCooldown}s`;
    }, 1000);
  }

  async function resendOtp() {
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
    if (button) { button.disabled = true; button.textContent = "Logging out…"; }
    try {
      await signOut();
      setPublic();
    } catch (e) {
      setStatus(e?.message || "Logout failed. Please try again.", "error");
    } finally {
      if (button) { button.disabled = false; button.textContent = "Log out securely"; }
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
    document.addEventListener("click", (e) => {
      if (dropdown && btn && !dropdown.contains(e.target) && !btn.contains(e.target)) {
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
    $("resendOtp")?.addEventListener("click", resendOtp);
    $("forgotPassword")?.addEventListener("click", forgotPassword);
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
