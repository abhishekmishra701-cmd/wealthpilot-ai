/*
 WealthPilot AI V33.4 — Account menu + secure logout
 QA fixes:
 - Authenticated topbar exposes the current account and logout action.
 - Logout calls Supabase signOut, then immediately hides app content.
 - Back/refresh after logout cannot reveal the protected shell without a session.
 - Authenticated state is always derived from Supabase session.
*/
(function(){
  const gate = document.getElementById("publicGate");
  const shell = document.getElementById("appShell");
  const accountBtn = document.getElementById("accountBtn");
  const dropdown = document.getElementById("accountDropdown");
  const logoutBtn = document.getElementById("logoutBtn");
  const emailEls = [document.getElementById("accountEmail"), document.getElementById("accountEmailDropdown")];

  function setAccount(user){
    if(!user) return;
    const email = user.email || "Account";
    const initial = email.charAt(0).toUpperCase();
    const avatar = document.getElementById("accountAvatar");
    if(avatar) avatar.textContent = initial;
    emailEls.forEach(el=>{ if(el) el.textContent = email; });
  }

  function showApp(user){
    if(!user) return showPublic();
    gate.style.display="none";
    shell.style.display="block";
    setAccount(user);
  }

  function showPublic(){
    gate.style.display="flex";
    shell.style.display="none";
    if(dropdown) dropdown.hidden=true;
    if(accountBtn) accountBtn.setAttribute("aria-expanded","false");
  }

  async function sync(){
    try{
      const user = await currentUser();
      if(user) showApp(user); else showPublic();
    }catch(e){
      showPublic();
    }
  }

  async function logout(){
    if(!logoutBtn) return;
    logoutBtn.disabled=true;
    logoutBtn.textContent="Logging out…";
    try{
      await signOut();
      showPublic();
      // Remove protected URL state and ensure a fresh auth gate on navigation.
      try{ history.replaceState({}, "", window.location.pathname); }catch(e){}
    }catch(e){
      logoutBtn.disabled=false;
      logoutBtn.textContent="Log out securely";
      if(typeof toast2==="function") toast2(e.message || "Logout failed. Please try again.");
      else alert(e.message || "Logout failed. Please try again.");
    }finally{
      if(logoutBtn && !logoutBtn.disabled) logoutBtn.textContent="Log out securely";
    }
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    accountBtn?.addEventListener("click", ()=>{
      const open = dropdown && dropdown.hidden;
      if(dropdown) dropdown.hidden=!open;
      accountBtn?.setAttribute("aria-expanded", String(!!open));
    });
    logoutBtn?.addEventListener("click", logout);

    document.addEventListener("click",(e)=>{
      if(dropdown && accountBtn && !dropdown.contains(e.target) && !accountBtn.contains(e.target)){
        dropdown.hidden=true;
        accountBtn.setAttribute("aria-expanded","false");
      }
    });

    setTimeout(sync, 50);

    setTimeout(()=>{
      try{
        const client=getSupabase();
        if(client){
          client.auth.onAuthStateChange((_event, session)=>{
            if(session?.user) showApp(session.user);
            else showPublic();
          });
        }
      }catch(e){}
    }, 200);
  });
})();
