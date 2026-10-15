/* GameHub personalization: folders, cross-game achievement checklists, and YouTube player. */
(() => {
  'use strict';
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const localRead = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (_) { return null; } };
  const localWrite = (k,v) => localStorage.setItem(k,JSON.stringify(v));
  const sidebar = () => $('.sidebar');
  const root = () => $('#app');
  const client = () => window.ghSupabase || null;
  const routeLabel = b => (b?.innerText || b?.textContent || '').replace(/\s+/g,' ').trim();
  const iconOf = b => b?.querySelector('.nav-icon')?.textContent?.trim() || '📌';
  const navKey = 'gamehub-custom-nav-folders-v1';
  const loadFolders = () => { const v=localRead(navKey); return Array.isArray(v)?v:[]; };
  const saveFolders = v => { localWrite(navKey,v); renderFolderNav(); };
  const allNavButtons = () => $$('.sidebar button.nav[data-page]').filter(b => !b.classList.contains('nav-folder-toggle') && !b.dataset.folderClone);
  const pageOptions = () => {
    const seen = new Set();
    return allNavButtons().map(b=>({route:b.dataset.page,label:routeLabel(b),icon:iconOf(b)})).filter(x=>x.route&&!seen.has(x.route)&&seen.add(x.route));
  };
  function renderFolderNav() {
    const nav=sidebar(); if(!nav)return;
    let holder=$('#customNavFolders');
    if(!holder){holder=document.createElement('div');holder.id='customNavFolders';holder.className='custom-nav-folders';const first=nav.querySelector('.nav-group');nav.insertBefore(holder,first||nav.firstChild);}
    holder.innerHTML='';
    const folders=loadFolders(), assigned=new Set(folders.flatMap(f=>f.routes||[]));
    allNavButtons().forEach(b=>{b.hidden=assigned.has(b.dataset.page);});
    const options=pageOptions();
    folders.forEach(folder=>{
      const group=document.createElement('div');group.className='nav-group custom-nav-folder';
      const toggle=document.createElement('button');toggle.type='button';toggle.className='nav nav-folder-toggle';toggle.dataset.ghcustom='toggle-folder|'+folder.id;toggle.setAttribute('aria-expanded',String(!folder.collapsed));toggle.innerHTML='<span class="nav-icon">📁</span><span>'+esc(folder.name||'My Folder')+'</span><span class="folder-chevron">'+(folder.collapsed?'▸':'▾')+'</span>';
      group.appendChild(toggle);
      const items=document.createElement('div');items.className='folder-items';items.hidden=!!folder.collapsed;
      (folder.routes||[]).forEach(route=>{
        const opt=options.find(x=>x.route===route);if(!opt)return;
        const original=allNavButtons().find(b=>b.dataset.page===route);
        const b=original?original.cloneNode(true):document.createElement('button');
        b.hidden=false;b.dataset.folderClone='1';b.dataset.page=route;b.classList.remove('active');b.innerHTML='<span class="nav-icon">'+esc(opt.icon)+'</span><span>'+esc(opt.label)+'</span>';
        items.appendChild(b);
      });
      group.appendChild(items);holder.appendChild(group);
    });
  }
  function navManagerPage() {
    const folders=loadFolders(), options=pageOptions(), assigned=new Map();
    folders.forEach(f=>(f.routes||[]).forEach(r=>assigned.set(r,f.id)));
    root().innerHTML='<header class="page-head"><div class="eyebrow">PERSONALIZE GAMEHUB</div><h1>Customize Navigation</h1><p class="muted">Make your own folders and put the pages you use most inside them. Assigned pages move to your folder so your navigation stays shorter. These settings are saved on this device.</p></header>'+
      '<div class="grid customize-grid"><section class="card customize-card"><h2>＋ Create a folder</h2><form id="ghFolderCreateForm" class="feature-form"><label for="ghFolderName">Folder name</label><input id="ghFolderName" maxlength="32" placeholder="e.g. My Games, Minecraft, Social" required><button class="btn primary" type="submit">Create folder</button></form></section>'+
      '<section class="card customize-card"><h2>↗ Add a page to a folder</h2><form id="ghFolderAssignForm" class="feature-form"><label for="ghFolderPage">Page to move</label><select id="ghFolderPage" required>'+options.map(o=>'<option value="'+esc(o.route)+'" '+(assigned.has(o.route)?'disabled':'')+'>'+esc(o.icon+' '+o.label)+(assigned.has(o.route)?' — already in a folder':'')+'</option>').join('')+'</select><label for="ghFolderTarget">Destination folder</label><select id="ghFolderTarget" required>'+folders.map(f=>'<option value="'+esc(f.id)+'">'+esc(f.name)+'</option>').join('')+'</select><button class="btn primary" type="submit" '+(!folders.length?'disabled':'')+'>Move page into folder</button></form><p class="muted">You can move a page out of a folder or delete a folder below.</p></section></div>'+
      '<h2 class="section-title">Your folders</h2>'+ (folders.length?folders.map(f=>'<section class="card folder-manage-card"><div class="row folder-manage-title"><div><h3>📁 '+esc(f.name)+'</h3><p class="muted">'+(f.routes||[]).length+' page(s)</p></div><div class="row">'+ '<button class="btn secondary" data-ghcustom="toggle-folder|'+esc(f.id)+'" type="button">'+(f.collapsed?'Expand':'Collapse')+'</button><button class="btn danger" data-ghcustom="delete-folder|'+esc(f.id)+'" type="button">Delete folder</button></div></div><div class="folder-route-list">'+((f.routes||[]).length?(f.routes||[]).map(r=>{const o=options.find(x=>x.route===r);return '<div class="list-item"><span>'+esc((o?.icon||'📌')+' '+(o?.label||r))+'</span><button class="btn secondary" data-ghcustom="remove-page|'+esc(f.id)+'|'+esc(r)+'" type="button">Move out</button></div>';}).join(''):'<p class="muted">No pages in this folder yet. Use “Add a page to a folder” above.</p>')+'</div></section>').join(''):'<div class="card"><p class="muted">You have no folders yet. Create one to start organizing GameHub.</p></div>')+
      '<p class="footer-note">Tip: collapsed folders take up just one navigation item. Tap the folder name to expand it. Folder settings are currently local to this browser and do not sync between devices.</p>';
  }
  const catalog = [
    {key:'fortnite',name:'Fortnite',icon:'🪂',category:'Battle Royale',items:['Play your first match','Get your first Victory Royale','Complete a Daily Quest','Reach account level 10','Survive to the final 10 players']},
    {key:'roblox',name:'Roblox',icon:'🟥',category:'Platform',items:['Play your first experience','Customize your avatar','Earn a badge in an experience','Add a favorite experience','Play with a friend']},
    {key:'minecraft',name:'Minecraft',icon:'⛏️',category:'Sandbox',items:['Build your first shelter','Mine your first diamond','Enter the Nether','Craft an enchanting table','Defeat the Ender Dragon']},
    {key:'rocket-league',name:'Rocket League',icon:'🚗',category:'Sports',items:['Finish the tutorial','Score your first goal','Win a match','Make your first save','Reach a new rank']},
    {key:'valorant',name:'VALORANT',icon:'🎯',category:'Shooter',items:['Finish the training range','Win your first match','Get a multi-kill','Play a match with a friend','Unlock an Agent']},
    {key:'apex-legends',name:'Apex Legends',icon:'🛡️',category:'Battle Royale',items:['Complete the training','Finish in the top 5','Get your first win','Revive a teammate','Unlock a Legend']},
    {key:'grand-theft-auto-v',name:'Grand Theft Auto V',icon:'🚘',category:'Action',items:['Complete the prologue','Finish a story mission','Complete a side activity','Earn a medal on a mission','Explore a new area']},
    {key:'terraria',name:'Terraria',icon:'🌳',category:'Sandbox',items:['Build a basic house','Defeat the Eye of Cthulhu','Find a heart crystal','Enter the Underworld','Defeat the Wall of Flesh']},
    {key:'stardew-valley',name:'Stardew Valley',icon:'🌱',category:'Simulation',items:['Plant your first crop','Catch a fish','Reach level 5 in a skill','Upgrade a tool','Complete a Community Center bundle']},
    {key:'among-us',name:'Among Us',icon:'🚀',category:'Party',items:['Finish your first round','Complete all tasks in a round','Win as a Crewmate','Win as an Impostor','Play with friends']},
    {key:'fall-guys',name:'Fall Guys',icon:'👑',category:'Party',items:['Finish your first round','Qualify for a final','Win a show','Complete a daily challenge','Unlock a cosmetic']},
    {key:'overwatch-2',name:'Overwatch 2',icon:'🦸',category:'Shooter',items:['Finish a match','Win a match','Play three different heroes','Complete a challenge','Win with a friend']}
  ];
  let trackerMount=null, trackerUser='local', trackerKey='gh-game-achievements-local', trackerData={games:[],selected:''}, trackerQuery='';
  const slug = s => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,100)||('custom-'+Date.now());
  const seedGame = (name, meta) => ({key:meta?.key||slug(name),name,icon:meta?.icon||'🎮',category:meta?.category||'Custom game',achievements:(meta?.items||['Play your first match or session','Complete a challenge or objective','Unlock something new','Reach a personal milestone']).map((n,i)=>({id:'starter-'+i,name:n,done:false,custom:false}))});
  const currentGame = () => trackerData.games.find(g=>g.key===trackerData.selected)||trackerData.games[0]||null;
  async function currentUserId() { const c=client();if(!c)return null;try{const r=await c.auth.getUser();return r.data?.user?.id||null;}catch(_){return null;} }
  async function loadTracker(mount) {
    trackerMount=mount; trackerUser=await currentUserId()||'local';trackerKey='gh-game-achievements-'+trackerUser;
    const saved=localRead(trackerKey);trackerData=saved&&Array.isArray(saved.games)?saved:{games:[],selected:''};
    if(trackerUser!=='local'){
      const c=client();
      const res=await c.from('gamehub_game_achievement_lists').select('game_key,game_name,achievements,updated_at').eq('user_id',trackerUser);
      if(!res.error){
        const remote=res.data||[],remoteKeys=new Set(remote.map(r=>r.game_key));
        remote.forEach(r=>{const old=trackerData.games.find(g=>g.key===r.game_key);trackerData.games=trackerData.games.filter(g=>g.key!==r.game_key);trackerData.games.push({...seedGame(r.game_name,{key:r.game_key}),...(old||{}),key:r.game_key,name:r.game_name,achievements:Array.isArray(r.achievements)?r.achievements:(old?.achievements||[])});});
        const localOnly=trackerData.games.filter(g=>!remoteKeys.has(g.key));
        for(const g of localOnly) await syncGame(g);
        if(!trackerData.selected&&trackerData.games[0])trackerData.selected=trackerData.games[0].key;
        localWrite(trackerKey,trackerData);
      }
    }
    if(!trackerData.games.length){trackerData.games=[seedGame('Fortnite',catalog[0]),seedGame('Roblox',catalog[1]),seedGame('Minecraft',catalog[2])];trackerData.selected='fortnite';localWrite(trackerKey,trackerData);}
    if(!trackerData.selected||!trackerData.games.some(g=>g.key===trackerData.selected))trackerData.selected=trackerData.games[0]?.key||'';
    renderGameTracker();
  }
  async function syncGame(game) {
    localWrite(trackerKey,trackerData);
    if(trackerUser==='local')return;
    const c=client();if(!c)return;
    const {error}=await c.from('gamehub_game_achievement_lists').upsert({user_id:trackerUser,game_key:game.key,game_name:game.name,achievements:game.achievements,updated_at:new Date().toISOString()},{onConflict:'user_id,game_key'});
    if(error)console.warn('Game achievement sync:',error.message);
  }
  function renderGameTracker() {
    const mount=trackerMount;if(!mount||!mount.isConnected)return;
    const query=trackerQuery.trim().toLowerCase(),matches=catalog.filter(g=>(g.name+' '+g.category).toLowerCase().includes(query)).slice(0,8);
    const current=currentGame();
    mount.innerHTML='<div class="game-tracker-head"><div><div class="eyebrow">GAME CHECKLIST</div><h2>Track achievements in your games</h2><p class="muted">Choose a game, search the starter catalog, or type any game name. Check off the goals you have not completed yet.</p></div><div class="game-tracker-count"><strong>'+trackerData.games.reduce((n,g)=>n+g.achievements.filter(a=>a.done).length,0)+'</strong><small>checked off</small></div></div>'+
      '<form id="ghGameSearchForm" class="game-search-form"><label for="ghGameSearch">Find a game or paste/type its title</label><div class="search-row"><input id="ghGameSearch" value="'+esc(trackerQuery)+'" placeholder="Fortnite, Roblox, Minecraft, or any game name"><button class="btn primary" type="submit">Search games</button></div></form>'+
      '<div class="game-picker-grid">'+matches.map(g=>'<button type="button" class="game-picker '+(current?.key===g.key?'selected':'')+'" data-ghcustom="add-catalog-game|'+esc(g.key)+'"><span class="game-picker-icon">'+esc(g.icon)+'</span><span><strong>'+esc(g.name)+'</strong><small>'+esc(g.category)+' · starter checklist</small></span><span class="game-picker-action">'+(trackerData.games.some(x=>x.key===g.key)?'Open':'＋ Add')+'</span></button>').join('')+
      (query&&!catalog.some(g=>g.name.toLowerCase()===query)&&!trackerData.games.some(g=>g.name.toLowerCase()===query)?'<button type="button" class="game-picker custom-game-choice" data-ghcustom="add-custom-game|'+encodeURIComponent(trackerQuery.trim())+'"><span class="game-picker-icon">🎮</span><span><strong>Add “'+esc(trackerQuery.trim())+'”</strong><small>Custom game · starter checklist you can edit</small></span><span class="game-picker-action">＋ Add</span></button>':'')+
      '</div><div class="game-tracker-actions"><button type="button" class="btn secondary" data-ghcustom="add-custom-game|">＋ Add a custom game</button><button type="button" class="btn secondary" data-ghcustom="sync-game-tracker">Sync game lists</button></div>'+
      (current?'<section class="card current-game-card"><div class="row current-game-title"><div class="row"><span class="game-picker-icon">'+esc(current.icon||'🎮')+'</span><div><div class="eyebrow">'+esc(current.category||'GAME')+'</div><h3>'+esc(current.name)+'</h3></div></div><button class="btn danger" type="button" data-ghcustom="remove-game|'+esc(current.key)+'">Remove game</button></div><div class="game-check-progress"><span>'+current.achievements.filter(a=>a.done).length+' / '+current.achievements.length+' completed</span><div class="achievement-track"><span style="width:'+(current.achievements.length?Math.round(current.achievements.filter(a=>a.done).length/current.achievements.length*100):0)+'%"></span></div></div><div class="game-achievement-list">'+current.achievements.map(a=>'<label class="game-achievement-row '+(a.done?'game-achievement-done':'')+'"><input type="checkbox" data-ghcustom="toggle-game-achievement|'+esc(current.key)+'|'+esc(a.id)+'" '+(a.done?'checked':'')+'><span class="game-achievement-copy"><strong>'+esc(a.name)+'</strong><small>'+(a.custom?'Custom goal':'Starter goal')+'</small></span>'+(a.custom?'<button type="button" class="text-action" data-ghcustom="remove-game-achievement|'+esc(current.key)+'|'+esc(a.id)+'">Remove</button>':'')+'</label>').join('')+'</div><form id="ghAddGameAchievementForm" class="add-achievement-form"><label for="ghNewGameAchievement">Add your own achievement / goal</label><div class="search-row"><input id="ghNewGameAchievement" maxlength="140" placeholder="e.g. Win 10 matches" required><button class="btn primary" type="submit">Add goal</button></div></form></section>':'<div class="card"><p class="muted">Choose a game above to start its checklist.</p></div>')+
      '<p class="footer-note">Game achievements are personal checklists: GameHub cannot automatically read or verify your Fortnite, Roblox, console, Steam, or other game account progress. Starter goals are editable ideas, not an official achievement database. '+(trackerUser==='local'?'Sign in to sync lists to your GameHub account.':'Your game lists are associated with your signed-in GameHub account.')+'</p>';
  }
  function addGame(name, meta) {
    const clean=String(name||'').trim().slice(0,120);if(!clean)return;
    const key=meta?.key||slug(clean);let g=trackerData.games.find(x=>x.key===key);
    if(!g){g=seedGame(clean,meta);trackerData.games.push(g);}
    trackerData.selected=g.key;trackerQuery='';syncGame(g).then(renderGameTracker);renderGameTracker();
  }
  function renderYoutube() {
    root().innerHTML='<header class="page-head"><div class="eyebrow">WATCH</div><h1>YouTube</h1><p class="muted">Search YouTube and play videos inside GameHub. Paste a YouTube video link or ID to load the embedded player.</p></header>'+
      '<section class="card youtube-search-card"><form id="ghYoutubeForm" class="feature-form"><label for="ghYoutubeInput">Video link, video ID, or search phrase</label><input id="ghYoutubeInput" placeholder="Paste a YouTube link or search for videos" autocomplete="off"><div class="row youtube-actions"><button class="btn primary" type="submit">Load video / search</button><a class="btn secondary" href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">Open YouTube</a></div></form><p id="ghYoutubeHint" class="muted">For an embedded player, enter a video URL such as youtube.com/watch?v=… . A homepage cannot be displayed in an iframe because YouTube blocks embedding its homepage.</p></section>'+
      '<section class="card youtube-player-card"><div id="ghYoutubePlayer" class="youtube-player-placeholder"><span>▶️</span><h2>Your video will appear here</h2><p class="muted">Paste a video link above to play it without leaving GameHub.</p></div></section><div id="ghYoutubeSearchLink"></div>';
  }
  function videoId(value) {
    const s=String(value||'').trim();if(/^[a-zA-Z0-9_-]{11}$/.test(s))return s;
    try { const u=new URL(s.includes('://')?s:'https://'+s);if(u.hostname==='youtu.be'||u.hostname.endsWith('.youtu.be'))return u.pathname.split('/').filter(Boolean)[0]?.slice(0,11)||'';if(u.hostname.includes('youtube.com')||u.hostname.includes('youtube-nocookie.com')){const v=u.searchParams.get('v');if(v)return v.slice(0,11);const parts=u.pathname.split('/').filter(Boolean);const at=parts.findIndex(x=>['embed','shorts','live'].includes(x));if(at>=0&&parts[at+1])return parts[at+1].slice(0,11);}}catch(_){}return '';
  }
  function submitYoutube() {
    const input=$('#ghYoutubeInput'),value=input?.value.trim()||'';if(!value)return;
    const id=videoId(value),player=$('#ghYoutubePlayer'),search=$('#ghYoutubeSearchLink'),hint=$('#ghYoutubeHint');
    if(id){player.innerHTML='<div class="youtube-frame-wrap"><iframe src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'?rel=0" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>';search.innerHTML='<p class="muted">Video loaded in the embedded player. <a href="https://www.youtube.com/watch?v='+encodeURIComponent(id)+'" target="_blank" rel="noopener noreferrer">Open this video on YouTube</a></p>';hint.textContent='If a creator disables embedding, use the link to watch on YouTube.';}
    else {const url='https://www.youtube.com/results?search_query='+encodeURIComponent(value);search.innerHTML='<div class="notice">Search results open on YouTube. Choose a video there, copy its link, and paste it above to play it here.</div><p><a class="btn primary" href="'+url+'" target="_blank" rel="noopener noreferrer">Search YouTube for “'+esc(value)+'”</a></p>';player.innerHTML='<div class="youtube-player-placeholder"><span>🔎</span><h2>Search results ready</h2><p class="muted">Open the search results, copy a video link, and paste it back here to embed it.</p></div>';hint.textContent='GameHub can embed individual videos, not the YouTube homepage or the full YouTube website.';}
  }
  function handleCustomAction(action) {
    const parts=action.split('|'),type=parts[0],a=parts[1],b=parts[2];
    if(type==='toggle-folder'){const fs=loadFolders(),f=fs.find(x=>x.id===a);if(f){f.collapsed=!f.collapsed;saveFolders(fs);if(root()&&window.ghxCurrentRoute==='customize-nav')navManagerPage();}return true;}
    if(type==='delete-folder'){if(!confirm('Delete this folder? Its pages will return to the main navigation.'))return true;saveFolders(loadFolders().filter(f=>f.id!==a));navManagerPage();return true;}
    if(type==='remove-page'){const fs=loadFolders(),f=fs.find(x=>x.id===a);if(f)f.routes=(f.routes||[]).filter(r=>r!==b);saveFolders(fs);navManagerPage();return true;}
    if(type==='add-catalog-game'){const g=catalog.find(x=>x.key===a);if(g)addGame(g.name,g);return true;}
    if(type==='add-custom-game'){let name='';try{name=decodeURIComponent(a||'')}catch(_){name=a||''}if(!name){name=prompt('What is the game called?')||'';}if(name)addGame(name,null);return true;}
    if(type==='toggle-game-achievement'){const game=trackerData.games.find(g=>g.key===a),ach=game?.achievements.find(x=>x.id===b);if(game&&ach){ach.done=!ach.done;syncGame(game).then(renderGameTracker);renderGameTracker();}return true;}
    if(type==='remove-game-achievement'){const game=trackerData.games.find(g=>g.key===a);if(game){game.achievements=game.achievements.filter(x=>x.id!==b);syncGame(game).then(renderGameTracker);renderGameTracker();}return true;}
    if(type==='remove-game'){if(!confirm('Remove this game and its checklist?'))return true;trackerData.games=trackerData.games.filter(g=>g.key!==a);trackerData.selected=trackerData.games[0]?.key||'';localWrite(trackerKey,trackerData);if(trackerUser!=='local'){const c=client();c?.from('gamehub_game_achievement_lists').delete().eq('user_id',trackerUser).eq('game_key',a).then(()=>{});}renderGameTracker();return true;}
    if(type==='sync-game-tracker'){const mount=$('#ghGameAchievementMount');if(mount)loadTracker(mount);return true;}
    return false;
  }
  document.addEventListener('click',e=>{
    const custom=e.target.closest('[data-ghcustom]');
    if(custom){const action=custom.dataset.ghcustom;if(handleCustomAction(action)){e.preventDefault();e.stopImmediatePropagation();return;}}
    const nav=e.target.closest('[data-page]');
    if(nav&&nav.dataset.page==='customize-nav'){e.preventDefault();e.stopImmediatePropagation();window.ghxCurrentRoute='customize-nav';navManagerPage();$$('.sidebar .nav[data-page]').forEach(b=>b.classList.toggle('active',b===nav||b.dataset.page==='customize-nav'));window.scrollTo(0,0);return;}
    if(nav&&nav.dataset.page==='youtube'){e.preventDefault();e.stopImmediatePropagation();window.ghxCurrentRoute='youtube';renderYoutube();$$('.sidebar .nav[data-page]').forEach(b=>b.classList.toggle('active',b===nav||b.dataset.page==='youtube'));window.scrollTo(0,0);return;}
  },true);
  document.addEventListener('submit',e=>{
    const form=e.target;
    if(form.id==='ghFolderCreateForm'){e.preventDefault();e.stopImmediatePropagation();const name=$('#ghFolderName').value.trim().slice(0,32);if(!name)return;const fs=loadFolders();fs.push({id:'folder-'+Date.now(),name,routes:[],collapsed:true});saveFolders(fs);navManagerPage();return;}
    if(form.id==='ghFolderAssignForm'){e.preventDefault();e.stopImmediatePropagation();const route=$('#ghFolderPage').value,folderId=$('#ghFolderTarget').value;if(!folderId)return;const fs=loadFolders();fs.forEach(f=>f.routes=(f.routes||[]).filter(r=>r!==route));const f=fs.find(x=>x.id===folderId);if(f){f.routes.push(route);f.collapsed=false;}saveFolders(fs);navManagerPage();return;}
    if(form.id==='ghGameSearchForm'){e.preventDefault();e.stopImmediatePropagation();trackerQuery=$('#ghGameSearch').value.trim();renderGameTracker();return;}
    if(form.id==='ghAddGameAchievementForm'){e.preventDefault();e.stopImmediatePropagation();const name=$('#ghNewGameAchievement').value.trim();const g=currentGame();if(!g||!name)return;g.achievements.push({id:'custom-'+Date.now(),name:name.slice(0,140),done:false,custom:true});syncGame(g).then(renderGameTracker);renderGameTracker();return;}
    if(form.id==='ghYoutubeForm'){e.preventDefault();e.stopImmediatePropagation();submitYoutube();return;}
  },true);
  const observer=new MutationObserver(()=>{
    const mount=$('#ghGameAchievementMount');
    if(mount&&!mount.dataset.ready){mount.dataset.ready='1';loadTracker(mount);}
  });
  function start(){const nav=sidebar();if(nav)renderFolderNav();if(root())observer.observe(root(),{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.addEventListener('storage',e=>{if(e.key===navKey)renderFolderNav();});
})();