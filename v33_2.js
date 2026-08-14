let authMode="signin";
function toast2(msg){ if(typeof window.toast==="function") window.toast(msg); else alert(msg); }
function setMode(mode){
  authMode=mode;
  const tabs={signin:document.getElementById("authSignIn"),signup:document.getElementById("authCreate"),otp:document.getElementById("authOtp")};
  Object.entries(tabs).forEach(([k,b])=>b.classList.toggle("active",k===mode));
  const password=document.getElementById("passwordLabel");
  const submit=document.getElementById("authSubmit");
  const hint=document.getElementById("authHint");
  if(mode==="otp"){
    password.style.display="none";
    submit.textContent="Send OTP";
    hint.textContent="We'll send a one-time code to your email. No password required.";
  }else if(mode==="signup"){
    password.style.display="";
    submit.textContent="Create account";
    hint.textContent="Use a strong password. Email verification may be required.";
  }else{
    password.style.display="";
    submit.textContent="Sign in securely";
    hint.textContent="Use your email and password to access your portfolio.";
  }
}
async function submitAuth(){
  const email=document.getElementById("authEmail").value.trim();
  const password=document.getElementById("authPassword").value;
  if(!email) return toast2("Please enter your email address.");
  try{
    if(authMode==="signin"){
      if(password.length<6) throw new Error("Enter your password.");
      await signIn(email,password);
      await refreshAuth();
      toast2("Signed in securely.");
    }else if(authMode==="signup"){
      if(password.length<6) throw new Error("Password must be at least 6 characters.");
      const result=await signUp(email,password);
      toast2(result.user && !result.session ? "Account created. Check your email to verify it." : "Account created and signed in.");
    }else{
      await sendEmailOtp(email);
      const code=prompt("Enter the 6-digit OTP sent to your email:");
      if(!code) return;
      await verifyEmailOtp(email,code.trim());
      await refreshAuth();
      toast2("OTP verified. You are signed in.");
    }
  }catch(e){ toast2(e.message||"Authentication failed."); }
}
document.addEventListener("DOMContentLoaded",()=>{
  setMode("signin");
  document.getElementById("authSignIn").onclick=()=>setMode("signin");
  document.getElementById("authCreate").onclick=()=>setMode("signup");
  document.getElementById("authOtp").onclick=()=>setMode("otp");
  document.getElementById("authSubmit").onclick=submitAuth;
  refreshAuth();
});
