(() => {
  'use strict';
  const collection = window.AFTERLIGHT_WORLD;
  const works = collection.items.slice(0, 6);
  const $ = id => document.getElementById(id);
  const workDialog = $('work-dialog');
  const overviewDialog = $('all-works-dialog');
  const collectDialog = $('collect-dialog');
  const dialogs = [workDialog, overviewDialog, collectDialog];
  let selected = 0;
  let chapter = 'was';
  let returnHash = '#collection';
  const imageDescriptions = [
    'An ivory computer terminal opened into a terracotta path.',
    'An open server cabinet with records extending beyond its enclosure.',
    'A paper envelope opening beyond a worn computer frame.',
    'A small public square growing beyond an empty screen.',
    'Plants taking root in a steel cabinet filled with terracotta pots.',
    'An open archive cabinet transformed into a place to read.'
  ];
  const imageFor = (work, index) => {
    const img = document.createElement('img');
    img.src = work.file; img.alt = imageDescriptions[index];
    img.width = 1100; img.height = 1100; img.loading = 'lazy';
    return img;
  };
  const thumbnails = works.map((work, index) => {
    const button = document.createElement('button');
    button.className = 'thumbnail';
    button.type = 'button';
    button.setAttribute('aria-label', work.name);
    button.setAttribute('aria-pressed', String(index === 0));
    button.append(imageFor(work, index));
    button.addEventListener('click', () => select(index));
    $('work-thumbnails').append(button);
    const overviewButton = document.createElement('button');
    overviewButton.className = 'overview-work';
    overviewButton.type = 'button';
    const label = document.createElement('span');
    label.textContent = work.name;
    overviewButton.append(imageFor(work, index), label);
    overviewButton.addEventListener('click', () => {
      overviewDialog.close();
      select(index);
      openWork();
    });
    $('all-works-grid').append(overviewButton);
    return button;
  });
  function setChapter(value, focus = false) {
    chapter = value;
    for (const [id, key] of [['then-tab', 'was'], ['now-tab', 'became']]) {
      const active = key === chapter;
      $(id).setAttribute('aria-selected', String(active));
      $(id).tabIndex = active ? 0 : -1;
      if (active && focus) $(id).focus();
    }
    $('story-text').textContent = works[selected][chapter];
    $('story-text').setAttribute('aria-labelledby', chapter === 'was' ? 'then-tab' : 'now-tab');
  }
  function select(index, reveal = true) {
    selected = (index + works.length) % works.length;
    const work = works[selected];
    $('object-image').src = work.file;
    $('object-image').alt = imageDescriptions[selected];
    $('object-open').setAttribute('aria-label', 'Open ' + work.name);
    $('object-title').textContent = work.name;
    $('object-caption').textContent = work.caption;
    thumbnails.forEach((button, i) => button.setAttribute('aria-pressed', String(i === selected)));
    setChapter(chapter);
    if (reveal) {
      const rail = $('work-thumbnails');
      const active = thumbnails[selected];
      const left = active.offsetLeft - rail.offsetLeft;
      if (left < rail.scrollLeft || left + active.offsetWidth > rail.scrollLeft + rail.clientWidth) {
        rail.scrollTo({left: left - (rail.clientWidth - active.offsetWidth) / 2,
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
      }
    }
  }
  function renderDetail() {
    const work = works[selected];
    $('detail-image').src = work.file;
    $('detail-image').alt = imageDescriptions[selected];
    $('detail-title').textContent = work.name;
    $('detail-caption').textContent = work.caption;
    $('detail-was').textContent = work.was;
    $('detail-became').textContent = work.became;
    $('detail-traits').replaceChildren(...work.attributes.map(trait => {
      const row = document.createElement('div');
      const name = document.createElement('dt');
      const value = document.createElement('dd');
      name.textContent = trait.trait_type; value.textContent = trait.value;
      row.append(name, value); return row;
    }));
    $('download-work').href = work.file;
    $('download-work').download = work.slug + '.webp';
  }
  function show(dialog) {
    dialogs.forEach(other => { if (other !== dialog && other.open) other.close(); });
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }
  function workHash() { return '#artifact-' + String(works[selected].id).padStart(3, '0'); }
  function openWork(fromHash = false) {
    renderDetail();
    if (!fromHash) {
      returnHash = location.hash && !/^#artifact-/.test(location.hash) ? location.hash : '#collection';
      history.pushState({afterlightWork: true}, '', workHash());
    }
    show(workDialog);
  }
  function handleHash() {
    const match = /^#artifact-(\d{1,3})$/.exec(location.hash);
    const index = match ? works.findIndex(work => work.id === Number(match[1])) : -1;
    if (index !== -1) {
      select(index, false); openWork(true);
    } else if (workDialog.open) {
      workDialog.close();
    }
  }
  workDialog.addEventListener('close', () => {
    if (/^#artifact-/.test(location.hash)) history.replaceState(null, '', returnHash);
  });
  dialogs.forEach(dialog => {
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right ||
          event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });
  $('then-tab').addEventListener('click', () => setChapter('was'));
  $('now-tab').addEventListener('click', () => setChapter('became'));
  document.querySelector('.time-tabs').addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 'was' : event.key === 'End' ? 'became' :
      chapter === 'was' ? 'became' : 'was';
    setChapter(next, true);
  });
  $('previous-work').addEventListener('click', () => select(selected - 1));
  $('next-work').addEventListener('click', () => select(selected + 1));
  $('object-open').addEventListener('click', () => openWork());
  $('story-open').addEventListener('click', () => openWork());
  $('all-works-open').addEventListener('click', () => { location.href = 'collect.html'; });
  document.querySelectorAll('[data-collect]').forEach(button =>
    button.addEventListener('click', () => { location.href = 'collect.html'; }));
  for (const [id, direction] of [['detail-previous', -1], ['detail-next', 1]]) {
    $(id).addEventListener('click', () => {
      select(selected + direction, false); renderDetail();
      history.replaceState({afterlightWork: true}, '', workHash());
      workDialog.scrollTop = 0;
    });
  }
  $('download-metadata').addEventListener('click', () => {
    const work = works[selected];
    const draft = work.metadata || {
      name: work.name,
      description: work.description,
      image: work.file,
      attributes: work.attributes,
      collection: collection.title,
      status: 'Unminted preview — metadata draft',
      image_reference: 'Relative preview file; the final on-chain image reference has not been assigned.',
      initial_listing_price_koin: collection.initialPriceKoin
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2) + '\n'], {type: 'application/json'}));
    const link = document.createElement('a');
    link.href = url; link.download = work.slug + '.json';
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('download-status').textContent = 'Metadata downloaded for ' + work.name + '.';
  });
  window.addEventListener('hashchange', handleHash);
  window.addEventListener('popstate', handleHash);
  select(0, false);
  handleHash();
})();