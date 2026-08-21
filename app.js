(function(){
try{
  var D=window.QUOTE_DATA||{meta:{categories:[]},quotes:[],articles:[]};
  var Q=D.quotes||[],M=D.meta||{categories:[],count:Q.length},A=(D.articles||[]).slice();
  var SOURCE_YEAR_DATA=window.QUOTE_SOURCE_YEARS||{sources:{}};
  var SOURCE_YEARS=SOURCE_YEAR_DATA.sources||{};
  var app=document.getElementById('app');
  var state={view:'home',cat:'',id:'',query:'',year:'',source:'',drawer:false};

  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});}
  function trim(s){return String(s||'').replace(/^\s+|\s+$/g,'');}
  function findQuote(id){for(var i=0;i<Q.length;i++)if(Q[i].id===id)return{item:Q[i],index:i};return null;}
  function findArticle(id){for(var i=0;i<A.length;i++)if(A[i].id===id)return{item:A[i],index:i};return null;}
  function byCategory(name){var out=[];for(var i=0;i<Q.length;i++)if(Q[i].category===name)out.push(Q[i]);return out;}
  function pageTitle(t){document.title=t?(t+'｜晖常语录'):'晖常语录';}
  function excerpt(text,max){text=String(text||'').replace(/\s+/g,' ');return text.length<=max?text:text.slice(0,max-1)+'…';}
  function sourceYearValue(block){
    var source=trim(block&&block.source),value=Number(block&&block.sourceYear||SOURCE_YEARS[source]||0);
    return isFinite(value)&&value>0?value:0;
  }
  function repairKnownDataIssue(){
    var badText='痛苦难以避免，磨难可以选择。出处为村上春树的《当我跑步时我谈些什么》，大意为：生理上的痛苦难以避免，但主观上的感受是可以选择的。';
    for(var i=0;i<Q.length;i++){
      var q=Q[i],blocks=q.blocks||[],bad=false,real=null;
      for(var j=0;j<blocks.length;j++){
        if(!trim(blocks[j].text)&&trim(blocks[j].source)===badText)bad=true;
        else if(!trim(blocks[j].text)&&trim(blocks[j].source)&&!real)real=blocks[j];
      }
      if((q.id==='q-09-004'||bad)&&bad&&real){
        q.blocks=[{text:badText,source:trim(real.source),sourceUrl:trim(real.sourceUrl),sourceYear:sourceYearValue(real)}];
        q.content=badText;q.sources=[trim(real.source)];q.sourceUrl=trim(real.sourceUrl);
      }
    }
  }
  repairKnownDataIssue();
  function quoteSourceEntries(q){
    var out=[],seen={},blocks=q&&q.blocks||[],i,source,year;
    for(i=0;i<blocks.length;i++){
      source=trim(blocks[i]&&blocks[i].source);if(!source||seen[source])continue;
      seen[source]=true;year=sourceYearValue(blocks[i]);out.push({name:source,year:year});
    }
    if(!out.length){
      var sources=q&&q.sources||[];
      for(i=0;i<sources.length;i++){source=trim(sources[i]);if(!source||seen[source])continue;seen[source]=true;out.push({name:source,year:Number(SOURCE_YEARS[source])||0});}
    }
    return out;
  }
  function sourceCatalog(){
    var map={},entries,i,j,q,item,entry,priority=(M&&M.sourcePriority)||{};
    for(i=0;i<Q.length;i++){
      q=Q[i];entries=quoteSourceEntries(q);
      for(j=0;j<entries.length;j++){
        entry=entries[j];item=map[entry.name];
        if(!item)item=map[entry.name]={name:entry.name,year:entry.year||0,quoteIds:{},count:0,firstOrder:Number(q.order)||i+1};
        if(!item.year&&entry.year)item.year=entry.year;
        if(!item.quoteIds[q.id]){item.quoteIds[q.id]=true;item.count++;}
        item.firstOrder=Math.min(item.firstOrder,Number(q.order)||i+1);
      }
    }
    var out=[];for(var key in map)if(Object.prototype.hasOwnProperty.call(map,key))out.push(map[key]);
    out.sort(function(a,b){var pa=Number(priority[a.name])||9999,pb=Number(priority[b.name])||9999;return b.year-a.year||pa-pb||a.firstOrder-b.firstOrder||a.name.localeCompare(b.name,'zh-CN');});return out;
  }
  function quotesBySource(source){
    var out=[];for(var i=0;i<Q.length;i++){var entries=quoteSourceEntries(Q[i]);for(var j=0;j<entries.length;j++)if(entries[j].name===source){out.push(Q[i]);break;}}return out;
  }
  function sourceKey(source){return encodeURIComponent(source).replace(/'/g,'%27');}
  function quoteText(q){
    var content=trim(q&&q.content);if(content)return content;
    var blocks=q&&q.blocks||[],parts=[];
    for(var i=0;i<blocks.length;i++)if(trim(blocks[i]&&blocks[i].text))parts.push(trim(blocks[i].text));
    return parts.join('\n\n');
  }
  function formatNumber(value){return String(Number(value)||0).replace(/\B(?=(\d{3})+(?!\d))/g,',');}
  function totalTextCount(){var total=0;for(var i=0;i<Q.length;i++)total+=quoteText(Q[i]).replace(/\s/g,'').length;return total;}
  function totalTextLabel(){var total=totalTextCount();return total>=10000?'近'+Math.max(1,Math.round(total/10000))+'万字':formatNumber(total)+' 字';}
  function quoteUpdatedValue(q){
    var values=[q&&q.updatedTime,q&&q.createdTime];
    for(var i=0;i<values.length;i++){var parsed=Date.parse(values[i]||'');if(!isNaN(parsed))return parsed;}
    return 0;
  }
  function sourceLabel(q){var entries=quoteSourceEntries(q),s=[];for(var i=0;i<entries.length;i++)s.push(entries[i].name);return s.length?s.join('；'):'出处待补';}
  function safeUrl(value){
    var text=trim(value);if(!text)return'';
    try{var url=new URL(text);return url.protocol==='http:'||url.protocol==='https:'?url.href:'';}catch(e){return'';}
  }
  function blockSource(block){
    var source=trim(block&&block.source),url=safeUrl(block&&block.sourceUrl),label=source||'原文链接';
    var summary=source?'<a class="source-summary-link" href="#source/'+esc(sourceKey(source))+'">出处：'+esc(label)+'</a>':'<span>原文链接</span>';
    if(url)return'<div class="source source-link">'+summary+'<a class="source-link-action" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">查看原文 ↗</a></div>';
    return source?'<div class="source">'+summary+'</div>':'';
  }
  function articleDateValue(value){
    var text=trim(value);if(!text)return null;
    text=text.replace(/\s+/g,'').replace(/[年\.\/]/g,'-').replace(/月/g,'-').replace(/日/g,'');
    var match=text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if(match){
      var year=Number(match[1]),month=Number(match[2]),day=Number(match[3]),date=new Date(year,month-1,day);
      if(date.getFullYear()===year&&date.getMonth()===month-1&&date.getDate()===day)return date.getTime();
      return null;
    }
    var parsed=Date.parse(text);return isNaN(parsed)?null:parsed;
  }
  function articleCollectedValue(a){return articleDateValue(a&&a.collectedAt||a&&a.date||'');}
  function articleCollectedLabel(a){return trim(a&&a.collectedAt||a&&a.date||'')||'时间待补';}
  function articleParagraphs(a){
    var raw=a&&a.content;
    if(Array.isArray(raw))return raw.map(function(item){return trim(typeof item==='string'?item:item&&item.text);}).filter(Boolean);
    if(trim(raw))return String(raw).split(/\n\s*\n/).map(trim).filter(Boolean);
    var paragraphs=a&&a.paragraphs;
    return Array.isArray(paragraphs)?paragraphs.map(function(item){return trim(typeof item==='string'?item:item&&item.text);}).filter(Boolean):[];
  }
  function articleParagraphHtml(text){
    var match=String(text||'').match(/^((?:第一|第二|第三|第四|第五)[，、][^。！？]*[。！？])/);
    if(match)return'<p><strong>'+esc(match[1])+'</strong>'+esc(String(text).slice(match[1].length))+'</p>';
    return'<p>'+esc(text)+'</p>';
  }
  function hi(s,q){
    s=esc(s);q=trim(q);if(!q)return s;
    var keys=q.split(/\s+/).filter(Boolean);
    for(var i=0;i<keys.length;i++){var e=keys[i].replace(/[.*+?^${}()|[\]\\]/g,'\\$&');s=s.replace(new RegExp(e,'gi'),function(m){return'<mark>'+m+'</mark>';});}
    return s;
  }
  function searchQuotes(query){
    var term=trim(query).toLowerCase();if(!term)return[];
    var keys=term.split(/\s+/).filter(Boolean),result=[];
    for(var i=0;i<Q.length;i++){
      var q=Q[i],title=(q.title||'').toLowerCase(),body=(q.content||'').toLowerCase(),src=(q.sources||[]).join(' ').toLowerCase(),ok=true,score=0;
      for(var j=0;j<keys.length;j++){var k=keys[j];if(title.indexOf(k)<0&&body.indexOf(k)<0&&src.indexOf(k)<0){ok=false;break;}if(title.indexOf(k)>=0)score+=5;if(body.indexOf(k)>=0)score+=2;if(src.indexOf(k)>=0)score+=1;}
      if(ok)result.push({q:q,score:score});
    }
    result.sort(function(a,b){return b.score-a.score||b.q.order-a.q.order;});return result;
  }
  function quoteSourceHtml(q,query){
    var entries=quoteSourceEntries(q),parts=[];
    if(!entries.length)return'<div class="quote-source">出处待补</div>';
    for(var i=0;i<entries.length;i++)parts.push('<a href="#source/'+esc(sourceKey(entries[i].name))+'">'+hi(entries[i].name,query||'')+'</a>');
    return'<div class="quote-source"><span>出处：</span>'+parts.join('<span class="source-separator">；</span>')+'</div>';
  }
  function quoteCard(q,query,showCategory){
    var source=quoteSourceHtml(q,query||'');
    var footer=showCategory?'<div class="quote-meta-row">'+source+'<div class="quote-category" title="收录于“'+esc(q.category)+'”">收录于“'+esc(q.category)+'”</div></div>':source;
    return'<article class="quote-card"><button type="button" class="quote-card-main" onclick="location.hash=\'quote/'+q.id+'\'"><h3>'+hi(q.title,query||'')+'</h3><p>'+hi(excerpt(q.content,100),query||'')+'</p></button>'+footer+'</article>';
  }
  function articleCard(a){
    var paragraphs=articleParagraphs(a),hasBody=paragraphs.length>0,url=safeUrl(a.url),tag=hasBody?'button':url?'a':'div';
    var attrs=hasBody?' type="button" onclick="location.hash=\'article/'+esc(a.id)+'\'"':url?' href="'+esc(url)+'" target="_blank" rel="noopener noreferrer"':'';
    var account=trim(a.account)?'<span>'+esc(a.account)+'</span>':'';
    var subtitle=trim(a.subtitle)?'<p class="article-card-subtitle">'+esc(a.subtitle)+'</p>':'';
    return'<'+tag+' class="article-card"'+attrs+'><h3>'+esc(a.title)+'</h3>'+subtitle+'<div class="article-meta">'+account+'<span>收录时间：'+esc(articleCollectedLabel(a))+'</span></div></'+tag+'>';
  }
  function searchForm(v){return'<form class="searchbox" onsubmit="goSearch(event)"><input id="searchInput" value="'+esc(v||'')+'" placeholder="搜索语录标题、正文或出处"><button class="btn-primary">搜索</button></form>';}
  function bottomNav(active){return'<nav class="bottomnav"><button '+(active==='home'?'class="active"':'')+' onclick="location.hash=\'\'"><span>首页</span></button><button '+(active==='sources'?'class="active"':'')+' onclick="location.hash=\'sources\'"><span>按出处分类</span></button><button '+(active==='articles'?'class="active"':'')+' onclick="location.hash=\'articles\'"><span>已收录文章</span></button></nav>';}
  function topbar(title){return'<header class="topbar"><button class="iconbtn" onclick="goBack()">返回</button><div class="topbar-title">'+esc(title)+'</div><button class="iconbtn" onclick="openDrawer()">主题</button></header>';}

  function homeView(){
    pageTitle('');
    var categories='',i;
    for(i=0;i<M.categories.length;i++){var c=M.categories[i];categories+='<button class="cat" onclick="location.hash=\'category/'+encodeURIComponent(c.name)+'\'"><b>'+esc(c.name)+'</b><span>'+esc(c.count)+' 条语录</span></button>';}
    var latest=[],latestHtml='';
    for(i=0;i<Q.length;i++)if(Q[i].highlighted)latest.push(Q[i]);
    latest.sort(function(a,b){var la=Number(a.latestOrder)||0,lb=Number(b.latestOrder)||0;if(la||lb)return lb-la;return quoteUpdatedValue(b)-quoteUpdatedValue(a)||(Number(b.order)||0)-(Number(a.order)||0);});
    for(i=0;i<latest.length;i++)latestHtml+=quoteCard(latest[i],'',true);
    return'<main class="shell"><section class="hero"><div class="hero-portrait"><img src="portrait.png" alt="人物照片"></div><div class="hero-copy"><h1 class="hero-title"><span class="hero-calligraphy">晖</span><span>常语录</span></h1><p class="hero-motto">简单专注 · 内心宁静 · 积极向上</p></div></section><div class="search-panel">'+searchForm(state.query||'')+'<div class="home-meta" aria-label="内容统计"><span class="meta-chip">'+formatNumber(Q.length)+' 条语录</span><span class="meta-chip">'+formatNumber(M.categories.length)+' 个主题</span><span class="meta-chip">'+totalTextLabel()+'</span></div></div><section class="section"><div class="section-head"><h2>主题目录</h2><div class="sub">点击进入</div></div><div class="categories">'+categories+'</div></section><section class="section"><div class="section-head"><h2>最新收录</h2><div class="sub">'+latest.length+' 条 · 按更新时间排序</div></div><div class="quote-list">'+latestHtml+'</div></section></main>'+bottomNav('home');
  }
  function categoryView(){
    pageTitle(state.cat);
    var list=byCategory(state.cat).slice().reverse(),html='';
    for(var i=0;i<list.length;i++)html+=quoteCard(list[i],'');
    return'<main class="shell">'+topbar(state.cat)+'<section class="section"><div class="section-head"><h2>'+esc(state.cat)+'</h2><div class="sub">'+list.length+' 条语录 · 倒序排列</div></div><div class="quote-list">'+html+'</div></section></main>'+bottomNav('home');
  }
  function sourcesView(){
    pageTitle('按出处分类');
    var catalog=sourceCatalog(),yearCounts={},hasPending=false,i;
    for(i=0;i<catalog.length;i++){if(catalog[i].year)yearCounts[catalog[i].year]=(yearCounts[catalog[i].year]||0)+1;else hasPending=true;}
    var minYear=2013,maxYear=2026;
    for(i=0;i<catalog.length;i++)if(catalog[i].year){minYear=Math.min(minYear,catalog[i].year);maxYear=Math.max(maxYear,catalog[i].year);}
    var selected=state.year||String(maxYear),selectedNumber=Number(selected),yearButtons='';
    if((selected==='pending'&&!hasPending)||(selected!=='pending'&&!yearCounts[selectedNumber])){selected=String(maxYear);selectedNumber=maxYear;}
    for(i=maxYear;i>=minYear;i--)if(yearCounts[i])yearButtons+='<button '+(selectedNumber===i?'class="active"':'')+' onclick="location.hash=\'sources/'+i+'\'"><b>'+i+'</b></button>';
    if(hasPending)yearButtons+='<button '+(selected==='pending'?'class="active"':'')+' onclick="location.hash=\'sources/pending\'"><b>待补</b></button>';
    var visible=catalog.filter(function(item){return selected==='pending'?!item.year:item.year===selectedNumber;}),cards='';
    for(i=0;i<visible.length;i++)cards+='<button class="source-card" onclick="location.hash=\'source/'+esc(sourceKey(visible[i].name))+'\'"><span class="source-card-name">'+esc(visible[i].name)+'</span><span class="source-card-count">'+visible[i].count+' 条语录 <b>›</b></span></button>';
    if(!cards)cards='<div class="source-empty">这一年暂未收录出处</div>';
    var yearLabel=selected==='pending'?'待补年份':selected+' 年';
    return'<main class="shell">'+topbar('按出处分类')+'<section class="section"><div class="section-head"><h2>按出处分类</h2></div><div class="source-browser"><nav class="year-rail" aria-label="出处年份">'+yearButtons+'</nav><div class="source-results"><div class="source-year-head"><h3>'+esc(yearLabel)+'</h3></div><div class="source-card-list">'+cards+'</div></div></div></section></main>'+bottomNav('sources');
  }
  function sourceView(){
    var source=state.source,list=quotesBySource(source),catalog=sourceCatalog(),item=null,html='';
    for(var i=0;i<catalog.length;i++)if(catalog[i].name===source){item=catalog[i];break;}
    pageTitle(source||'出处汇总');
    for(i=0;i<list.length;i++)html+=quoteCard(list[i],'',true);
    if(!html)html='<div class="empty">没有找到这个出处对应的语录<br><a class="text-link" href="#sources">返回按出处分类</a></div>';
    var year=item&&item.year?item.year+' 年':'年份待补';
    return'<main class="shell">'+topbar('出处汇总')+'<section class="source-summary-hero"><span>'+esc(year)+' · 出处汇总</span><h1>'+esc(source||'未知出处')+'</h1><p>共收录 '+list.length+' 条相关语录</p></section><section class="section"><div class="quote-list">'+html+'</div></section></main>'+bottomNav('sources');
  }
  function searchView(){
    pageTitle('搜索');
    var query=state.query||'',result=searchQuotes(query),body='';
    if(trim(query)){if(result.length){body='<div class="quote-list">';for(var i=0;i<result.length;i++)body+=quoteCard(result[i].q,query);body+='</div>';}else body='<div class="empty">没有找到包含“'+esc(query)+'”的语录</div>';}else body='<div class="empty">输入“长期”“价值”“客户”等关键词试试</div>';
    return'<main class="shell">'+topbar('搜索语录')+'<section class="section">'+searchForm(query)+'<div class="section-head"><h2>'+(trim(query)?'搜索结果':'搜索语录')+'</h2><div class="sub">'+(trim(query)?result.length+' 条命中':'支持标题、正文、出处匹配')+'</div></div>'+body+'</section></main>'+bottomNav('home');
  }
  function detailView(){
    var found=findQuote(state.id);if(!found)return homeView();
    var q=found.item,index=found.index,blocks='';
    pageTitle(q.title);
    for(var i=0;i<q.blocks.length;i++){var b=q.blocks[i];if(!b.text)continue;blocks+='<section class="bodyblock"><p>'+esc(b.text)+'</p>'+blockSource(b)+'</section>';}
    return'<main class="shell">'+topbar(q.title)+'<article class="detail"><div class="crumb">'+esc(q.category)+'</div><h1>'+esc(q.title)+'</h1>'+blocks+'<div class="actions"><button class="btn-primary" onclick="copyQuote(\''+q.id+'\')">复制文字</button><button class="btn-ghost" onclick="makePoster(\''+q.id+'\')">生成分享图</button></div><div class="pager"><button class="btn-light" '+(index<=0?'disabled':'')+' onclick="location.hash=\'quote/'+Q[Math.max(0,index-1)].id+'\'">上一篇</button><button class="btn-light" '+(index>=Q.length-1?'disabled':'')+' onclick="location.hash=\'quote/'+Q[Math.min(Q.length-1,index+1)].id+'\'">下一篇</button></div></article></main>'+bottomNav('home');
  }
  function articlesView(){
    pageTitle('已收录文章');var list=A.slice();
    list.sort(function(a,b){var da=articleCollectedValue(a),db=articleCollectedValue(b);if(da!==null&&db!==null)return db-da;if(db!==null)return 1;if(da!==null)return-1;return 0;});
    var html='';for(var i=0;i<list.length;i++)html+=articleCard(list[i]);
    return'<main class="shell">'+topbar('已收录文章')+'<section class="section"><div class="section-head"><h2>已收录文章</h2><div class="sub">'+list.length+' 篇 · 按收录时间从新到旧</div></div><div class="article-list">'+html+'</div></section></main>'+bottomNav('articles');
  }
  function articleDetailView(){
    var found=findArticle(state.id),a=found&&found.item;if(!a)return articlesView();
    var paragraphs=articleParagraphs(a),body='';pageTitle(a.title);
    for(var i=0;i<paragraphs.length;i++)body+=articleParagraphHtml(paragraphs[i]);
    var subtitle=trim(a.subtitle)?'<p class="article-subtitle">'+esc(a.subtitle)+'</p>':'';
    var account=trim(a.account)?'<span>'+esc(a.account)+'</span>':'';
    var url=safeUrl(a.url),hasBody=paragraphs.length>0,shareBtn=(!url&&hasBody)?'<button class="btn-primary" onclick="makeArticlePoster(\''+a.id+'\')">生成长图</button>':'';
    var link=url?'<div class="article-detail-actions"><a class="btn-ghost" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">查看原文 ↗</a></div>':(shareBtn?'<div class="article-detail-actions">'+shareBtn+'</div>':'');
    return'<main class="shell">'+topbar('文章全文')+'<article class="article-detail"><div class="article-kicker">已收录文章</div><h1>'+esc(a.title)+'</h1>'+subtitle+'<div class="article-detail-meta">'+account+'<span>收录时间：'+esc(articleCollectedLabel(a))+'</span></div><div class="article-body">'+body+'</div>'+link+'</article></main>'+bottomNav('articles');
  }
  function drawer(){
    var html='';for(var i=0;i<M.categories.length;i++){var c=M.categories[i];html+='<button class="cat" onclick="location.hash=\'category/'+encodeURIComponent(c.name)+'\';closeDrawer()"><b>'+esc(c.name)+'</b><span>'+esc(c.count)+' 条语录</span></button>';}
    return'<div class="drawer" onclick="drawerBackdrop(event)"><aside class="drawer-panel"><div class="drawer-head"><h3>主题目录</h3><button class="btn-ghost" onclick="closeDrawer()">关闭</button></div><div class="categories">'+html+'</div></aside></div>';
  }
  function render(){var html=state.view==='category'?categoryView():state.view==='search'?searchView():state.view==='detail'?detailView():state.view==='sources'?sourcesView():state.view==='source'?sourceView():state.view==='article'?articleDetailView():state.view==='articles'?articlesView():homeView();app.innerHTML=html+(state.drawer?drawer():'');}
  function route(){var h=location.hash.replace(/^#/,'');state.drawer=false;if(h.indexOf('quote/')===0){state.view='detail';state.id=h.split('/')[1]||'';}else if(h.indexOf('article/')===0){state.view='article';state.id=decodeURIComponent(h.substring(8));}else if(h.indexOf('category/')===0){state.view='category';state.cat=decodeURIComponent(h.substring(9));}else if(h.indexOf('source/')===0){state.view='source';state.source=decodeURIComponent(h.substring(7));}else if(h.indexOf('sources')===0){state.view='sources';state.year=decodeURIComponent(h.split('/')[1]||'');}else if(h.indexOf('search')===0){state.view='search';state.query=decodeURIComponent((h.split('?q=')[1]||''));}else if(h==='articles')state.view='articles';else{state.view='home';state.query='';}render();window.scrollTo(0,0);}
  window.goSearch=function(e){if(e)e.preventDefault();var val=document.getElementById('searchInput')?document.getElementById('searchInput').value:'';location.hash='search?q='+encodeURIComponent(trim(val));};
  window.openDrawer=function(){state.drawer=true;render();};window.closeDrawer=function(){state.drawer=false;render();};window.drawerBackdrop=function(e){if(e.target&&String(e.target.className).indexOf('drawer')>=0)closeDrawer();};
  window.goBack=function(){if(history.length>1)history.back();else location.hash='';};
  window.copyQuote=function(id){var found=findQuote(id),q=found&&found.item;if(!q)return;var text='【'+q.title+'】\n';for(var i=0;i<q.blocks.length;i++){if(!q.blocks[i].text)continue;text+=q.blocks[i].text;if(q.blocks[i].source)text+='\n（'+q.blocks[i].source+'）';text+='\n\n';}text+='——晖常语录';if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){alert('已复制，可粘贴到微信中分享');},function(){fallbackCopy(text);});}else fallbackCopy(text);};
  function fallbackCopy(text){var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');alert('已复制，可粘贴到微信中分享');}catch(e){prompt('请复制：',text);}document.body.removeChild(ta);}
  function roundedPath(ctx,x,y,w,h,r){
    r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
  }
  function canvasLines(ctx,text,maxWidth,maxLines){
    var raw=String(text||'').replace(/\r/g,''),paragraphs=raw.split('\n'),all=[],i,j,line,test,part;
    for(i=0;i<paragraphs.length;i++){
      part=paragraphs[i];line='';
      if(!part){if(all.length&&all[all.length-1]!=='')all.push('');continue;}
      for(j=0;j<part.length;j++){
        test=line+part.charAt(j);
        if(line&&ctx.measureText(test).width>maxWidth){all.push(line);line=part.charAt(j);}else line=test;
      }
      if(line)all.push(line);
      if(i<paragraphs.length-1&&all.length&&all[all.length-1]!=='')all.push('');
    }
    if(!all.length)all.push('');
    var truncated=all.length>maxLines,lines=all.slice(0,maxLines);
    if(truncated&&lines.length){
      line=lines[lines.length-1].replace(/[，。；：、…\s]+$/,'');
      while(line&&ctx.measureText(line+'…').width>maxWidth)line=line.slice(0,-1);
      lines[lines.length-1]=line+'…';
    }
    return{lines:lines,truncated:truncated};
  }
  function drawLines(ctx,result,x,y,lineHeight){for(var i=0;i<result.lines.length;i++)ctx.fillText(result.lines[i],x,y+i*lineHeight);}
  function posterText(q){
    var parts=[];
    if(q.blocks&&q.blocks.length){for(var i=0;i<q.blocks.length;i++)if(q.blocks[i]&&q.blocks[i].text)parts.push(q.blocks[i].text);}
    return parts.length?parts.join('\n\n'):String(q.content||'');
  }
  function posterFileName(title){return('晖常语录-'+String(title||'分享图')).replace(/[\\/:*?"<>|]/g,'').slice(0,48)+'.png';}
  var posterSaveData=null;
  function isWechat(){return /MicroMessenger/i.test(navigator.userAgent||'');}
  function isIOS(){return /iPad|iPhone|iPod/i.test(navigator.userAgent||'')||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);}
  function dataUrlBlob(dataUrl){
    var parts=String(dataUrl||'').split(','),match=parts[0]&&parts[0].match(/^data:([^;]+);base64$/);if(!match||!parts[1])throw new Error('图片数据无效');
    var binary=atob(parts[1]),bytes=new Uint8Array(binary.length);for(var i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return new Blob([bytes],{type:match[1]});
  }
  function setPosterTip(message,type){
    var modal=document.getElementById('posterModal'),tips=modal&&modal.querySelector('.poster-tips');if(!tips)return;
    tips.textContent=message;tips.classList.remove('poster-tip-guide','poster-tip-success');if(type)tips.classList.add(type);
  }
  function longPressGuide(){
    var modal=document.getElementById('posterModal'),stage=modal&&modal.querySelector('.poster-stage');
    setPosterTip('微信内无法由网页直接写入手机相册，请长按上方图片，选择“保存图片”。','poster-tip-guide');
    if(stage){stage.classList.remove('poster-longpress');void stage.offsetWidth;stage.classList.add('poster-longpress');if(stage.scrollIntoView)stage.scrollIntoView({behavior:'smooth',block:'center'});}
  }
  function nativeShare(blob,name){
    if(!navigator.share||typeof File==='undefined')return null;
    try{var file=new File([blob],name,{type:'image/png'}),payload={files:[file],title:'晖常语录'};if(navigator.canShare&&!navigator.canShare(payload))return null;return navigator.share(payload);}catch(e){return null;}
  }
  function downloadPoster(blob,name){
    if(!window.URL||!URL.createObjectURL)return false;
    try{var url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;link.style.display='none';document.body.appendChild(link);link.click();document.body.removeChild(link);window.setTimeout(function(){try{URL.revokeObjectURL(url);}catch(e){}},60000);return true;}catch(e){return false;}
  }
  function drawPoster(q){
    var canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1440;
    var ctx=canvas.getContext&&canvas.getContext('2d');if(!ctx)throw new Error('当前浏览器不支持图片生成');
    var navy='#0c2644',navy2='#183c63',gold='#c9a46a',beige='#f7f4ee',ink='#10233c',muted='#6d7a88';
    var gradient=ctx.createLinearGradient(0,0,1080,270);gradient.addColorStop(0,navy);gradient.addColorStop(1,navy2);ctx.fillStyle=gradient;ctx.fillRect(0,0,1080,300);
    ctx.fillStyle=beige;ctx.fillRect(0,260,1080,1180);
    ctx.save();ctx.globalAlpha=.09;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(930,40,230,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(55,245,140,0,Math.PI*2);ctx.fill();ctx.restore();

    ctx.textBaseline='alphabetic';ctx.fillStyle='#ead9bd';ctx.font='400 104px "HuicylCalligraphy","STKaiti","KaiTi",serif';ctx.fillText('晖',78,150);
    var brandX=78+ctx.measureText('晖').width+10;ctx.fillStyle='#ffffff';ctx.font='700 57px "Songti SC","SimSun",serif';ctx.fillText('常语录',brandX,142);
    ctx.fillStyle='#ead9bd';ctx.font='400 27px -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif';ctx.fillText('简单专注 · 内心宁静 · 积极向上',82,215);

    ctx.save();ctx.shadowColor='rgba(9,26,46,.13)';ctx.shadowBlur=34;ctx.shadowOffsetY=14;roundedPath(ctx,60,250,960,1080,34);ctx.fillStyle='#ffffff';ctx.fill();ctx.restore();
    roundedPath(ctx,98,304,Math.min(650,80+String(q.category||'未分类').length*32),58,29);ctx.fillStyle='#f1e7d5';ctx.fill();
    ctx.fillStyle='#9b743f';ctx.font='600 27px -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif';ctx.fillText(String(q.category||'未分类'),124,343);

    ctx.fillStyle=ink;ctx.font='700 58px -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif';
    var titleResult=canvasLines(ctx,q.title||'未命名语录',862,3),titleY=445;drawLines(ctx,titleResult,105,titleY,76);
    var bodyY=titleY+titleResult.lines.length*76+35;
    ctx.fillStyle=gold;ctx.fillRect(105,bodyY-25,6,84);
    ctx.fillStyle='#34455a';ctx.font='400 39px -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif';
    var bodyMax=Math.max(3,Math.floor((1065-bodyY)/62)),bodyResult=canvasLines(ctx,posterText(q),820,bodyMax);drawLines(ctx,bodyResult,137,bodyY,62);

    ctx.strokeStyle='#e8e1d5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(105,1111);ctx.lineTo(975,1111);ctx.stroke();
    ctx.fillStyle=muted;ctx.font='400 27px -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif';
    var sourceResult=canvasLines(ctx,'出处：'+sourceLabel(q),830,2);drawLines(ctx,sourceResult,105,1172,43);
    ctx.textAlign='center';ctx.fillStyle='#7b8793';ctx.font='400 24px -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif';ctx.fillText('简单专注 · 内心宁静 · 积极向上',540,1387);ctx.textAlign='left';
    return{url:canvas.toDataURL('image/png',1),truncated:titleResult.truncated||bodyResult.truncated||sourceResult.truncated};
  }

  function drawArticlePoster(a){
    var canvas=document.createElement('canvas');canvas.width=1080;
    var ctx=canvas.getContext&&canvas.getContext('2d');if(!ctx)throw new Error('当前浏览器不支持图片生成');
    var navy='#0c2644',navy2='#183c63',gold='#c9a46a',beige='#f7f4ee',ink='#10233c',muted='#6d7a88',cream='#fbf8f1';
    var title=String(a.title||'未命名文章'),subtitle=trim(a.subtitle),account=trim(a.account)||'汇添富',dateLabel=articleCollectedLabel(a),paragraphs=articleParagraphs(a);
    var titleFont='700 56px -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif';
    var subtitleFont='400 32px -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif';
    var metaFont='400 24px -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif';
    var bodyFont='400 38px -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif';
    ctx.font=titleFont;var titleResult=canvasLines(ctx,title,960,5);
    ctx.font=subtitleFont;var subtitleResult=subtitle?canvasLines(ctx,subtitle,960,3):{lines:[],truncated:false};
    ctx.font=bodyFont;var bodyResults=paragraphs.map(function(p){return canvasLines(ctx,'\u3000\u3000'+p,960,9999);});
    var headerH=200,padTop=60,titleH=titleResult.lines.length*72+30,subtitleH=subtitle?subtitleResult.lines.length*48+60:0,dividerH=60,bodyH=0;
    bodyResults.forEach(function(r){bodyH+=r.lines.length*62+30;});
    var footerH=80,totalH=headerH+padTop+titleH+subtitleH+dividerH+bodyH+footerH+60;canvas.height=totalH;
    var grad=ctx.createLinearGradient(0,0,1080,headerH);grad.addColorStop(0,navy);grad.addColorStop(1,navy2);ctx.fillStyle=grad;ctx.fillRect(0,0,1080,headerH);
    ctx.save();ctx.globalAlpha=.09;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(930,40,200,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(60,180,120,0,Math.PI*2);ctx.fill();ctx.restore();
    ctx.textBaseline='alphabetic';
    ctx.fillStyle='#ead9bd';ctx.font='400 84px "HuicylCalligraphy","STKaiti","KaiTi",serif';ctx.fillText('晖',60,120);
    var brandX=60+ctx.measureText('晖').width+12;ctx.fillStyle='#ffffff';ctx.font='700 44px "Songti SC","SimSun",serif';ctx.fillText('常语录',brandX,115);
    ctx.fillStyle='#ead9bd';ctx.font='400 22px -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif';ctx.fillText('简单专注 · 内心宁静 · 积极向上',60,165);
    ctx.fillStyle=cream;ctx.fillRect(0,headerH,1080,totalH-headerH-footerH);
    var y=headerH+padTop;
    ctx.fillStyle=ink;ctx.font=titleFont;drawLines(ctx,titleResult,60,y,72);y+=titleResult.lines.length*72+30;
    if(subtitle){ctx.fillStyle=muted;ctx.font=subtitleFont;drawLines(ctx,subtitleResult,60,y,48);y+=subtitleResult.lines.length*48+60;}
    ctx.strokeStyle='#e6d9c0';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(60,y);ctx.lineTo(1020,y);ctx.stroke();y+=dividerH;
    ctx.fillStyle=ink;ctx.font=bodyFont;bodyResults.forEach(function(r){drawLines(ctx,r,60,y,62);y+=r.lines.length*62+30;});
    ctx.fillStyle=beige;ctx.fillRect(0,totalH-footerH,1080,footerH);
    ctx.textAlign='center';ctx.fillStyle=muted;ctx.font='400 24px -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif';ctx.fillText('简单专注 · 内心宁静 · 积极向上',540,totalH-footerH+45);ctx.textAlign='left';
    return{url:canvas.toDataURL('image/png',1),truncated:titleResult.truncated||subtitleResult.truncated||bodyResults.some(function(r){return r.truncated;})};
  }
  function openPosterLoading(){
    window.closePoster();var modal=document.createElement('div');modal.id='posterModal';modal.className='poster-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','生成分享图');
    modal.innerHTML='<div class="poster-dialog"><div class="poster-head"><strong>生成分享图</strong><button class="poster-close" onclick="closePoster()" aria-label="关闭">×</button></div><div class="poster-stage"><div class="poster-loading" aria-live="polite"><span></span>正在生成，请稍候…</div></div><p class="poster-tips">图片将在当前浏览器内生成，不会上传语录内容。</p><div class="poster-actions"></div></div>';
    modal.onclick=function(e){if(e.target===modal)window.closePoster();};document.body.appendChild(modal);document.body.classList.add('poster-open');return modal;
  }
  function showPoster(modal,result,q){
    if(!modal||!modal.parentNode)return;var stage=modal.querySelector('.poster-stage'),tips=modal.querySelector('.poster-tips'),actions=modal.querySelector('.poster-actions'),name=posterFileName(q.title);
    posterSaveData={url:result.url,name:name,blob:null};
    stage.innerHTML='<img class="poster-image" alt="'+esc(q.title)+'分享图">';stage.querySelector('img').src=result.url;
    tips.textContent=(result.truncated?'语录内容较长，分享图已自动节选。':'分享图已完整生成。')+' 长按图片也可保存到手机。';
    actions.innerHTML='<button class="btn-ghost" onclick="closePoster()">关闭</button><button class="btn-primary poster-save" onclick="savePoster()">'+(isWechat()?'长按保存图片':isIOS()?'保存到相册':'保存图片')+'</button>';
  }
  window.closePoster=function(){var modal=document.getElementById('posterModal');if(modal&&modal.parentNode)modal.parentNode.removeChild(modal);posterSaveData=null;document.body.classList.remove('poster-open');};
  window.savePoster=function(){
    var data=posterSaveData;if(!data)return;
    if(isWechat()){longPressGuide();return;}
    try{if(!data.blob)data.blob=dataUrlBlob(data.url);}catch(err){longPressGuide();return;}
    if(isIOS()){
      var shared=nativeShare(data.blob,data.name);
      if(shared){setPosterTip('正在打开系统菜单，请选择“存储到照片”或“存储到文件”。','poster-tip-success');shared.then(function(){setPosterTip('系统菜单已完成操作；如未保存，也可以长按图片。','poster-tip-success');},function(err){if(!err||err.name!=='AbortError')longPressGuide();});return;}
    }
    if(downloadPoster(data.blob,data.name)){setPosterTip('已发起图片下载，请在浏览器下载记录或相册中查看；如未生效，可长按图片保存。','poster-tip-success');return;}
    longPressGuide();
  };
  window.makePoster=function(id){
    var found=findQuote(id),q=found&&found.item;if(!q)return;var modal=openPosterLoading(),done=false;
    function build(){if(done)return;done=true;try{showPoster(modal,drawPoster(q),q);}catch(err){if(modal&&modal.parentNode){modal.querySelector('.poster-stage').innerHTML='<div class="poster-failed">分享图生成失败，请换用系统浏览器后重试。</div>';modal.querySelector('.poster-tips').textContent=String(err&&err.message?err.message:err);modal.querySelector('.poster-actions').innerHTML='<button class="btn-primary" onclick="closePoster()">知道了</button>';}}}
    if(document.fonts&&document.fonts.load){var timer=setTimeout(build,800);document.fonts.load('104px "HuicylCalligraphy"','晖').then(function(){clearTimeout(timer);build();},function(){clearTimeout(timer);build();});}else setTimeout(build,20);
  };
  window.makeArticlePoster=function(id){
    var found=findArticle(id),a=found&&found.item;if(!a)return;var modal=openPosterLoading(),done=false;
    function build(){if(done)return;done=true;try{var result=drawArticlePoster(a);showPoster(modal,result,{title:a.title});var tips=modal.querySelector('.poster-tips');if(tips)tips.textContent=(result.truncated?'文章内容较长，长图已自动节选。':'长图已完整生成。')+' 长按图片也可保存到手机。';}catch(err){if(modal&&modal.parentNode){modal.querySelector('.poster-stage').innerHTML='<div class="poster-failed">长图生成失败，请换用系统浏览器后重试。</div>';modal.querySelector('.poster-tips').textContent=String(err&&err.message?err.message:err);modal.querySelector('.poster-actions').innerHTML='<button class="btn-primary" onclick="closePoster()">知道了</button>';}}}
    if(document.fonts&&document.fonts.load){var timer=setTimeout(build,800);document.fonts.load('84px "HuicylCalligraphy"','晖').then(function(){clearTimeout(timer);build();},function(){clearTimeout(timer);build();});}else setTimeout(build,20);
  };
  window.addEventListener('keydown',function(e){if((e.key==='Escape'||e.keyCode===27)&&document.getElementById('posterModal'))window.closePoster();});
  window.addEventListener('hashchange',route);route();
}catch(err){document.getElementById('app').innerHTML='<div class="error"><b>页面载入失败</b><br>'+String(err&&err.message?err.message:err)+'</div>';}
})();
