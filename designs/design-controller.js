(() => {
  const picker = document.getElementById('design-picker');
  if (!picker) return;
  const stages = [...document.querySelectorAll('#nbh-designs [data-variant]')];
  const names = stages.map(stage => stage.dataset.key);
  const query = new URLSearchParams(window.location.search).get('design');
  if (names.includes(query)) picker.value = query;
  function show() {
    stages.forEach(stage => { stage.hidden = stage.dataset.key !== picker.value; });
    const stage = stages.find(stage => stage.dataset.key === picker.value);
    document.getElementById('design-count').textContent = `${names.indexOf(picker.value) + 1} / ${names.length}`;
    document.getElementById('open-design').href = `${stage.dataset.filename}.html`;
    const url = new URL(window.location.href); url.searchParams.set('design', picker.value);
    try { history.replaceState(null, '', url); } catch {}
  }
  picker.addEventListener('change', show);
  document.getElementById('previous-design').addEventListener('click', () => { picker.value = names[(names.indexOf(picker.value) - 1 + names.length) % names.length]; show(); });
  document.getElementById('next-design').addEventListener('click', () => { picker.value = names[(names.indexOf(picker.value) + 1) % names.length]; show(); });
  show();
})();
