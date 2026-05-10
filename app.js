const {
  useState,
  useMemo,
  useEffect,
  useRef
} = React;
const MAIN_WORKS = [{
  key: 'course',
  name: 'Курсовая работа',
  base: 10000,
  complexity: 4,
  defaultPages: 35,
  minPages: 15,
  maxPages: 80,
  deadlineUnit: 'days'
}, {
  key: 'bachelor',
  name: 'Бакалаврская ВКР',
  base: 15000,
  complexity: 12,
  defaultPages: 60,
  minPages: 30,
  maxPages: 120,
  deadlineUnit: 'days'
}, {
  key: 'master',
  name: 'Магистерская ВКР',
  base: 25000,
  complexity: 18,
  defaultPages: 80,
  minPages: 50,
  maxPages: 150,
  deadlineUnit: 'days'
}, {
  key: 'phd',
  name: 'Кандидатская диссертация',
  base: 100000,
  complexity: 100,
  defaultPages: 150,
  minPages: 100,
  maxPages: 250,
  deadlineUnit: 'months'
}, {
  key: 'doctor',
  name: 'Докторская диссертация',
  base: 500000,
  complexity: 250,
  defaultPages: 300,
  minPages: 200,
  maxPages: 500,
  deadlineUnit: 'months'
}];
const ADDITIONAL_WORKS = [{
  key: 'abstract',
  name: 'Реферат',
  base: 2000,
  complexity: 1,
  defaultPages: 20,
  minPages: 10,
  maxPages: 40
}, {
  key: 'practice',
  name: 'Отчёт по практике',
  base: 4000,
  complexity: 2,
  defaultPages: 15,
  minPages: 8,
  maxPages: 30
}, {
  key: 'essay',
  name: 'Эссе',
  base: 500,
  complexity: 0.25,
  defaultPages: null
}, {
  key: 'presentation',
  name: 'Презентация',
  base: 500,
  complexity: 0.5,
  defaultPages: null
}, {
  key: 'homework',
  name: 'Домашняя работа',
  base: 500,
  complexity: 0.25,
  defaultPages: null
}];
const ARTICLES = [{
  key: 'rinc',
  name: 'Научная статья для РИНЦ',
  base: 4000,
  complexity: 1
}, {
  key: 'vak',
  name: 'Научная статья для ВАК',
  base: 10000,
  complexity: 3
}];
const STATS = [{
  key: 'corr',
  name: 'Корреляция (Пирсон / Спирмен)',
  price: 2000,
  complexity: 0.5
}, {
  key: 'groups',
  name: 'Сравнение групп (Манна-Уитни / Уилкоксон)',
  price: 2000,
  complexity: 0.5
}, {
  key: 'chi',
  name: 'Хи-квадрат Пирсона',
  price: 2000,
  complexity: 0.5
}, {
  key: 'normality',
  name: 'Проверка нормальности',
  price: 1000,
  complexity: 0.25
}, {
  key: 'regression',
  name: 'Множественная регрессия',
  price: 3000,
  complexity: 1
}, {
  key: 'variance',
  name: 'Дисперсионный анализ',
  price: 3000,
  complexity: 1
}, {
  key: 'discriminant',
  name: 'Дискриминантный анализ',
  price: 3000,
  complexity: 1
}, {
  key: 'factor',
  name: 'Факторный анализ',
  price: 4000,
  complexity: 1.5
}, {
  key: 'interpretation',
  name: 'Написание интерпретации (~5 стр.)',
  price: 2000,
  complexity: 0.5
}];
const MONTHS = [{
  num: 1,
  name: 'Январь',
  short: 'Янв',
  discount: 0
}, {
  num: 2,
  name: 'Февраль',
  short: 'Фев',
  discount: 20
}, {
  num: 3,
  name: 'Март',
  short: 'Мар',
  discount: 20
}, {
  num: 4,
  name: 'Апрель',
  short: 'Апр',
  discount: 10
}, {
  num: 5,
  name: 'Май',
  short: 'Май',
  discount: 0
}, {
  num: 6,
  name: 'Июнь',
  short: 'Июн',
  discount: 0
}, {
  num: 7,
  name: 'Июль',
  short: 'Июл',
  discount: 20
}, {
  num: 8,
  name: 'Август',
  short: 'Авг',
  discount: 20
}, {
  num: 9,
  name: 'Сентябрь',
  short: 'Сен',
  discount: 20
}, {
  num: 10,
  name: 'Октябрь',
  short: 'Окт',
  discount: 20
}, {
  num: 11,
  name: 'Ноябрь',
  short: 'Ноя',
  discount: 10
}, {
  num: 12,
  name: 'Декабрь',
  short: 'Дек',
  discount: 0
}];
const PROMO_CODE = 'DIPLOMA2026';
const PROMO_DISCOUNT = 10;
const VK_LINK = 'https://vk.com/diplom_workshop';
const COLOR = {
  good: '#5C9170',
  warn: '#D4A857',
  bad: '#C97D3F',
  crit: '#C8102E'
};
const THUMB_W = 20;
function thumbPosCalc(frac) {
  const f = Math.max(0, Math.min(1, frac));
  return `calc(${f.toFixed(6)} * (100% - ${THUMB_W}px) + ${THUMB_W / 2}px)`;
}
function formatPrice(n) {
  return Math.round(n).toLocaleString('ru-RU').replace(/,/g, ' ');
}
function plural(n, forms) {
  const abs = Math.abs(n);
  const m10 = abs % 10;
  const m100 = abs % 100;
  if (m100 >= 11 && m100 <= 14) return forms[2];
  if (m10 === 1) return forms[0];
  if (m10 >= 2 && m10 <= 4) return forms[1];
  return forms[2];
}
function getDeadlineMax(complexity, unit) {
  if (unit === 'months') {
    if (complexity <= 0) return 12;
    const compMonths = complexity / 30;
    return Math.min(36, Math.max(6, Math.ceil(compMonths * 3)));
  }
  if (complexity <= 0) return 30;
  return Math.min(60, Math.max(14, Math.ceil(complexity * 3)));
}
function buildDeadlineGradient(complexity, min, max) {
  if (complexity <= 0) return COLOR.good;
  const range = max - min;
  if (range <= 0) return COLOR.good;
  const t1 = complexity / 2;
  const t2 = 2 * complexity / 3;
  const t3 = complexity;
  const f = v => Math.max(0, Math.min(1, (v - min) / range));
  const p1 = thumbPosCalc(f(t1));
  const p2 = thumbPosCalc(f(t2));
  const p3 = thumbPosCalc(f(t3));
  return `linear-gradient(to right,
    ${COLOR.crit} 0%, ${COLOR.crit} ${p1},
    ${COLOR.bad}  ${p1}, ${COLOR.bad}  ${p2},
    ${COLOR.warn} ${p2}, ${COLOR.warn} ${p3},
    ${COLOR.good} ${p3}, ${COLOR.good} 100%)`;
}
function buildMonthGradient() {
  const stops = [];
  MONTHS.forEach((m, i) => {
    let aPos, bPos;
    if (i === 0) aPos = '0%';else aPos = thumbPosCalc((2 * i - 1) / 22);
    if (i === 11) bPos = '100%';else bPos = thumbPosCalc((2 * i + 1) / 22);
    let c;
    if (m.discount === 0) c = COLOR.crit;else if (m.discount === 10) c = COLOR.warn;else c = COLOR.good;
    stops.push(`${c} ${aPos}`, `${c} ${bPos}`);
  });
  return `linear-gradient(to right, ${stops.join(', ')})`;
}
const MONTH_GRADIENT = buildMonthGradient();
function smoothScrollTo(el, duration) {
  if (!el || typeof window === 'undefined') return;
  const startY = window.scrollY || window.pageYOffset || 0;
  const targetY = el.getBoundingClientRect().top + startY - 24;
  const distance = targetY - startY;
  if (Math.abs(distance) < 4) return;
  const dur = duration || 2000;
  const startTime = performance.now();
  // Sine ease-in-out — мягкое ускорение, мягкое торможение, симметрично
  const ease = t => 0.5 - 0.5 * Math.cos(Math.PI * t);
  const step = now => {
    const elapsed = now - startTime;
    const p = Math.min(elapsed / dur, 1);
    const eased = ease(p);
    window.scrollTo(0, startY + distance * eased);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function App() {
  const [mainWork, setMainWork] = useState(null);
  const [mainPages, setMainPages] = useState(35);
  const [partial, setPartial] = useState(false);
  const [partialPages, setPartialPages] = useState(20);
  const [deadlineDays, setDeadlineDays] = useState(30);
  const [deadlineMonths, setDeadlineMonths] = useState(6);
  const [addWorks, setAddWorks] = useState({});
  const [stats, setStats] = useState({});
  const [articles, setArticles] = useState({});
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [promo, setPromo] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showArticle, setShowArticle] = useState(false);
  const [step, setStep] = useState(1);

  // Modal form state
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formComment, setFormComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitDone, setSubmitDone] = useState(false);

  // Серверные промокоды (подгружаются один раз при загрузке страницы)
  const [serverPromos, setServerPromos] = useState(null);
  const deadlineRef = useRef(null);
  const orderRef = useRef(null);
  const calcRef = useRef(null);

  // Подгрузить промокоды с сервера
  useEffect(() => {
    fetch('/api/promos').then(r => r.ok ? r.json() : null).then(j => {
      if (j && j.promos && typeof j.promos === 'object') {
        setServerPromos(j.promos);
      }
    }).catch(() => {});
  }, []);

  // Закрытие модалки по Escape
  useEffect(() => {
    if (!showForm) return;
    const onKey = e => {
      if (e.key === 'Escape') setShowForm(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showForm]);
  const advance = (target, ref) => {
    setStep(s => Math.max(s, target));
    requestAnimationFrame(() => {
      if (ref && ref.current) smoothScrollTo(ref.current, 2000);
    });
  };
  const mainWorkData = MAIN_WORKS.find(w => w.key === mainWork);
  const deadlineUnit = mainWorkData ? mainWorkData.deadlineUnit : 'days';
  const handleSelectMain = key => {
    if (mainWork === key) {
      setMainWork(null);
      setPartial(false);
      return;
    }
    const w = MAIN_WORKS.find(x => x.key === key);
    setMainWork(key);
    setMainPages(w.defaultPages);
    setPartial(false);
    setPartialPages(Math.max(1, Math.floor(w.defaultPages / 2)));
    if (w.deadlineUnit === 'months') {
      setDeadlineMonths(Math.min(36, Math.max(2, Math.ceil(w.complexity / 30 * 1.6))));
    } else {
      setDeadlineDays(Math.min(60, Math.max(7, Math.ceil(w.complexity * 2.5))));
    }
  };
  const toggleAdd = key => {
    setAddWorks(prev => {
      const next = {
        ...prev
      };
      if (next[key]) delete next[key];else {
        const w = ADDITIONAL_WORKS.find(x => x.key === key);
        next[key] = {
          pages: w.defaultPages
        };
      }
      return next;
    });
  };
  const setAddPages = (key, pages) => {
    setAddWorks(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        pages
      }
    }));
  };
  const toggleStat = key => {
    setStats(prev => {
      const next = {
        ...prev
      };
      if (next[key]) delete next[key];else next[key] = true;
      return next;
    });
  };
  const toggleArticle = key => {
    setArticles(prev => {
      const next = {
        ...prev
      };
      if (next[key]) delete next[key];else next[key] = true;
      return next;
    });
  };
  const calc = useMemo(() => {
    let total = 0;
    let complexity = 0;
    const items = [];
    if (mainWorkData) {
      const w = mainWorkData;
      let pricePos,
        complexPos,
        label = w.name;
      if (partial) {
        const r = Math.max(0, partialPages) / w.defaultPages;
        pricePos = w.base * 0.3 + w.base * 0.7 * Math.pow(r, 0.75);
        complexPos = w.complexity * Math.pow(r, 0.75);
        label = w.name + ' · частично, ' + Math.max(0, partialPages) + ' стр.';
      } else {
        const safePages = Math.max(1, mainPages);
        const r = safePages / w.defaultPages;
        const k = Math.pow(r, 0.5);
        pricePos = w.base * k;
        complexPos = w.complexity * k;
        label = w.name + ' · ' + safePages + ' стр.';
      }
      total += pricePos;
      complexity += complexPos;
      items.push({
        name: label,
        price: pricePos
      });
    }
    Object.entries(addWorks).forEach(([key, settings]) => {
      const w = ADDITIONAL_WORKS.find(x => x.key === key);
      let pricePos,
        complexPos,
        label = w.name;
      if (w.defaultPages !== null) {
        const pages = Math.max(1, settings.pages || w.defaultPages);
        const r = pages / w.defaultPages;
        const k = Math.pow(r, 0.5);
        pricePos = w.base * k;
        complexPos = w.complexity * k;
        label = w.name + ' · ' + pages + ' стр.';
      } else {
        pricePos = w.base;
        complexPos = w.complexity;
      }
      total += pricePos;
      complexity += complexPos;
      items.push({
        name: label,
        price: pricePos
      });
    });
    Object.entries(stats).forEach(([key, on]) => {
      if (!on) return;
      const s = STATS.find(x => x.key === key);
      total += s.price;
      complexity += s.complexity;
      items.push({
        name: s.name,
        price: s.price
      });
    });
    Object.entries(articles).forEach(([key, on]) => {
      if (!on) return;
      const a = ARTICLES.find(x => x.key === key);
      if (!a) return;
      total += a.base;
      complexity += a.complexity;
      items.push({
        name: a.name,
        price: a.base
      });
    });
    const deadlineDaysEff = deadlineUnit === 'months' ? Math.max(1, deadlineMonths) * 30 : Math.max(1, deadlineDays);
    let urgency = 0;
    let level = 0;
    let urgencyLabel = 'комфортно';
    let ratio = 0;
    if (complexity > 0 && deadlineDaysEff > 0) {
      ratio = complexity / deadlineDaysEff;
      if (ratio < 1.0) {
        urgency = 0;
        level = 0;
        urgencyLabel = 'комфортно';
      } else if (ratio <= 1.5) {
        urgency = 30;
        level = 1;
        urgencyLabel = 'ускоренно';
      } else if (ratio <= 2.0) {
        urgency = 60;
        level = 2;
        urgencyLabel = 'интенсивно';
      } else {
        urgency = 100;
        level = 3;
        urgencyLabel = 'форсированно';
      }
    }
    const monthData = MONTHS.find(m => m.num === month);
    const seasonDiscount = monthData ? monthData.discount : 0;

    // Промокод: серверный список приоритетнее, fallback на локальный
    const promoUpper = promo.trim().toUpperCase();
    let promoOk = false;
    let promoDiscount = 0;
    if (promoUpper) {
      if (serverPromos && Object.keys(serverPromos).length > 0) {
        if (serverPromos[promoUpper] !== undefined) {
          promoOk = true;
          promoDiscount = Number(serverPromos[promoUpper]) || 0;
        }
      } else if (promoUpper === PROMO_CODE) {
        promoOk = true;
        promoDiscount = PROMO_DISCOUNT;
      }
    }
    const totalModifier = urgency - seasonDiscount - promoDiscount;
    const finalPrice = total * (1 + totalModifier / 100);
    return {
      basePrice: total,
      complexity,
      ratio,
      urgency,
      level,
      urgencyLabel,
      seasonDiscount,
      promoDiscount,
      promoOk,
      totalModifier,
      finalPrice,
      items,
      hasItems: items.length > 0,
      deadlineDaysEff
    };
  }, [mainWorkData, mainPages, partial, partialPages, addWorks, stats, articles, month, promo, deadlineDays, deadlineMonths, deadlineUnit, serverPromos]);
  const monthInfo = MONTHS.find(m => m.num === month);
  const comfortDays = Math.max(1, Math.ceil(calc.complexity));
  const deadlineMin = 1;
  const deadlineMax = useMemo(() => getDeadlineMax(calc.complexity, deadlineUnit), [calc.complexity, deadlineUnit]);
  useEffect(() => {
    if (deadlineUnit === 'days' && deadlineDays > deadlineMax) setDeadlineDays(deadlineMax);
    if (deadlineUnit === 'months' && deadlineMonths > deadlineMax) setDeadlineMonths(deadlineMax);
  }, [deadlineMax, deadlineUnit, deadlineDays, deadlineMonths]);
  const deadlineValue = deadlineUnit === 'months' ? deadlineMonths : deadlineDays;
  const setDeadlineValue = deadlineUnit === 'months' ? setDeadlineMonths : setDeadlineDays;
  const deadlineValueShown = Math.min(Math.max(deadlineMin, deadlineValue), deadlineMax);
  const deadlineGradient = useMemo(() => {
    const compInUnit = deadlineUnit === 'months' ? calc.complexity / 30 : calc.complexity;
    return buildDeadlineGradient(compInUnit, deadlineMin, deadlineMax);
  }, [calc.complexity, deadlineUnit, deadlineMax]);
  const deadlineUnitName = deadlineUnit === 'months' ? plural(deadlineValueShown, ['месяц', 'месяца', 'месяцев']) : plural(deadlineValueShown, ['день', 'дня', 'дней']);
  const showStep2Next = calc.hasItems && step < 3;
  const clampPages = (val, min, max) => Math.max(min, Math.min(max, val));
  const openForm = () => {
    setSubmitDone(false);
    setSubmitError('');
    setShowForm(true);
  };
  const submitOrder = async e => {
    if (e && e.preventDefault) e.preventDefault();
    setSubmitError('');
    if (!formName.trim()) {
      setSubmitError('Укажите имя');
      return;
    }
    if (!formContact.trim()) {
      setSubmitError('Укажите способ связи');
      return;
    }
    if (!calc.hasItems) {
      setSubmitError('Выберите хотя бы одну позицию');
      return;
    }
    const payload = {
      name: formName.trim(),
      contact: formContact.trim(),
      comment: formComment.trim(),
      config: {
        items: calc.items,
        basePrice: calc.basePrice,
        urgency: calc.urgency,
        urgencyLabel: calc.urgencyLabel,
        seasonDiscount: calc.seasonDiscount,
        promoCode: calc.promoOk ? promo.trim().toUpperCase() : '',
        promoDiscount: calc.promoDiscount,
        totalModifier: calc.totalModifier,
        finalPrice: calc.finalPrice,
        deadline: deadlineValueShown + ' ' + deadlineUnitName,
        month: monthInfo.name,
        comfortDays: comfortDays
      }
    };
    setSubmitting(true);
    try {
      const r = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) {
        setSubmitError(json.error || 'Ошибка отправки. Попробуйте позже.');
      } else {
        setSubmitDone(true);
        setFormName('');
        setFormContact('');
        setFormComment('');
      }
    } catch (err) {
      setSubmitError('Ошибка сети. Проверьте интернет и попробуйте снова.');
    } finally {
      setSubmitting(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "app"
  }, /*#__PURE__*/React.createElement("header", {
    className: "topbar"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "topbar-main"
  }, "\u041A\u0430\u043B\u044C\u043A\u0443\u043B\u044F\u0442\u043E\u0440 \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u0438"), /*#__PURE__*/React.createElement("div", {
    className: "topbar-brand"
  }, "\u0414\u0438\u043F\u043B\u043E\u043C\u043D\u0430\u044F \u043C\u0430\u0441\u0442\u0435\u0440\u0441\u043A\u0430\u044F")), /*#__PURE__*/React.createElement("div", {
    className: "layout"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "block-title layout-title"
  }, "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0442\u0438\u043F \u0440\u0430\u0431\u043E\u0442\u044B"), /*#__PURE__*/React.createElement("div", {
    className: "form-col"
  }, /*#__PURE__*/React.createElement("section", {
    className: "block"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cards"
  }, MAIN_WORKS.map(w => {
    const sel = mainWork === w.key;
    return /*#__PURE__*/React.createElement("button", {
      key: w.key,
      type: "button",
      className: "card" + (sel ? " selected" : ""),
      onClick: () => handleSelectMain(w.key)
    }, sel && /*#__PURE__*/React.createElement("span", {
      className: "card-deselect",
      "aria-hidden": "true"
    }, "\u2715"), /*#__PURE__*/React.createElement("span", {
      className: "card-title"
    }, w.name), /*#__PURE__*/React.createElement("span", {
      className: "card-price-label"
    }, "\u0411\u0430\u0437\u043E\u0432\u0430\u044F \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C"), /*#__PURE__*/React.createElement("span", {
      className: "card-price"
    }, formatPrice(w.base), " \u20BD"));
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "card card-other" + (showAdd ? " open" : ""),
    onClick: () => setShowAdd(!showAdd)
  }, /*#__PURE__*/React.createElement("span", {
    className: "card-other-plus"
  }, "+"), /*#__PURE__*/React.createElement("span", {
    className: "card-title"
  }, "\u0414\u0440\u0443\u0433\u0438\u0435 \u0440\u0430\u0431\u043E\u0442\u044B"))), /*#__PURE__*/React.createElement("div", {
    className: "expand" + (mainWorkData ? " open" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "expand-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("div", {
    className: "field-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "field-label"
  }, "\u041E\u0431\u044A\u0451\u043C \u0440\u0430\u0431\u043E\u0442\u044B"), /*#__PURE__*/React.createElement("span", {
    className: "num-unit" + (partial ? " muted" : "")
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "num-input" + (partial ? " muted" : ""),
    value: mainPages,
    min: mainWorkData ? mainWorkData.minPages : 1,
    max: mainWorkData ? mainWorkData.maxPages : 999,
    disabled: partial,
    onChange: e => {
      const v = parseInt(e.target.value, 10);
      if (!isNaN(v)) setMainPages(v);else if (e.target.value === '') setMainPages(0);
    },
    onBlur: () => {
      if (!mainWorkData) return;
      const v = clampPages(mainPages, mainWorkData.minPages, mainWorkData.maxPages);
      if (v !== mainPages) setMainPages(v);
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "unit"
  }, "\u0441\u0442\u0440."))), /*#__PURE__*/React.createElement("div", {
    className: "range-wrap"
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: mainWorkData ? mainWorkData.minPages : 1,
    max: mainWorkData ? mainWorkData.maxPages : 100,
    value: mainWorkData ? clampPages(mainPages, mainWorkData.minPages, mainWorkData.maxPages) : mainPages,
    disabled: partial,
    onChange: e => setMainPages(+e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "field-hint"
  }, "\u0421\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u044B\u0439 \u043E\u0431\u044A\u0451\u043C \u2014 ", /*#__PURE__*/React.createElement("span", {
    className: "accent"
  }, mainWorkData ? mainWorkData.defaultPages : '—', " \u0441\u0442\u0440."))), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "checkbox"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: partial,
    onChange: e => setPartial(e.target.checked)
  }), /*#__PURE__*/React.createElement("span", {
    className: "checkbox-mark"
  }), /*#__PURE__*/React.createElement("span", null, "\u0427\u0430\u0441\u0442\u044C \u0440\u0430\u0431\u043E\u0442\u044B \u0443\u0436\u0435 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0430 \u0441\u0430\u043C\u043E\u0441\u0442\u043E\u044F\u0442\u0435\u043B\u044C\u043D\u043E")), /*#__PURE__*/React.createElement("div", {
    className: "expand" + (partial ? " open" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "expand-inner"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "field-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "field-label"
  }, "\u0421\u043A\u043E\u043B\u044C\u043A\u043E \u0441\u0442\u0440\u0430\u043D\u0438\u0446 \u043D\u0443\u0436\u043D\u043E \u043D\u0430\u043F\u0438\u0441\u0430\u0442\u044C \u043D\u0430\u043C"), /*#__PURE__*/React.createElement("span", {
    className: "num-unit"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "num-input",
    value: partialPages,
    min: 1,
    max: mainWorkData ? mainWorkData.maxPages : 999,
    onChange: e => {
      const v = parseInt(e.target.value, 10);
      if (!isNaN(v)) setPartialPages(v);else if (e.target.value === '') setPartialPages(0);
    },
    onBlur: () => {
      if (!mainWorkData) return;
      const v = clampPages(partialPages, 1, mainWorkData.maxPages);
      if (v !== partialPages) setPartialPages(v);
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "unit"
  }, "\u0441\u0442\u0440."))), /*#__PURE__*/React.createElement("div", {
    className: "range-wrap"
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: 1,
    max: mainWorkData ? mainWorkData.maxPages : 100,
    value: mainWorkData ? clampPages(partialPages, 1, mainWorkData.maxPages) : partialPages,
    onChange: e => setPartialPages(+e.target.value)
  }))))))))), /*#__PURE__*/React.createElement("div", {
    className: "expand" + (showAdd ? " open" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "expand-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "other-title"
  }, "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u043F\u043E\u0437\u0438\u0446\u0438\u0438"), /*#__PURE__*/React.createElement("div", {
    className: "add-list"
  }, /*#__PURE__*/React.createElement("div", {
    className: "add-item"
  }, /*#__PURE__*/React.createElement("div", {
    className: "add-item-head"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "spoiler-row" + (showStats ? ' open' : ''),
    onClick: () => setShowStats(!showStats)
  }, /*#__PURE__*/React.createElement("span", {
    className: "spoiler-mark"
  }, "+"), /*#__PURE__*/React.createElement("span", null, "\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0434\u0430\u043D\u043D\u044B\u0445")), /*#__PURE__*/React.createElement("span", {
    className: "add-item-price"
  }, "\u043E\u0442 1 000 \u20BD")), /*#__PURE__*/React.createElement("div", {
    className: "expand" + (showStats ? ' open' : '')
  }, /*#__PURE__*/React.createElement("div", {
    className: "expand-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sub-list"
  }, STATS.map(s => /*#__PURE__*/React.createElement("label", {
    key: s.key,
    className: "sub-item"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: !!stats[s.key],
    onChange: () => toggleStat(s.key)
  }), /*#__PURE__*/React.createElement("span", {
    className: "checkbox-mark"
  }), /*#__PURE__*/React.createElement("span", {
    className: "sub-item-name"
  }, s.name), /*#__PURE__*/React.createElement("span", {
    className: "sub-item-price"
  }, formatPrice(s.price), " \u20BD"))))))), (() => {
    const ORDER = ['abstract', '__articles__', 'practice', 'essay', 'presentation', 'homework'];
    return ORDER.map(slot => {
      if (slot === '__articles__') {
        return /*#__PURE__*/React.createElement("div", {
          key: "articles-spoiler",
          className: "add-item"
        }, /*#__PURE__*/React.createElement("div", {
          className: "add-item-head"
        }, /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "spoiler-row" + (showArticle ? ' open' : ''),
          onClick: () => setShowArticle(!showArticle)
        }, /*#__PURE__*/React.createElement("span", {
          className: "spoiler-mark"
        }, "+"), /*#__PURE__*/React.createElement("span", null, "\u041D\u0430\u0443\u0447\u043D\u0430\u044F \u0441\u0442\u0430\u0442\u044C\u044F")), /*#__PURE__*/React.createElement("span", {
          className: "add-item-price"
        }, "\u043E\u0442 4 000 \u20BD")), /*#__PURE__*/React.createElement("div", {
          className: "expand" + (showArticle ? ' open' : '')
        }, /*#__PURE__*/React.createElement("div", {
          className: "expand-inner"
        }, /*#__PURE__*/React.createElement("div", {
          className: "sub-list"
        }, ARTICLES.map(a => /*#__PURE__*/React.createElement("label", {
          key: a.key,
          className: "sub-item"
        }, /*#__PURE__*/React.createElement("input", {
          type: "checkbox",
          checked: !!articles[a.key],
          onChange: () => toggleArticle(a.key)
        }), /*#__PURE__*/React.createElement("span", {
          className: "checkbox-mark"
        }), /*#__PURE__*/React.createElement("span", {
          className: "sub-item-name"
        }, a.name), /*#__PURE__*/React.createElement("span", {
          className: "sub-item-price"
        }, formatPrice(a.base), " \u20BD")))))));
      }
      const w = ADDITIONAL_WORKS.find(x => x.key === slot);
      if (!w) return null;
      const enabled = !!addWorks[w.key];
      const settings = addWorks[w.key] || {};
      const pages = settings.pages || w.defaultPages || 0;
      return /*#__PURE__*/React.createElement("div", {
        key: w.key,
        className: "add-item"
      }, /*#__PURE__*/React.createElement("div", {
        className: "add-item-head"
      }, /*#__PURE__*/React.createElement("label", {
        className: "checkbox add-item-name"
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: enabled,
        onChange: () => toggleAdd(w.key)
      }), /*#__PURE__*/React.createElement("span", {
        className: "checkbox-mark"
      }), /*#__PURE__*/React.createElement("span", null, w.name)), /*#__PURE__*/React.createElement("span", {
        className: "add-item-price"
      }, formatPrice(w.base), " \u20BD")), w.defaultPages && /*#__PURE__*/React.createElement("div", {
        className: "expand" + (enabled ? " open" : "")
      }, /*#__PURE__*/React.createElement("div", {
        className: "expand-inner"
      }, /*#__PURE__*/React.createElement("div", {
        className: "add-item-controls"
      }, /*#__PURE__*/React.createElement("div", {
        className: "field-row"
      }, /*#__PURE__*/React.createElement("span", {
        className: "field-label"
      }, "\u041E\u0431\u044A\u0451\u043C"), /*#__PURE__*/React.createElement("span", {
        className: "num-unit"
      }, /*#__PURE__*/React.createElement("input", {
        type: "number",
        className: "num-input",
        value: pages,
        min: w.minPages || 1,
        max: w.maxPages || 999,
        onChange: e => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v)) setAddPages(w.key, v);else if (e.target.value === '') setAddPages(w.key, 0);
        },
        onBlur: () => {
          const v = clampPages(pages, w.minPages || 1, w.maxPages || 999);
          if (v !== pages) setAddPages(w.key, v);
        }
      }), /*#__PURE__*/React.createElement("span", {
        className: "unit"
      }, "\u0441\u0442\u0440."))), /*#__PURE__*/React.createElement("div", {
        className: "range-wrap"
      }, /*#__PURE__*/React.createElement("input", {
        type: "range",
        min: w.minPages || 1,
        max: w.maxPages || 50,
        value: clampPages(pages, w.minPages || 1, w.maxPages || 50),
        onChange: e => setAddPages(w.key, +e.target.value)
      }))))));
    });
  })())))), /*#__PURE__*/React.createElement("div", {
    className: "next-wrap" + (showStep2Next ? " visible" : "")
  }, /*#__PURE__*/React.createElement("button", {
    className: "next-btn",
    type: "button",
    onClick: () => advance(3, deadlineRef)
  }, "\u0414\u0430\u043B\u0435\u0435 ", /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\u2193")))), /*#__PURE__*/React.createElement("div", {
    className: "expand" + (step >= 3 ? " open" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "expand-inner"
  }, /*#__PURE__*/React.createElement("section", {
    className: "block",
    ref: deadlineRef
  }, /*#__PURE__*/React.createElement("h2", {
    className: "block-title left"
  }, "\u0421\u0440\u043E\u043A \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u044F"), /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "deadline-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "deadline-main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "deadline-main-label"
  }, "\u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u043D\u044B\u0439 \u0441\u0440\u043E\u043A"), /*#__PURE__*/React.createElement("div", {
    className: "deadline-main-value"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "deadline-num",
    value: deadlineValueShown,
    min: deadlineMin,
    max: deadlineMax,
    onChange: e => {
      const v = parseInt(e.target.value, 10);
      if (!isNaN(v) && v >= 0) setDeadlineValue(v);else if (e.target.value === '') setDeadlineValue(0);
    },
    onBlur: () => {
      const v = Math.max(deadlineMin, Math.min(deadlineMax, deadlineValueShown));
      if (v !== deadlineValue) setDeadlineValue(v);
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "deadline-unit"
  }, deadlineUnitName))), /*#__PURE__*/React.createElement("div", {
    className: "urgency-badge level-" + calc.level
  }, /*#__PURE__*/React.createElement("span", {
    className: "urgency-pct"
  }, calc.urgency > 0 ? '+' + calc.urgency + '%' : '0%'), /*#__PURE__*/React.createElement("span", {
    className: "urgency-text"
  }, calc.urgencyLabel))), /*#__PURE__*/React.createElement("div", {
    className: "range-wrap"
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: deadlineMin,
    max: deadlineMax,
    value: deadlineValueShown,
    onChange: e => setDeadlineValue(+e.target.value),
    style: {
      '--track-bg': deadlineGradient
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "deadline-comfort"
  }, /*#__PURE__*/React.createElement("span", {
    className: "deadline-comfort-label"
  }, "\u041A\u043E\u043C\u0444\u043E\u0440\u0442\u043D\u043E \u0434\u043B\u044F \u0430\u0432\u0442\u043E\u0440\u043E\u0432 \u2014"), /*#__PURE__*/React.createElement("span", {
    className: "deadline-comfort-value"
  }, comfortDays, " ", plural(comfortDays, ['день', 'дня', 'дней']))), /*#__PURE__*/React.createElement("div", {
    className: "zone-legend"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: COLOR.crit
    }
  }), "\u0444\u043E\u0440\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u043E +100%"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: COLOR.bad
    }
  }), "\u0438\u043D\u0442\u0435\u043D\u0441\u0438\u0432\u043D\u043E +60%"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: COLOR.warn
    }
  }), "\u0443\u0441\u043A\u043E\u0440\u0435\u043D\u043D\u043E +30%"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: COLOR.good
    }
  }), "\u043A\u043E\u043C\u0444\u043E\u0440\u0442\u043D\u043E"))), /*#__PURE__*/React.createElement("div", {
    className: "next-wrap" + (step < 4 ? " visible" : "")
  }, /*#__PURE__*/React.createElement("button", {
    className: "next-btn",
    type: "button",
    onClick: () => advance(4, orderRef)
  }, "\u0414\u0430\u043B\u0435\u0435 ", /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\u2193")))))), /*#__PURE__*/React.createElement("div", {
    className: "expand" + (step >= 4 ? " open" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "expand-inner"
  }, /*#__PURE__*/React.createElement("section", {
    className: "block",
    ref: orderRef
  }, /*#__PURE__*/React.createElement("h2", {
    className: "block-title left"
  }, "\u041C\u0435\u0441\u044F\u0446 \u043E\u0444\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u044F \u0437\u0430\u043A\u0430\u0437\u0430"), /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "field",
    style: {
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "month-display",
    key: month
  }, monthInfo.name), /*#__PURE__*/React.createElement("div", {
    className: "month-discount-line " + (monthInfo.discount > 0 ? 'has' : '')
  }, monthInfo.discount > 0 ? '— скидка ' + monthInfo.discount + '%' : '— сезон высокого спроса, без скидки'), /*#__PURE__*/React.createElement("div", {
    className: "range-wrap"
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: 1,
    max: 12,
    value: month,
    onChange: e => setMonth(+e.target.value),
    style: {
      '--track-bg': MONTH_GRADIENT
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "month-marks"
  }, MONTHS.map((m, i) => {
    const frac = i / 11;
    return /*#__PURE__*/React.createElement("span", {
      key: 't' + m.num,
      className: "tick " + (month === m.num ? 'current' : ''),
      style: {
        left: 'calc(' + frac + ' * (100% - 20px) + 10px)'
      }
    });
  }), MONTHS.map((m, i) => {
    const frac = i / 11;
    let style;
    if (i === 0) {
      style = {
        left: '10px'
      };
    } else if (i === 11) {
      style = {
        right: '10px'
      };
    } else {
      style = {
        left: 'calc(' + frac + ' * (100% - 20px) + 10px)',
        transform: 'translateX(-50%)'
      };
    }
    return /*#__PURE__*/React.createElement("span", {
      key: 'l' + m.num,
      className: "month-label " + (month === m.num ? 'current' : ''),
      style: style
    }, /*#__PURE__*/React.createElement("span", {
      className: "lbl-full"
    }, m.name), /*#__PURE__*/React.createElement("span", {
      className: "lbl-short"
    }, m.short));
  })), /*#__PURE__*/React.createElement("div", {
    className: "zone-legend",
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: COLOR.crit
    }
  }), "\u0441\u0435\u0437\u043E\u043D \u0432\u044B\u0441\u043E\u043A\u043E\u0433\u043E \u0441\u043F\u0440\u043E\u0441\u0430"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: COLOR.warn
    }
  }), "\u0441\u043A\u0438\u0434\u043A\u0430 10%"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: COLOR.good
    }
  }), "\u0441\u043A\u0438\u0434\u043A\u0430 20%"))), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("div", {
    className: "field-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "field-label"
  }, "\u041F\u0440\u043E\u043C\u043E\u043A\u043E\u0434")), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "promo-input",
    placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043F\u0440\u043E\u043C\u043E\u043A\u043E\u0434",
    value: promo,
    onChange: e => setPromo(e.target.value),
    autoComplete: "off",
    spellCheck: false
  }), promo.trim() && /*#__PURE__*/React.createElement("div", {
    className: "promo-status " + (calc.promoOk ? 'success' : 'fail')
  }, calc.promoOk ? '✓ Промокод применён · −' + PROMO_DISCOUNT + '%' : 'Промокод не распознан'))), /*#__PURE__*/React.createElement("div", {
    className: "next-wrap" + (step < 5 ? " visible" : "")
  }, /*#__PURE__*/React.createElement("button", {
    className: "next-btn",
    type: "button",
    onClick: () => advance(5, calcRef)
  }, "\u0414\u0430\u043B\u0435\u0435 ", /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\u2193")))))), /*#__PURE__*/React.createElement("div", {
    className: "expand" + (step >= 5 ? " open" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "expand-inner"
  }, /*#__PURE__*/React.createElement("section", {
    className: "block",
    ref: calcRef
  }, /*#__PURE__*/React.createElement("h2", {
    className: "block-title left"
  }, "\u0420\u0430\u0441\u0447\u0451\u0442"), /*#__PURE__*/React.createElement("div", {
    className: "breakdown"
  }, calc.items.map((item, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    className: "bd-row item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, item.name), /*#__PURE__*/React.createElement("span", {
    className: "value"
  }, formatPrice(item.price), " \u20BD"))), calc.items.length > 1 && /*#__PURE__*/React.createElement("div", {
    className: "bd-row summary"
  }, /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, "\u0411\u0430\u0437\u043E\u0432\u0430\u044F \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C"), /*#__PURE__*/React.createElement("span", {
    className: "value"
  }, formatPrice(calc.basePrice), " \u20BD")), (calc.urgency > 0 || calc.seasonDiscount > 0 || calc.promoDiscount > 0) && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "bd-divider"
  }), calc.urgency > 0 && /*#__PURE__*/React.createElement("div", {
    className: "bd-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, "\u041D\u0430\u0446\u0435\u043D\u043A\u0430 \u0437\u0430 \u0441\u0440\u043E\u0447\u043D\u043E\u0441\u0442\u044C"), /*#__PURE__*/React.createElement("span", {
    className: "value positive"
  }, "+", calc.urgency, "%")), calc.seasonDiscount > 0 && /*#__PURE__*/React.createElement("div", {
    className: "bd-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, "\u0421\u043A\u0438\u0434\u043A\u0430 \xB7 ", monthInfo.name.toLowerCase()), /*#__PURE__*/React.createElement("span", {
    className: "value negative"
  }, "\u2212", calc.seasonDiscount, "%")), calc.promoDiscount > 0 && /*#__PURE__*/React.createElement("div", {
    className: "bd-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, "\u041F\u0440\u043E\u043C\u043E\u043A\u043E\u0434 ", PROMO_CODE), /*#__PURE__*/React.createElement("span", {
    className: "value negative"
  }, "\u2212", calc.promoDiscount, "%")), /*#__PURE__*/React.createElement("div", {
    className: "bd-row summary"
  }, /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, "\u0418\u0442\u043E\u0433\u043E\u0432\u044B\u0439 \u043C\u043E\u0434\u0438\u0444\u0438\u043A\u0430\u0442\u043E\u0440"), /*#__PURE__*/React.createElement("span", {
    className: "value " + (calc.totalModifier > 0 ? 'positive' : calc.totalModifier < 0 ? 'negative' : '')
  }, calc.totalModifier > 0 ? '+' : '', calc.totalModifier, "%"))), /*#__PURE__*/React.createElement("div", {
    className: "bd-row final"
  }, /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, "\u0418\u0442\u043E\u0433\u043E"), /*#__PURE__*/React.createElement("span", {
    className: "value",
    key: Math.round(calc.finalPrice)
  }, formatPrice(calc.finalPrice), " \u20BD")), calc.finalPrice > 10000 && /*#__PURE__*/React.createElement("div", {
    className: "bd-installment"
  }, "\u0412\u043E\u0437\u043C\u043E\u0436\u043D\u0430 \u043E\u043F\u043B\u0430\u0442\u0430 \u0432 \u0440\u0430\u0441\u0441\u0440\u043E\u0447\u043A\u0443 \u2014 \u0443\u0442\u043E\u0447\u043D\u0438\u0442\u0435 \u0438\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u043E")))))), /*#__PURE__*/React.createElement("aside", {
    className: "sidebar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sidebar-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sidebar-label"
  }, "\u041F\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C"), /*#__PURE__*/React.createElement("div", {
    className: "sidebar-price",
    key: Math.round(calc.finalPrice)
  }, formatPrice(calc.finalPrice), " \u20BD"), calc.hasItems && calc.complexity > 0 && /*#__PURE__*/React.createElement("div", {
    className: "sidebar-comfort"
  }, "\u043A\u043E\u043C\u0444\u043E\u0440\u0442\u043D\u043E \u0434\u043B\u044F \u0430\u0432\u0442\u043E\u0440\u043E\u0432 \xB7 ", comfortDays, " ", plural(comfortDays, ['день', 'дня', 'дней'])), calc.items.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "sidebar-section"
  }, calc.items.map((item, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    className: "sidebar-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, item.name), /*#__PURE__*/React.createElement("span", {
    className: "value"
  }, formatPrice(item.price), " \u20BD")))), (calc.urgency > 0 || calc.seasonDiscount > 0 || calc.promoDiscount > 0) && /*#__PURE__*/React.createElement("div", {
    className: "sidebar-section"
  }, calc.urgency > 0 && /*#__PURE__*/React.createElement("div", {
    className: "sidebar-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, "\u0421\u0440\u043E\u0447\u043D\u043E\u0441\u0442\u044C"), /*#__PURE__*/React.createElement("span", {
    className: "value positive"
  }, "+", calc.urgency, "%")), calc.seasonDiscount > 0 && /*#__PURE__*/React.createElement("div", {
    className: "sidebar-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, "\u0421\u0435\u0437\u043E\u043D \xB7 ", monthInfo.name.toLowerCase()), /*#__PURE__*/React.createElement("span", {
    className: "value negative"
  }, "\u2212", calc.seasonDiscount, "%")), calc.promoDiscount > 0 && /*#__PURE__*/React.createElement("div", {
    className: "sidebar-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, "\u041F\u0440\u043E\u043C\u043E\u043A\u043E\u0434"), /*#__PURE__*/React.createElement("span", {
    className: "value negative"
  }, "\u2212", calc.promoDiscount, "%"))), calc.hasItems ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "sidebar-cta",
    type: "button",
    onClick: openForm
  }, "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443"), /*#__PURE__*/React.createElement("a", {
    className: "sidebar-vk",
    href: VK_LINK,
    target: "_blank",
    rel: "noopener noreferrer"
  }, "\u0438\u043B\u0438 \u043D\u0430\u043F\u0438\u0441\u0430\u0442\u044C \u0432 VK \u2192")) : /*#__PURE__*/React.createElement("div", {
    className: "sidebar-cta-placeholder"
  }, "\u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0442\u0438\u043F \u0440\u0430\u0431\u043E\u0442\u044B"), calc.finalPrice > 10000 && /*#__PURE__*/React.createElement("div", {
    className: "sidebar-installment"
  }, "\u0412\u043E\u0437\u043C\u043E\u0436\u043D\u0430 \u043E\u043F\u043B\u0430\u0442\u0430 \u0432 \u0440\u0430\u0441\u0441\u0440\u043E\u0447\u043A\u0443")))), /*#__PURE__*/React.createElement("div", {
    className: "modal-backdrop" + (showForm ? " open" : ""),
    onClick: e => {
      if (e.target === e.currentTarget) setShowForm(false);
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-card",
    role: "dialog",
    "aria-modal": "true"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "modal-close",
    "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C",
    onClick: () => setShowForm(false)
  }, "\xD7"), !submitDone ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "modal-title"
  }, "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443"), /*#__PURE__*/React.createElement("div", {
    className: "modal-subtitle"
  }, "\u041C\u044B \u0441\u0432\u044F\u0436\u0435\u043C\u0441\u044F \u0441 \u0432\u0430\u043C\u0438 \u0438 \u043E\u0431\u0441\u0443\u0434\u0438\u043C \u0434\u0435\u0442\u0430\u043B\u0438. \u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u043C\u043E\u0436\u0435\u0442 \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C\u0441\u044F \u043F\u043E \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0430\u043C \u0440\u0430\u0437\u0433\u043E\u0432\u043E\u0440\u0430."), /*#__PURE__*/React.createElement("div", {
    className: "modal-summary"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-summary-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "modal-summary-label"
  }, "\u041F\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C"), /*#__PURE__*/React.createElement("span", {
    className: "modal-summary-total"
  }, formatPrice(calc.finalPrice), " \u20BD"))), /*#__PURE__*/React.createElement("form", {
    onSubmit: submitOrder
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label",
    htmlFor: "form-name"
  }, "\u041A\u0430\u043A \u043A \u0432\u0430\u043C \u043E\u0431\u0440\u0430\u0449\u0430\u0442\u044C\u0441\u044F"), /*#__PURE__*/React.createElement("input", {
    id: "form-name",
    type: "text",
    className: "form-input",
    placeholder: "\u0418\u043C\u044F",
    value: formName,
    onChange: e => setFormName(e.target.value),
    autoComplete: "name",
    maxLength: 150
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label",
    htmlFor: "form-contact"
  }, "\u0421\u043F\u043E\u0441\u043E\u0431 \u0441\u0432\u044F\u0437\u0438"), /*#__PURE__*/React.createElement("input", {
    id: "form-contact",
    type: "text",
    className: "form-input",
    placeholder: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D, telegram (@username), VK \u0438\u043B\u0438 email",
    value: formContact,
    onChange: e => setFormContact(e.target.value),
    maxLength: 250
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label",
    htmlFor: "form-comment"
  }, "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439 (\u043D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E)"), /*#__PURE__*/React.createElement("textarea", {
    id: "form-comment",
    className: "form-textarea",
    placeholder: "\u0422\u0435\u043C\u0430 \u0440\u0430\u0431\u043E\u0442\u044B, \u043E\u0441\u043E\u0431\u044B\u0435 \u043F\u043E\u0436\u0435\u043B\u0430\u043D\u0438\u044F\u2026",
    value: formComment,
    onChange: e => setFormComment(e.target.value),
    rows: 3,
    maxLength: 1500
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "form-submit" + (submitting ? " loading" : ""),
    disabled: submitting
  }, submitting ? 'Отправляется' : 'Отправить заявку'), submitError && /*#__PURE__*/React.createElement("div", {
    className: "form-error"
  }, submitError), /*#__PURE__*/React.createElement("a", {
    className: "form-vk-link",
    href: VK_LINK,
    target: "_blank",
    rel: "noopener noreferrer"
  }, "\u0438\u043B\u0438 \u043D\u0430\u043F\u0438\u0441\u0430\u0442\u044C \u043D\u0430\u043C \u043D\u0430\u043F\u0440\u044F\u043C\u0443\u044E \u0432 VK \u2192"))) : /*#__PURE__*/React.createElement("div", {
    className: "form-success"
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-success-mark"
  }), /*#__PURE__*/React.createElement("div", {
    className: "form-success-title"
  }, "\u0417\u0430\u044F\u0432\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0430"), /*#__PURE__*/React.createElement("div", {
    className: "form-success-text"
  }, "\u041C\u044B \u0441\u0432\u044F\u0436\u0435\u043C\u0441\u044F \u0441 \u0432\u0430\u043C\u0438 \u0432 \u0431\u043B\u0438\u0436\u0430\u0439\u0448\u0435\u0435 \u0432\u0440\u0435\u043C\u044F \u0438 \u043E\u0431\u0441\u0443\u0434\u0438\u043C \u0434\u0435\u0442\u0430\u043B\u0438 \u0437\u0430\u043A\u0430\u0437\u0430."), /*#__PURE__*/React.createElement("a", {
    className: "form-vk-link",
    href: VK_LINK,
    target: "_blank",
    rel: "noopener noreferrer"
  }, "\u043D\u0430\u043F\u0438\u0441\u0430\u0442\u044C \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E \u0432 VK \u2192")))), /*#__PURE__*/React.createElement("div", {
    className: "sticky" + (calc.hasItems ? " visible" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "sticky-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sticky-info"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sticky-label"
  }, "\u041F\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C"), /*#__PURE__*/React.createElement("span", {
    className: "sticky-price sticky-price-anim",
    key: Math.round(calc.finalPrice)
  }, formatPrice(calc.finalPrice), " \u20BD")), /*#__PURE__*/React.createElement("button", {
    className: "cta",
    type: "button",
    onClick: openForm
  }, "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443"))));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));