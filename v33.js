// V33.1 compatibility controller retained for regression.
async function refreshAuth(){
  try{
    const u=await currentUser();
    const s=document.getElementById("authStatus");
    if(u) s.textContent=`Signed in as ${u.email}`;
  }catch(e){}
}
