/* Lab Corner — YouTube practical videos */

const LabVideos = {
  data: null,

  async load() {
    if (this.data) return this.data;
    try {
      const res = await fetch(App.basePrefix() + 'data/lab-videos.json', { cache: 'no-store' });
      if (res.ok) this.data = await res.json();
    } catch { /* offline */ }
    if (!this.data) this.data = (window.SCIENCE_DATA && window.SCIENCE_DATA['lab-videos']) || { videos: [] };
    return this.data;
  },

  thumb(id) { return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'; },

  esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  card(v) {
    return `
      <div class="video-card" data-video="${this.esc(v.youtube)}" data-title="${this.esc(v.title)}">
        <div class="video-thumb">
          <img loading="lazy" src="${this.thumb(v.youtube)}" alt="${this.esc(v.title)} thumbnail">
          <span class="video-play">▶</span>
          <span class="video-badge">${this.esc(v.subject)}</span>
        </div>
        <div class="video-info">
          <h3>${v.icon ? this.esc(v.icon) + ' ' : ''}${this.esc(v.title)}</h3>
          <p>${this.esc(v.description)}</p>
          <span class="video-duration">▶ ${this.esc(v.duration)}</span>
        </div>
      </div>`;
  },

  // Renders the grid of videos into a container
  async renderGrid(containerId, filterSubject) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const { videos } = await this.load();
    let list = videos || [];
    if (filterSubject && filterSubject !== 'All') {
      list = list.filter(v => v.subject === filterSubject);
    }
    if (!list.length) {
      el.innerHTML = '<p class="video-empty">No videos here yet.</p>';
      return;
    }
    el.innerHTML = list.map(v => this.card(v)).join('');
    el.querySelectorAll('.video-card').forEach(card => {
      card.addEventListener('click', () => {
        this.play(card.dataset.video, card.dataset.title, containerId);
      });
    });
  },

  // Plays a video inline (replaces the grid with a responsive player)
  play(youtubeId, title, containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `
      <div class="video-player-wrap">
        <div class="video-player-head">
          <button class="btn btn-secondary btn-sm" id="videoBack">← Back to videos</button>
          <span class="video-player-title">${this.esc(title)}</span>
        </div>
        <div class="video-frame">
          <iframe
            src="https://www.youtube-nocookie.com/embed/${this.esc(youtubeId)}?autoplay=1&rel=0"
            title="${this.esc(title)}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen loading="lazy"></iframe>
        </div>
      </div>`;
    const back = document.getElementById('videoBack');
    if (back) back.addEventListener('click', () => this.renderGrid(containerId));
  },

  // Loads videos next to each experiment (matched by data-video-title)
  async renderInline() {
    const slots = document.querySelectorAll('[data-lab-video]');
    if (!slots.length) return;
    const { videos } = await this.load();
    slots.forEach(slot => {
      const v = videos.find(x => x.id === slot.dataset.labVideo);
      if (!v) return;
      slot.innerHTML = `
        <div class="lab-video-block">
          <div class="lab-video-head">🎬 Watch it done: <strong>${this.esc(v.title)}</strong></div>
          <div class="video-frame">
            <iframe
              src="https://www.youtube-nocookie.com/embed/${this.esc(v.youtube)}?rel=0"
              title="${this.esc(v.title)}"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen loading="lazy"></iframe>
          </div>
        </div>`;
    });
  }
};
