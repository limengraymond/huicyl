(function(){
  'use strict';

  var ACCESS_PASSWORD='99fund';
  var ACCESS_DAYS=7;
  var STORAGE_KEY='huichang-quotes-access-v1';
  var DAY_MS=24*60*60*1000;

  var gate=document.getElementById('authGate');
  var panel=gate&&gate.querySelector('.auth-panel');
  var form=document.getElementById('authForm');
  var input=document.getElementById('authPassword');
  var error=document.getElementById('authError');
  var loading=false;

  function hasValidAccess(){
    try{
      var saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(saved&&Number(saved.expiresAt)>Date.now())return true;
      localStorage.removeItem(STORAGE_KEY);
    }catch(e){}
    return false;
  }

  function rememberAccess(){
    try{
      localStorage.setItem(STORAGE_KEY,JSON.stringify({expiresAt:Date.now()+ACCESS_DAYS*DAY_MS}));
    }catch(e){}
  }

  function showLoadError(){
    loading=false;
    document.body.classList.remove('auth-pending');
    document.getElementById('app').innerHTML='<div class="error"><b>页面载入失败</b><br>请检查网络后刷新重试。</div>';
  }

  function loadScript(src,onload){
    var script=document.createElement('script');
    script.src=src;
    script.onload=onload;
    script.onerror=showLoadError;
    document.body.appendChild(script);
  }

  function enterSite(){
    if(loading)return;
    loading=true;
    if(gate)gate.hidden=true;
    document.body.classList.remove('auth-pending');
    var cacheVersion=Date.now();
    loadScript('data.js?v='+cacheVersion,function(){loadScript('source-years.js?v='+cacheVersion,function(){loadScript('app.js?v='+cacheVersion,function(){});});});
  }

  function showPasswordError(message){
    if(error)error.textContent=message;
    if(panel){
      panel.classList.remove('auth-shake');
      void panel.offsetWidth;
      panel.classList.add('auth-shake');
    }
    if(input){input.focus();input.select();}
  }

  if(form){
    form.addEventListener('submit',function(event){
      event.preventDefault();
      if(!input||!input.value){showPasswordError('请输入访问密码');return;}
      if(input.value!==ACCESS_PASSWORD){showPasswordError('密码不正确，请重新输入');return;}
      rememberAccess();
      input.value='';
      if(error)error.textContent='';
      enterSite();
    });
  }

  if(hasValidAccess()){
    enterSite();
  }else if(input){
    window.setTimeout(function(){input.focus();},100);
  }
})();
