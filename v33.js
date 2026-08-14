let authMode="signin";
const oldToast=window.toast;
function notify(msg){if(typeof oldToast==="function")oldToast(msg);else console.log(msg)}

function bindAuth(){
  const toggle=document.getElementById("authToggle"), form=document.getElementById("authForm"), submit=document.getElementById("authSubmit");
  toggle.onclick=()=>{form.style.display=form.style.display==="none"?"block":"none";authMode="signin";toggle.textContent=form.style.display==="none"?"Sign in":"Create account"};
  submit.onclick=async()=>{
    try{
      const email=document.getElementById("authEmail").value.trim(), password=document.getElementById("authPassword").value;
      if(!email||password.length<6) throw new Error("Enter a valid email and a password of at least 6 characters.");
      if(authMode==="signin") await signIn(email,password); else await signUp(email,password);
      await refreshAuth();
      notify("Authentication successful.");
    }catch(e){notify(e.message||"Authentication failed.");}
  };
  document.getElementById("authToggle").ondblclick=()=>{authMode=authMode==="signin"?"signup":"signin";document.getElementById("authHint").textContent=authMode==="signin"?"Sign in to load your real portfolio data.":"Create your WealthPilot account. Email verification may be required.";};
}
async function refreshAuth(){
  try{
    const u=await currentUser();
    const s=document.getElementById("authStatus");
    s.textContent=u?`Signed in as ${u.email}`:"Not signed in — demo data remains local.";
    if(u){
      const ps=await listPortfolios();
      notify(`Connected to Supabase. ${ps.length} portfolio(s) found.`);
    }
  }catch(e){document.getElementById("authStatus").textContent="Not signed in — demo data remains local.";}
}
document.addEventListener("DOMContentLoaded",()=>{bindAuth();refreshAuth();});
