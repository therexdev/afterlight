fetch('network-config.json',{cache:'no-store'}).then(r=>r.json()).then(config=>{
 if(config.currencySymbol==='tKOIN'){const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){if(!['SCRIPT','STYLE'].includes(node.parentElement?.tagName))node.textContent=node.textContent.replace(/\bKOIN\b/g,'tKOIN').replace(/Mainnet/g,'Testnet');}}
 const purchase=document.querySelector('.work-purchase');
 if(purchase){purchase.replaceChildren();const link=document.createElement('a');link.className='underlined';link.textContent='View availability and current listings';link.href='collect.html';purchase.append(link);}
 if(config.enabled){const note=document.querySelector('.closing>span');if(note)note.textContent='100 artworks. Explore initial listings and owner resales.';}
}).catch(()=>{});
