/*
 V33.3 Auth Gate
 Critical fix:
 - No portfolio/dashboard content is visible before authentication.
 - Demo data is never presented as the user's authenticated portfolio.
 - Successful login/signup/OTP reveals the application shell.
 - Logout returns to the public auth gate.
*/
(function(){
  const gate = document.getElementById("publicGate");
  const shell = document.getElementById("appShell");
  const authPanel = document.getElementById("authPanel");

  function showApp(user){
    if(!user){ showPublic(); return; }
    gate.style.display="none";
    shell.style.display="block";
    const status=document.getElementById("authStatus");
    if(status){
      status.textContent=`Signed in as ${user.email}`;
      status.classList.add("auth-signed-in");
    }
  }
  function showPublic(){
    gate.style.display="flex";
    shell.style.display="none";
  }
  function moveAuthCard(){
    if(authPanel && gate && !gate.contains(authPanel)) gate.appendChild(authPanel);
  }
  async function syncGate(){
    try{
      const user=await currentUser();
      if(user) showApp(user); else showPublic();
    }catch(e){ showPublic(); }
  }

  // Intercept the auth submit flow so the application shell is revealed only after
  // Supabase returns a real authenticated user.
  document.addEventListener("DOMContentLoaded",()=>{
    moveAuthCard();
    syncGate();

    const submit=document.getElementById("authSubmit");
    if(submit){
      submit.addEventListener("click", async()=>{
        // Allow V33.2 handler to perform authentication first.
        setTimeout(syncGate, 900);
      });
    }
    const tabs=[document.getElementById("authSignIn"),document.getElementById("authCreate"),document.getElementById("authOtp")];
    tabs.forEach(b=>b&&b.addEventListener("click",()=>setTimeout(syncGate,50)));

    // React to Supabase auth events whenever the client is available.
    setTimeout(()=>{
      try{
        const client=getSupabase();
        if(client) client.auth.onAuthStateChange((_event,session)=>{
          if(session && session.user) showApp(session.user); else showPublic();
        });
      }catch(e){}
    },250);
  });
})();
