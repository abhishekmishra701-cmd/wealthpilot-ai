let authMode="signin";
const oldToast=window.toast;
function notify(msg){if(typeof oldToast==="function")oldToast(msg);else console.log(msg)}

function setAuthMode(mode){
  authMode=mode;
  const submit=document.getElementById("authSubmit");
  const hint=document.getElementById("authHint");
  const create=document.getElementById("authCreate");
  const signin=document.getElementById("authSignIn");
  document.getElementById("authForm").style.display="block";
  submit.textContent=mode==="signin"?"Sign in":"Create account";
  hint.textContent=mode==="signin"
    ?"Sign in to load your real portfolio data."
    :"Create your WealthPilot account. Email verification may be required.";
  signin.className=mode==="signin"?"primary":"";
  create.className=mode==="signup"?"primary":"";
}
function bindAuth(){
  document.getElementById("authSignIn").onclick=()=>setAuthMode("signin");
  document.getElementById("authCreate").onclick=()=>setAuthMode("signup");

  document.getElementById("authSubmit").onclick=async()=>{
    try{
      const email=document.getElementById("authEmail").value.trim();
      const password=document.getElementById("authPassword").value;
      if(!email||password.length<6) throw new Error("Enter a valid email and a password of at least 6 characters.");
      if(authMode==="signin"){
        await signIn(email,password);
        await refreshAuth();
        notify("Signed in successfully.");
      }else{
        const result=await signUp(email,password);
        if(result.user && !result.session){
          notify("Account created. Check your email if verification is required.");
        }else{
          await refreshAuth();
          notify("Account created and signed in.");
        }
      }
    }catch(e){notify(e.message||"Authentication failed.");}
  };
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
  }catch(e){
    document.getElementById("authStatus").textContent="Not signed in — demo data remains local.";
  }
}
document.addEventListener("DOMContentLoaded",()=>{bindAuth();refreshAuth();});
