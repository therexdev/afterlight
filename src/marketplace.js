import {ChainClient, address} from './chain-client.js';
import {formatKoin, parseKoin, tokenId} from './amounts.js';
const $ = id => document.getElementById(id);
const page = document.body.dataset.page;
const collection = window.AFTERLIGHT_WORLD;
const works = collection.items;
let client, config, chainState, selected, accounts = [], account = '', busy = false, action, refreshVersion = 0;
const element = (tag, text, className) => { const node = document.createElement(tag); if (text != null) node.textContent = text; if (className) node.className = className; return node; };
const status = (text, error = false) => { $('network-status').textContent = text; $('network-status').classList.toggle('error', error); };
const short = value => value ? value.slice(0, 7) + '…' + value.slice(-6) : '';
const token = id => chainState?.tokens.find(item => item.id === id);
const sale = id => token(id)?.sale;
const isOwned = id => !!account && token(id)?.owner === account;
function pending() {
  try { return JSON.parse(localStorage.getItem('afterlight.pending.' + config.chainId)); }
  catch { return null; }
}
function pendingNotice() {
  const tx = pending(); $('pending-notice').hidden = !tx;
  if (tx) $('pending-copy').textContent = 'A submitted transaction still needs confirmation: ' + tx.id + '. Check its status before making another transaction.';
}
function download(bytes, name, mime) {
  const url = URL.createObjectURL(new Blob([bytes], {type:mime}));
  const anchor = element('a'); anchor.href = url; anchor.download = name;
  document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500);
}
function filtered() {
  const term = $('work-search').value.trim().toLowerCase(), theme = $('theme-filter').value;
  let result = works.filter(work => (!theme || work.theme === theme) && (!term || (work.name + ' ' + work.was + ' ' + work.became).toLowerCase().includes(term)));
  if (page === 'marketplace') result = result.filter(work => sale(work.id)?.active && !sale(work.id)?.primary);
  if (page === 'wallet') result = result.filter(work => isOwned(work.id));
  const order = $('sort-order').value;
  if (order === 'name') result.sort((a,b) => a.name.localeCompare(b.name));
  if (order.startsWith('price-')) result.sort((a,b) => {
    const x = BigInt(sale(a.id)?.price || '50000000000'), y = BigInt(sale(b.id)?.price || '50000000000');
    return (x < y ? -1 : x > y ? 1 : 0) * (order === 'price-low' ? 1 : -1);
  });
  return result;
}
function render() {
  const visible = filtered(); $('market-grid').replaceChildren();
  for (const work of visible) {
    const card = element('article', null, 'market-card'), open = element('button');
    const image = element('img'); image.src = work.file; image.alt = work.alt || work.name; image.width = 1100; image.height = 1100; image.loading = 'lazy';
    open.append(image, element('h2',work.name)); open.setAttribute('aria-label','View '+work.name); open.addEventListener('click',()=>openWork(work));
    const caption = element('p', work.caption);
    const row = element('div', null, 'card-sale');
    const offer = sale(work.id), owned = isOwned(work.id);
    let text = !config.enabled ? '500 KOIN · not open yet' : offer?.active ? formatKoin(offer.price)+' KOIN' : token(work.id) ? (owned?'In your collection':'Held in a collection') : 'Not minted yet';
    if (config.enabled && !chainState) text = 'Availability unavailable';
    row.append(element('strong',text)); const view = element('button',owned?'Manage':offer?.active?'View listing':'View work'); view.addEventListener('click',()=>openWork(work)); row.append(view);
    card.append(open,caption,row); $('market-grid').append(card);
  }
  $('result-status').textContent = visible.length ? visible.length + (visible.length===1?' work':' works') : '';
  $('empty-state').hidden = !!visible.length; $('empty-state').replaceChildren();
  if (!visible.length) {
    const title = page==='marketplace' ? 'The next chapter belongs to you.' : page==='wallet'&&!account ? 'Bring your wallet.' : 'Nothing here yet.';
    const description = page==='marketplace' ? (!config.enabled ? 'Owner resales will appear here after the collection launches. You can explore the initial collection now.' : 'There are no matching owner listings right now. A work appears here when its owner offers it for sale.') : page==='wallet'&&!account ? 'Connect Kondor to see the works you own and manage your listings.' : 'Try a different search or explore the collection.';
    $('empty-state').append(element('h2',title),element('p',description));
    const link=element('a','Explore the collection','underlined');link.href='collect.html';$('empty-state').append(link);
  }
}
async function refresh() {
  const version = ++refreshVersion;
  if (!config.enabled) { status('The collection is prepared for launch. Mainnet sales and resales are not open yet.'); chainState = null; render(); return; }
  status('Reading ownership and listings from Koinos…');
  try {
    const next = await client.state(); if (version !== refreshVersion) return; chainState = next;
    status(config.networkLabel + ' · ' + (next.config.paused ? 'Purchases are paused. Owners can still cancel listings and transfer works.' : next.config.launched ? 'Ownership and listings read directly from Koinos.' : 'The archive is being prepared. Sales have not opened.'));
    render(); if (selected && $('market-detail').open) renderDetail();
  } catch (error) { if (version !== refreshVersion) return; chainState=null; status('Live availability could not be loaded. '+error.message,true);render();if(selected&&$('market-detail').open)renderDetail(); }
}
async function walletChanged() {
  $('wallet-info').hidden = !account; $('connect-wallet').textContent = account ? short(account) : 'Connect wallet';
  $('wallet-account').value=account; $('wallet-balances').textContent='';
  render(); if(selected)renderDetail();
  if(account) {
    const captured=account;
    try { const b=await client.balances(account);if(account===captured)$('wallet-balances').textContent=formatKoin(b.balance)+' KOIN · '+formatKoin(b.mana)+' Mana available'; }
    catch { if(account===captured)$('wallet-balances').textContent='Balance temporarily unavailable'; }
  }
}
async function connect() {
  if(busy)return;busy=true;$('connect-wallet').disabled=true;
  try {
    accounts=await client.connect();$('wallet-account').replaceChildren(...accounts.map(a=>{const o=element('option',(a.name?a.name+' · ':'')+a.address);o.value=a.address;return o;}));
    account=accounts[0].address;await walletChanged();
  } catch(error) {status(error.message,true);}
  finally{busy=false;$('connect-wallet').disabled=false;}
}
function button(label,handler,secondary=false){const b=element('button',label,'action-button'+(secondary?' secondary':''));b.type='button';b.addEventListener('click',handler);return b;}
function renderDetail() {
  const work=selected;if(!work)return;
  $('market-detail-title').textContent=work.name;$('market-detail-caption').textContent=work.caption;$('market-detail-was').textContent=work.was;$('market-detail-became').textContent=work.became;
  $('market-detail-image').src=work.file;$('market-detail-image').alt=work.alt||work.name;
  $('market-download').href=work.file;$('market-download').download=work.slug+'.webp';
  $('recover-image').disabled=!config.archiveId;$('listing-form').hidden=true;$('transfer-form').hidden=true;
  const area=$('purchase-actions');area.replaceChildren();const offer=sale(work.id),record=token(work.id),owned=isOwned(work.id);
  $('ownership-state').textContent=!config.enabled?'This artwork is not on mainnet yet.':record?'Owner: '+record.owner:chainState?'This artwork is awaiting minting.':'Live ownership is unavailable.';
  if(!config.enabled){area.append(element('strong','500 KOIN'),element('p','Initial listing price. Sales have not opened yet.'));return;}
  if(!chainState){area.append(element('p','Refresh the page to load current ownership before transacting.'));return;}
  if(owned){
    area.append(element('p','This work is in your collection.'));
    area.append(button(offer?.active?'Change your listing':'List for sale',()=>{$('listing-form').hidden=false;$('transfer-form').hidden=true;$('listing-price').value=offer?.price?formatKoin(offer.price).replace(/,/g,''):'';$('listing-price').focus();}));
    if(offer&&!offer.primary)area.append(button('Cancel listing',()=>review('cancel_listing',{seller:account,token_id:tokenId(work.id)},'Cancel this listing',[['Work',work.name],['Owner',account]],'The NFT stays in your wallet.'),true));
    area.append(button('Send to someone',()=>{$('transfer-form').hidden=false;$('listing-form').hidden=true;$('transfer-address').focus();},true));
  }else if(offer?.active){
    area.append(element('strong',formatKoin(offer.price)+' KOIN'),element('p',offer.primary?'Initial collection listing.':'Offered by '+short(offer.seller)+'.'));
    area.append(button(account?'Review purchase':'Connect to collect',()=>account?preparePurchase():connect()));
  }else area.append(element('p',chainState.config.paused?'Purchases are temporarily paused.':'This work is not currently offered for sale.'));
}
function openWork(work) {
  selected=work;$('detail-message').textContent='';renderDetail();if(!$('market-detail').open)$('market-detail').showModal();$('market-detail').scrollTop=0;
  const url=new URL(location.href);url.searchParams.set('work',work.id);history.replaceState(null,'',url);
}
async function preparePurchase(){
  if(busy)return;busy=true;
  try {
    const offer=await client.quote(selected.id);
    const balances=await client.balances(account);
    if(BigInt(balances.balance)<BigInt(offer.price))throw Error('Your selected wallet does not have enough KOIN for this purchase.');
    const args={buyer:account,token_id:tokenId(selected.id),expected_seller:offer.seller,expected_price:offer.price,expected_revision:offer.revision||'0',deadline:String(Date.now()+600000)};
    review('buy',args,'Collect '+selected.name,[['Price',formatKoin(offer.price)+' KOIN'],['Buyer',account],['Seller',offer.seller],['Payment goes to',offer.primary?chainState.config.treasury:offer.seller]],'The NFT and KOIN move together in one transaction. This quote expires in 10 minutes.');
  }catch(error){$('detail-message').textContent=error.message;}finally{busy=false;}
}
function review(method,args,title,fields,description){
  if(pending()){$('detail-message').textContent='Check your pending transaction before starting another one.';pendingNotice();return;}
  action={method,args};$('confirm-title').textContent=title;$('confirm-description').textContent=description;$('transaction-status').textContent='';$('submit-action').disabled=false;
  $('confirm-fields').replaceChildren(...[['Network',config.networkLabel],...fields].map(([label,value])=>{const row=element('div');row.append(element('dt',label),element('dd',value));return row;}));
  $('market-detail').close();$('confirm-action').showModal();
}
$('submit-action').addEventListener('click',async()=>{
  if(busy||!action)return;busy=true;$('submit-action').disabled=true;$('cancel-confirm').disabled=true;
  try {
    const id=await client.send(account,action.method,action.args,text=>$('transaction-status').textContent=text);
    $('transaction-status').textContent='Confirmed. Transaction: '+id;action=null;await refresh();await walletChanged();
  }catch(error){$('transaction-status').textContent=error.message;}
  finally{busy=false;$('cancel-confirm').disabled=false;pendingNotice();}
});
$('listing-form').addEventListener('submit',event=>{
  event.preventDefault();if(busy)return;
  try{const price=parseKoin($('listing-price').value),days=Number($('listing-duration').value);if(![7,30,90].includes(days))throw Error('Choose a valid duration.');const expiry=Date.now()+days*86400000;
    review('list_token',{seller:account,token_id:tokenId(selected.id),price,expires_at:String(expiry)},'Offer '+selected.name,[['Price',formatKoin(price)+' KOIN'],['Seller',account],['Expires',new Date(expiry).toLocaleString()]],'You retain ownership until someone purchases this listing. You receive the full listed price.');
  }catch(error){$('detail-message').textContent=error.message;}
});
$('transfer-form').addEventListener('submit',event=>{event.preventDefault();if(busy)return;try{const to=address($('transfer-address').value.trim());if(to===account)throw Error('Choose a different recipient.');review('transfer',{from:account,to,token_id:tokenId(selected.id)},'Send '+selected.name,[['From',account],['To',to]],'This transfers ownership to the recipient and cancels any listing. Check the address carefully.');}catch(error){$('detail-message').textContent=error.message;}});
$('market-metadata').addEventListener('click',async()=>{try{const metadata=config.enabled?JSON.parse((await client.read('get_metadata',{token_id:tokenId(selected.id)})).value):selected.metadata||{name:selected.name,description:selected.description,attributes:selected.attributes,status:'Prepared; not yet deployed'};download(JSON.stringify(metadata,null,2)+'\n',selected.slug+'.json','application/json');}catch(error){$('detail-message').textContent=error.message;}});
$('recover-image').addEventListener('click',async()=>{const work=selected;$('recover-image').disabled=true;try{const recovered=await client.recover(work.id,work.sha256,(n,total)=>$('detail-message').textContent='Reading image from Koinos: '+n+' / '+total+' chunks');if(selected?.id===work.id)$('detail-message').textContent='Verified: the on-chain bytes match this artwork’s SHA-256 fingerprint.';download(recovered.bytes,work.slug+'-from-koinos.webp',recovered.mime);}catch(error){$('detail-message').textContent=error.message;}finally{$('recover-image').disabled=!config.archiveId;}});
$('connect-wallet').addEventListener('click',connect);
$('disconnect-wallet').addEventListener('click',()=>{if(busy)return;account='';accounts=[];$('wallet-account').replaceChildren();walletChanged();});
$('wallet-account').addEventListener('change',()=>{if(busy){$('wallet-account').value=account;return;}account=$('wallet-account').value;walletChanged();});
$('refresh-state').addEventListener('click',refresh);
for(const id of ['work-search','theme-filter','sort-order'])$(id).addEventListener(id==='work-search'?'input':'change',render);
$('close-detail').addEventListener('click',()=>$('market-detail').close());
$('cancel-confirm').addEventListener('click',()=>{if(busy)return;$('confirm-action').close();if(selected)openWork(selected);});
$('confirm-action').addEventListener('cancel',event=>{if(busy)event.preventDefault();});
for(const id of ['market-detail','confirm-action'])$(id).addEventListener('click',event=>{if(event.target!==$(id)||busy)return;const rect=$(id).getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)$(id).close();});
$('check-pending').addEventListener('click',async()=>{const tx=pending();if(!tx||busy)return;busy=true;$('check-pending').disabled=true;try{await client.network();await client.confirm(tx.id);localStorage.removeItem('afterlight.pending.'+config.chainId);pendingNotice();await refresh();}catch(error){$('pending-copy').textContent=error.message;}finally{busy=false;$('check-pending').disabled=false;pendingNotice();}});
async function start(){
  try{
    const response=await fetch('network-config.json',{cache:'no-store'});if(!response.ok)throw Error('Missing network configuration.');config=await response.json();client=new ChainClient(config);
    for(const theme of [...new Set(works.map(work=>work.theme))]){const option=element('option',theme);option.value=theme;$('theme-filter').append(option);}
    await refresh();pendingNotice();const id=Number(new URL(location.href).searchParams.get('work'));if(id){const work=works.find(w=>w.id===id);if(work)openWork(work);}
  }catch(error){status('The collection could not start: '+error.message,true);$('connect-wallet').disabled=true;}
}
start();
