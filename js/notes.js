/* Subject notes page helper — bookmark + init */

function initSubjectPage(subjectId) {
  App.initPage('notes');

  // Bookmark button
  const bmBtn = document.getElementById('bookmarkBtn');
  if (bmBtn) {
    const bmId = 'notes-' + subjectId;
    const sub = App.getSubject(subjectId);
    updateBmBtn();
    bmBtn.addEventListener('click', () => {
      if (App.hasBookmark(bmId)) {
        App.removeBookmark(bmId);
      } else {
        App.addBookmark({
          id: bmId,
          title: (sub ? sub.name : subjectId) + ' Notes',
          subject: sub ? sub.name : subjectId,
          topic: 'Full Notes',
          icon: sub ? sub.icon : '📘',
          link: 'Subjects/' + subjectId + '.html'
        });
      }
      updateBmBtn();
    });
  }

  function updateBmBtn() {
    const bmId = 'notes-' + subjectId;
    if (App.hasBookmark(bmId)) {
      bmBtn.textContent = '★ Bookmarked';
      bmBtn.className = 'btn btn-green btn-sm';
    } else {
      bmBtn.textContent = '☆ Bookmark';
      bmBtn.className = 'btn btn-secondary btn-sm';
    }
  }

  // Smooth scroll to topics via nav
  document.querySelectorAll('[data-scroll]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('data-scroll'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* Formula sheet search */
function initFormulaSheet() {
  App.initPage('lab');
  const searchInput = document.getElementById('formulaSearch');
  const container = document.getElementById('formulaCategories');
  const data = (window.SCIENCE_DATA && window.SCIENCE_DATA.formulas) ? window.SCIENCE_DATA.formulas.formulas : [];

  function render(filter = '') {
    const filtered = filter
      ? data.filter(f =>
          f.name.toLowerCase().includes(filter.toLowerCase()) ||
          f.formula.toLowerCase().includes(filter.toLowerCase()) ||
          f.subject.toLowerCase().includes(filter.toLowerCase()) ||
          f.category.toLowerCase().includes(filter.toLowerCase()))
      : data;

    const grouped = {};
    filtered.forEach(f => {
      const key = f.subject + ' — ' + f.category;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(f);
    });

    container.innerHTML = Object.keys(grouped).map(cat => `
      <div class="formula-category">
        <h3>${cat}</h3>
        <div class="formula-list">
          ${grouped[cat].map(f => `
            <div class="formula-item">
              <span class="f-name">${f.name}</span>
              <span class="f-eq">${f.formula}</span>
            </div>`).join('')}
        </div>
      </div>`).join('') || '<p class="text-center" style="color:var(--text-light);padding:20px">No formulas match your search.</p>';
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => render(e.target.value));
  }
  render();
}

/* Periodic Table */
const PT_ELEMENTS = [
  {n:1,sym:"H",name:"Hydrogen",mass:"1.008",cat:"nonmetal",group:1,period:1,type:"Non-metal",electrons:"1",state:"Gas"},
  {n:2,sym:"He",name:"Helium",mass:"4.003",cat:"noble",group:18,period:1,type:"Noble Gas",electrons:"2",state:"Gas"},
  {n:3,sym:"Li",name:"Lithium",mass:"6.941",cat:"alkali",group:1,period:2,type:"Alkali Metal",electrons:"2,1",state:"Solid"},
  {n:4,sym:"Be",name:"Beryllium",mass:"9.012",cat:"alkaline",group:2,period:2,type:"Alkaline Earth",electrons:"2,2",state:"Solid"},
  {n:5,sym:"B",name:"Boron",mass:"10.81",cat:"metalloid",group:13,period:2,type:"Metalloid",electrons:"2,3",state:"Solid"},
  {n:6,sym:"C",name:"Carbon",mass:"12.01",cat:"nonmetal",group:14,period:2,type:"Non-metal",electrons:"2,4",state:"Solid"},
  {n:7,sym:"N",name:"Nitrogen",mass:"14.01",cat:"nonmetal",group:15,period:2,type:"Non-metal",electrons:"2,5",state:"Gas"},
  {n:8,sym:"O",name:"Oxygen",mass:"16.00",cat:"nonmetal",group:16,period:2,type:"Non-metal",electrons:"2,6",state:"Gas"},
  {n:9,sym:"F",name:"Fluorine",mass:"19.00",cat:"halogen",group:17,period:2,type:"Halogen",electrons:"2,7",state:"Gas"},
  {n:10,sym:"Ne",name:"Neon",mass:"20.18",cat:"noble",group:18,period:2,type:"Noble Gas",electrons:"2,8",state:"Gas"},
  {n:11,sym:"Na",name:"Sodium",mass:"22.99",cat:"alkali",group:1,period:3,type:"Alkali Metal",electrons:"2,8,1",state:"Solid"},
  {n:12,sym:"Mg",name:"Magnesium",mass:"24.31",cat:"alkaline",group:2,period:3,type:"Alkaline Earth",electrons:"2,8,2",state:"Solid"},
  {n:13,sym:"Al",name:"Aluminium",mass:"26.98",cat:"metal",group:13,period:3,type:"Metal",electrons:"2,8,3",state:"Solid"},
  {n:14,sym:"Si",name:"Silicon",mass:"28.09",cat:"metalloid",group:14,period:3,type:"Metalloid",electrons:"2,8,4",state:"Solid"},
  {n:15,sym:"P",name:"Phosphorus",mass:"30.97",cat:"nonmetal",group:15,period:3,type:"Non-metal",electrons:"2,8,5",state:"Solid"},
  {n:16,sym:"S",name:"Sulfur",mass:"32.07",cat:"nonmetal",group:16,period:3,type:"Non-metal",electrons:"2,8,6",state:"Solid"},
  {n:17,sym:"Cl",name:"Chlorine",mass:"35.45",cat:"halogen",group:17,period:3,type:"Halogen",electrons:"2,8,7",state:"Gas"},
  {n:18,sym:"Ar",name:"Argon",mass:"39.95",cat:"noble",group:18,period:3,type:"Noble Gas",electrons:"2,8,8",state:"Gas"},
  {n:19,sym:"K",name:"Potassium",mass:"39.10",cat:"alkali",group:1,period:4,type:"Alkali Metal",electrons:"2,8,8,1",state:"Solid"},
  {n:20,sym:"Ca",name:"Calcium",mass:"40.08",cat:"alkaline",group:2,period:4,type:"Alkaline Earth",electrons:"2,8,8,2",state:"Solid"},
  {n:21,sym:"Sc",name:"Scandium",mass:"44.96",cat:"transition",group:3,period:4,type:"Transition Metal",electrons:"2,8,9,2",state:"Solid"},
  {n:22,sym:"Ti",name:"Titanium",mass:"47.87",cat:"transition",group:4,period:4,type:"Transition Metal",electrons:"2,8,10,2",state:"Solid"},
  {n:23,sym:"V",name:"Vanadium",mass:"50.94",cat:"transition",group:5,period:4,type:"Transition Metal",electrons:"2,8,11,2",state:"Solid"},
  {n:24,sym:"Cr",name:"Chromium",mass:"52.00",cat:"transition",group:6,period:4,type:"Transition Metal",electrons:"2,8,13,1",state:"Solid"},
  {n:25,sym:"Mn",name:"Manganese",mass:"54.94",cat:"transition",group:7,period:4,type:"Transition Metal",electrons:"2,8,13,2",state:"Solid"},
  {n:26,sym:"Fe",name:"Iron",mass:"55.85",cat:"transition",group:8,period:4,type:"Transition Metal",electrons:"2,8,14,2",state:"Solid"},
  {n:27,sym:"Co",name:"Cobalt",mass:"58.93",cat:"transition",group:9,period:4,type:"Transition Metal",electrons:"2,8,15,2",state:"Solid"},
  {n:28,sym:"Ni",name:"Nickel",mass:"58.69",cat:"transition",group:10,period:4,type:"Transition Metal",electrons:"2,8,16,2",state:"Solid"},
  {n:29,sym:"Cu",name:"Copper",mass:"63.55",cat:"transition",group:11,period:4,type:"Transition Metal",electrons:"2,8,18,1",state:"Solid"},
  {n:30,sym:"Zn",name:"Zinc",mass:"65.38",cat:"transition",group:12,period:4,type:"Transition Metal",electrons:"2,8,18,2",state:"Solid"},
  {n:31,sym:"Ga",name:"Gallium",mass:"69.72",cat:"metal",group:13,period:4,type:"Metal",electrons:"2,8,18,3",state:"Solid"},
  {n:32,sym:"Ge",name:"Germanium",mass:"72.63",cat:"metalloid",group:14,period:4,type:"Metalloid",electrons:"2,8,18,4",state:"Solid"},
  {n:33,sym:"As",name:"Arsenic",mass:"74.92",cat:"metalloid",group:15,period:4,type:"Metalloid",electrons:"2,8,18,5",state:"Solid"},
  {n:34,sym:"Se",name:"Selenium",mass:"78.97",cat:"nonmetal",group:16,period:4,type:"Non-metal",electrons:"2,8,18,6",state:"Solid"},
  {n:35,sym:"Br",name:"Bromine",mass:"79.90",cat:"halogen",group:17,period:4,type:"Halogen",electrons:"2,8,18,7",state:"Liquid"},
  {n:36,sym:"Kr",name:"Krypton",mass:"83.80",cat:"noble",group:18,period:4,type:"Noble Gas",electrons:"2,8,18,8",state:"Gas"},
  {n:37,sym:"Rb",name:"Rubidium",mass:"85.47",cat:"alkali",group:1,period:5,type:"Alkali Metal",electrons:"2,8,18,8,1",state:"Solid"},
  {n:38,sym:"Sr",name:"Strontium",mass:"87.62",cat:"alkaline",group:2,period:5,type:"Alkaline Earth",electrons:"2,8,18,8,2",state:"Solid"},
  {n:39,sym:"Y",name:"Yttrium",mass:"88.91",cat:"transition",group:3,period:5,type:"Transition Metal",electrons:"2,8,18,9,2",state:"Solid"},
  {n:40,sym:"Zr",name:"Zirconium",mass:"91.22",cat:"transition",group:4,period:5,type:"Transition Metal",electrons:"2,8,18,10,2",state:"Solid"},
  {n:41,sym:"Nb",name:"Niobium",mass:"92.91",cat:"transition",group:5,period:5,type:"Transition Metal",electrons:"2,8,18,12,1",state:"Solid"},
  {n:42,sym:"Mo",name:"Molybdenum",mass:"95.95",cat:"transition",group:6,period:5,type:"Transition Metal",electrons:"2,8,18,13,1",state:"Solid"},
  {n:43,sym:"Tc",name:"Technetium",mass:"98",cat:"transition",group:7,period:5,type:"Transition Metal",electrons:"2,8,18,13,2",state:"Solid"},
  {n:44,sym:"Ru",name:"Ruthenium",mass:"101.1",cat:"transition",group:8,period:5,type:"Transition Metal",electrons:"2,8,18,15,1",state:"Solid"},
  {n:45,sym:"Rh",name:"Rhodium",mass:"102.9",cat:"transition",group:9,period:5,type:"Transition Metal",electrons:"2,8,18,16,1",state:"Solid"},
  {n:46,sym:"Pd",name:"Palladium",mass:"106.4",cat:"transition",group:10,period:5,type:"Transition Metal",electrons:"2,8,18,18",state:"Solid"},
  {n:47,sym:"Ag",name:"Silver",mass:"107.9",cat:"transition",group:11,period:5,type:"Transition Metal",electrons:"2,8,18,18,1",state:"Solid"},
  {n:48,sym:"Cd",name:"Cadmium",mass:"112.4",cat:"transition",group:12,period:5,type:"Transition Metal",electrons:"2,8,18,18,2",state:"Solid"},
  {n:49,sym:"In",name:"Indium",mass:"114.8",cat:"metal",group:13,period:5,type:"Metal",electrons:"2,8,18,18,3",state:"Solid"},
  {n:50,sym:"Sn",name:"Tin",mass:"118.7",cat:"metal",group:14,period:5,type:"Metal",electrons:"2,8,18,18,4",state:"Solid"},
  {n:51,sym:"Sb",name:"Antimony",mass:"121.8",cat:"metalloid",group:15,period:5,type:"Metalloid",electrons:"2,8,18,18,5",state:"Solid"},
  {n:52,sym:"Te",name:"Tellurium",mass:"127.6",cat:"metalloid",group:16,period:5,type:"Metalloid",electrons:"2,8,18,18,6",state:"Solid"},
  {n:53,sym:"I",name:"Iodine",mass:"126.9",cat:"halogen",group:17,period:5,type:"Halogen",electrons:"2,8,18,18,7",state:"Solid"},
  {n:54,sym:"Xe",name:"Xenon",mass:"131.3",cat:"noble",group:18,period:5,type:"Noble Gas",electrons:"2,8,18,18,8",state:"Gas"},
  {n:55,sym:"Cs",name:"Caesium",mass:"132.9",cat:"alkali",group:1,period:6,type:"Alkali Metal",electrons:"2,8,18,18,8,1",state:"Solid"},
  {n:56,sym:"Ba",name:"Barium",mass:"137.3",cat:"alkaline",group:2,period:6,type:"Alkaline Earth",electrons:"2,8,18,18,8,2",state:"Solid"},
  {n:57,sym:"La",name:"Lanthanum",mass:"138.9",cat:"lanth",group:3,period:6,type:"Lanthanide",electrons:"2,8,18,18,9,2",state:"Solid"},
  {n:72,sym:"Hf",name:"Hafnium",mass:"178.5",cat:"transition",group:4,period:6,type:"Transition Metal",electrons:"2,8,18,32,10,2",state:"Solid"},
  {n:73,sym:"Ta",name:"Tantalum",mass:"180.9",cat:"transition",group:5,period:6,type:"Transition Metal",electrons:"2,8,18,32,11,2",state:"Solid"},
  {n:74,sym:"W",name:"Tungsten",mass:"183.8",cat:"transition",group:6,period:6,type:"Transition Metal",electrons:"2,8,18,32,12,2",state:"Solid"},
  {n:75,sym:"Re",name:"Rhenium",mass:"186.2",cat:"transition",group:7,period:6,type:"Transition Metal",electrons:"2,8,18,32,13,2",state:"Solid"},
  {n:76,sym:"Os",name:"Osmium",mass:"190.2",cat:"transition",group:8,period:6,type:"Transition Metal",electrons:"2,8,18,32,14,2",state:"Solid"},
  {n:77,sym:"Ir",name:"Iridium",mass:"192.2",cat:"transition",group:9,period:6,type:"Transition Metal",electrons:"2,8,18,32,15,2",state:"Solid"},
  {n:78,sym:"Pt",name:"Platinum",mass:"195.1",cat:"transition",group:10,period:6,type:"Transition Metal",electrons:"2,8,18,32,17,1",state:"Solid"},
  {n:79,sym:"Au",name:"Gold",mass:"197.0",cat:"transition",group:11,period:6,type:"Transition Metal",electrons:"2,8,18,32,18,1",state:"Solid"},
  {n:80,sym:"Hg",name:"Mercury",mass:"200.6",cat:"transition",group:12,period:6,type:"Transition Metal",electrons:"2,8,18,32,18,2",state:"Liquid"},
  {n:81,sym:"Tl",name:"Thallium",mass:"204.4",cat:"metal",group:13,period:6,type:"Metal",electrons:"2,8,18,32,18,3",state:"Solid"},
  {n:82,sym:"Pb",name:"Lead",mass:"207.2",cat:"metal",group:14,period:6,type:"Metal",electrons:"2,8,18,32,18,4",state:"Solid"},
  {n:83,sym:"Bi",name:"Bismuth",mass:"209.0",cat:"metal",group:15,period:6,type:"Metal",electrons:"2,8,18,32,18,5",state:"Solid"},
  {n:84,sym:"Po",name:"Polonium",mass:"209",cat:"metal",group:16,period:6,type:"Metal",electrons:"2,8,18,32,18,6",state:"Solid"},
  {n:85,sym:"At",name:"Astatine",mass:"210",cat:"halogen",group:17,period:6,type:"Halogen",electrons:"2,8,18,32,18,7",state:"Solid"},
  {n:86,sym:"Rn",name:"Radon",mass:"222",cat:"noble",group:18,period:6,type:"Noble Gas",electrons:"2,8,18,32,18,8",state:"Gas"},
  {n:87,sym:"Fr",name:"Francium",mass:"223",cat:"alkali",group:1,period:7,type:"Alkali Metal",electrons:"2,8,18,32,18,8,1",state:"Solid"},
  {n:88,sym:"Ra",name:"Radium",mass:"226",cat:"alkaline",group:2,period:7,type:"Alkaline Earth",electrons:"2,8,18,32,18,8,2",state:"Solid"},
  {n:89,sym:"Ac",name:"Actinium",mass:"227",cat:"act",group:3,period:7,type:"Actinide",electrons:"2,8,18,32,18,9,2",state:"Solid"},
  {n:104,sym:"Rf",name:"Rutherfordium",mass:"267",cat:"transition",group:4,period:7,type:"Transition Metal",electrons:"2,8,18,32,32,10,2",state:"Solid"},
  {n:105,sym:"Db",name:"Dubnium",mass:"268",cat:"transition",group:5,period:7,type:"Transition Metal",electrons:"2,8,18,32,32,11,2",state:"Solid"},
  {n:106,sym:"Sg",name:"Seaborgium",mass:"269",cat:"transition",group:6,period:7,type:"Transition Metal",electrons:"2,8,18,32,32,12,2",state:"Solid"},
  {n:107,sym:"Bh",name:"Bohrium",mass:"270",cat:"transition",group:7,period:7,type:"Transition Metal",electrons:"2,8,18,32,32,13,2",state:"Solid"},
  {n:108,sym:"Hs",name:"Hassium",mass:"269",cat:"transition",group:8,period:7,type:"Transition Metal",electrons:"2,8,18,32,32,14,2",state:"Solid"},
  {n:109,sym:"Mt",name:"Meitnerium",mass:"278",cat:"transition",group:9,period:7,type:"Transition Metal",electrons:"2,8,18,32,32,15,2",state:"Solid"}
];

function initPeriodicTable() {
  App.initPage('lab');
  const table = document.getElementById('periodicGrid');
  const modal = document.getElementById('elementModal');

  // Create grid
  let html = '';
  for (let p = 1; p <= 7; p++) {
    for (let g = 1; g <= 18; g++) {
      const el = PT_ELEMENTS.find(e => e.period === p && e.group === g);
      if (el) {
        html += `<div class="pt-element pt-${el.cat}" onclick="showElement(${el.n})" title="${el.name}">
          <span class="pt-num">${el.n}</span>
          <span class="pt-sym">${el.sym}</span>
          <span class="pt-name">${el.name}</span>
          <span class="pt-mass">${el.mass}</span>
        </div>`;
      } else {
        html += '<div class="pt-element empty"></div>';
      }
    }
  }
  table.innerHTML = html;

  window.showElement = function (num) {
    const el = PT_ELEMENTS.find(e => e.n === num);
    if (!el) return;
    document.getElementById('modalSymbol').textContent = el.sym;
    document.getElementById('modalName').textContent = el.name;
    document.getElementById('modalType').textContent = el.type;
    document.getElementById('modalDetails').innerHTML = `
      <div class="row"><span class="k">Atomic Number</span><span class="v">${el.n}</span></div>
      <div class="row"><span class="k">Atomic Mass</span><span class="v">${el.mass}</span></div>
      <div class="row"><span class="k">Group</span><span class="v">${el.group}</span></div>
      <div class="row"><span class="k">Period</span><span class="v">${el.period}</span></div>
      <div class="row"><span class="k">Electron Config</span><span class="v">${el.electrons}</span></div>
      <div class="row"><span class="k">State (STP)</span><span class="v">${el.state}</span></div>`;
    modal.classList.add('show');
  };

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('show');
  });
}
