document.addEventListener("DOMContentLoaded", () => {
  /* SCROLL NAV */
  document.querySelectorAll("[data-scroll]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.querySelector(btn.dataset.scroll);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* DESK MARCHÉS */

  const ASSETS = {
    sp500: {
      name: "S&P 500",
      tag: "Colonne vertébrale actions US",
      base: 5095,
      comment:
        "Indice large actions US. Sert souvent de noyau de portefeuille long terme. Sensible aux taux, aux résultats des grandes entreprises et au sentiment global de risque.",
      role:
        "Utilisé via ETF comme socle actions. Jamais avec de l’argent nécessaire à court terme.",
      day: +0.32,
      series: {
        "1D": [5090, 5098, 5085, 5102, 5095],
        "1M": [4950, 5000, 5040, 5070, 5095],
        "1Y": [4300, 4550, 4700, 4900, 5095],
      },
    },
    nasdaq: {
      name: "NASDAQ 100",
      tag: "Tech / croissance",
      base: 18045,
      comment:
        "Indice très exposé aux valeurs technologiques et de croissance. Plus volatile, réagit fortement aux taux.",
      role:
        "Poche croissance. Utilisation en complément d’un ETF plus large, jamais seul pour un profil débutant.",
      day: +0.61,
      series: {
        "1D": [17950, 18010, 17920, 18080, 18045],
        "1M": [17000, 17400, 17700, 17900, 18045],
        "1Y": [13500, 15000, 16200, 17300, 18045],
      },
    },
    cac40: {
      name: "CAC 40",
      tag: "Grandes valeurs France",
      base: 7420,
      comment:
        "Indice des grandes sociétés françaises. Sensible aux banques, au luxe et à l’industrie.",
      role:
        "Bloc d’exposition France. Souvent en complément d’un ETF monde plutôt qu’en cœur unique.",
      day: +0.18,
      series: {
        "1D": [7380, 7410, 7395, 7430, 7420],
        "1M": [7200, 7270, 7320, 7380, 7420],
        "1Y": [6600, 6950, 7120, 7300, 7420],
      },
    },
    msci: {
      name: "MSCI World",
      tag: "ETF monde développé",
      base: 322,
      comment:
        "Panier d’actions de pays développés. Produit classique d’investissement passif long terme.",
      role:
        "Candidat naturel pour un socle d’épargne programmée, si l’horizon est vraiment long.",
      day: +0.24,
      series: {
        "1D": [320.8, 321.5, 321.2, 322.4, 322.0],
        "1M": [311, 315, 318, 320, 322],
        "1Y": [280, 295, 305, 315, 322],
      },
    },
    btc: {
      name: "Bitcoin",
      tag: "Actif spéculatif",
      base: 68440,
      comment:
        "Actif très volatil, sans flux de dividendes. Peut servir de laboratoire de cycles, pas de base de retraite.",
      role:
        "Poche spéculative limitée (0–5 % du patrimoine), uniquement avec de l’argent que tu acceptes de voir fortement baisser.",
      day: +1.25,
      series: {
        "1D": [67500, 67900, 68200, 68700, 68440],
        "1M": [61000, 64000, 66000, 67500, 68440],
        "1Y": [23000, 35000, 47000, 59000, 68440],
      },
    },
    eth: {
      name: "Ethereum",
      tag: "Réseau / smart contracts",
      base: 3905,
      comment:
        "Token attaché à un réseau. Exposé à la DeFi et aux cycles crypto. Risque élevé, incertitude réglementaire.",
      role:
        "Poche expérimentale encore plus limitée que Bitcoin. Jamais sans base cash + ETF solide.",
      day: -0.8,
      series: {
        "1D": [3920, 3910, 3880, 3925, 3905],
        "1M": [3550, 3650, 3780, 3860, 3905],
        "1Y": [1600, 2200, 2800, 3400, 3905],
      },
    },
  };

  const ctx = document.getElementById("detail-chart").getContext("2d");
  const nameEl = document.getElementById("detail-name");
  const tagEl = document.getElementById("detail-tag");
  const commentEl = document.getElementById("detail-comment");
  const roleEl = document.getElementById("detail-role");
  const tfButtons = document.querySelectorAll(".tf-btn");

  let currentAsset = "sp500";
  let currentTf = "1M";

  function assignListValues() {
    Object.entries(ASSETS).forEach(([key, asset]) => {
      const valEl = document.querySelector(`[data-field="${key}-value"]`);
      const chEl = document.querySelector(`[data-field="${key}-change"]`);
      if (!valEl || !chEl) return;

      valEl.textContent = asset.base.toLocaleString("fr-FR", {
        maximumFractionDigits: key === "msci" ? 2 : 0,
      });

      chEl.textContent = `${asset.day.toFixed(2)} %`;
      chEl.classList.remove("positive", "negative");
      chEl.classList.add(asset.day >= 0 ? "positive" : "negative");
    });
  }

  function drawChart(assetKey, tf) {
    const asset = ASSETS[assetKey];
    if (!asset) return;

    const data = asset.series[tf];
    if (!data) return;

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // fond
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, "#020617");
    bgGrad.addColorStop(1, "#020617");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // grid horizontale
    ctx.strokeStyle = "rgba(63, 63, 70, 0.6)";
    ctx.lineWidth = 1;
    const lines = 4;
    for (let i = 1; i < lines; i++) {
      const y = (h / lines) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const paddingX = 30;
    const paddingY = 22;

    ctx.beginPath();
    data.forEach((v, i) => {
      const x =
        paddingX +
        ((w - paddingX * 2) * i) / Math.max(1, data.length - 1);
      const norm = (v - min) / span;
      const y = h - paddingY - norm * (h - paddingY * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    const first = data[0];
    const last = data[data.length - 1];
    const up = last >= first;

    const lineGrad = ctx.createLinearGradient(0, 0, w, 0);
    if (up) {
      lineGrad.addColorStop(0, "#22c55e");
      lineGrad.addColorStop(1, "#06b6d4");
    } else {
      lineGrad.addColorStop(0, "#fb7185");
      lineGrad.addColorStop(1, "#f97316");
    }

    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2;
    ctx.stroke();

    // area
    const areaGrad = ctx.createLinearGradient(0, paddingY, 0, h - paddingY);
    if (up) {
      areaGrad.addColorStop(0, "rgba(34,197,94,0.25)");
      areaGrad.addColorStop(1, "rgba(15,23,42,0)");
    } else {
      areaGrad.addColorStop(0, "rgba(248,113,113,0.25)");
      areaGrad.addColorStop(1, "rgba(15,23,42,0)");
    }
    ctx.lineTo(w - paddingX, h - paddingY);
    ctx.lineTo(paddingX, h - paddingY);
    ctx.closePath();
    ctx.fillStyle = areaGrad;
    ctx.fill();

    ctx.fillStyle = "#9ca3af";
    ctx.font = "11px system-ui";
    ctx.fillText(`Horizon ${tf} • maquette`, paddingX, paddingY - 6);
  }

  function updateDesk(assetKey, tf) {
    const asset = ASSETS[assetKey];
    if (!asset) return;

    currentAsset = assetKey;
    currentTf = tf;

    nameEl.textContent = asset.name;
    tagEl.textContent = asset.tag;
    commentEl.textContent = asset.comment;
    roleEl.textContent = asset.role;

    document.querySelectorAll(".asset-row").forEach((row) => {
      row.classList.toggle("active", row.dataset.asset === assetKey);
    });

    drawChart(assetKey, tf);
  }

  assignListValues();
  updateDesk(currentAsset, currentTf);

  document.querySelectorAll(".asset-row").forEach((row) => {
    row.addEventListener("click", () => {
      const key = row.dataset.asset;
      if (!key) return;
      updateDesk(key, currentTf);
    });
  });

  tfButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tf = btn.dataset.tf;
      if (!tf) return;
      tfButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      updateDesk(currentAsset, tf);
    });
  });

  const refreshBtn = document.getElementById("btn-refresh");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      // petite variation aléatoire sur la journée (pour le fun)
      Object.values(ASSETS).forEach((asset) => {
        const shift = (Math.random() * 1.6 - 0.8).toFixed(2);
        asset.day = parseFloat(shift);
      });
      assignListValues();
      drawChart(currentAsset, currentTf);
    });
  }

  /* QUESTIONS */
  const qTabs = document.querySelectorAll(".q-tab");
  const qContents = {
    "cash-etf": document.getElementById("q-cash-etf"),
    crypto: document.getElementById("q-crypto"),
    risque: document.getElementById("q-risque"),
    carriere: document.getElementById("q-carriere"),
  };

  qTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const key = tab.dataset.q;

      qTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      Object.keys(qContents).forEach((k) => {
        qContents[k].classList.toggle("active", k === key);
      });
    });
  });

  /* LAB / SCÉNARIOS */

  const horizonInput = document.getElementById("lab-horizon");
  const riskInput = document.getElementById("lab-risk");
  const liqInput = document.getElementById("lab-liq");
  const labRun = document.getElementById("lab-run");

  const horizonLabel = document.getElementById("lab-horizon-label");
  const riskLabel = document.getElementById("lab-risk-label");
  const liqLabel = document.getElementById("lab-liq-label");

  const labText = document.getElementById("lab-text");

  const barCash = document.getElementById("lab-cash");
  const barBonds = document.getElementById("lab-bonds");
  const barEquity = document.getElementById("lab-equity");
  const barSpec = document.getElementById("lab-spec");

  const pctCash = document.getElementById("lab-cash-pct");
  const pctBonds = document.getElementById("lab-bonds-pct");
  const pctEquity = document.getElementById("lab-equity-pct");
  const pctSpec = document.getElementById("lab-spec-pct");

  function refreshLabels() {
    horizonLabel.textContent =
      horizonInput.value === "1"
        ? "≤ 3 ans"
        : horizonInput.value === "2"
        ? "5–10 ans"
        : "10 ans et +";

    riskLabel.textContent =
      riskInput.value === "1"
        ? "Faible"
        : riskInput.value === "2"
        ? "Modérée"
        : "Élevée";

    liqLabel.textContent =
      liqInput.value === "1"
        ? "Rapide"
        : liqInput.value === "2"
        ? "Normal"
        : "Peu";
  }

  function runLab() {
    const h = Number(horizonInput.value);
    const r = Number(riskInput.value);
    const l = Number(liqInput.value);

    let cash = 25;
    let bonds = 35;
    let equity = 35;
    let spec = 5;

    if (h === 1) {
      cash += 15;
      equity -= 10;
      bonds -= 5;
    } else if (h === 3) {
      cash -= 10;
      equity += 10;
    }

    if (r === 1) {
      equity -= 10;
      bonds += 10;
    } else if (r === 3) {
      equity += 10;
      bonds -= 5;
      spec += 5;
    }

    if (l === 1) {
      cash += 10;
      equity -= 5;
      bonds -= 5;
    } else if (l === 3) {
      cash -= 5;
      equity += 5;
    }

    const total = cash + bonds + equity + spec;
    cash = Math.round((cash / total) * 100);
    bonds = Math.round((bonds / total) * 100);
    equity = Math.round((equity / total) * 100);
    spec = Math.max(0, 100 - cash - bonds - equity);

    barCash.style.width = `${cash}%`;
    barBonds.style.width = `${bonds}%`;
    barEquity.style.width = `${equity}%`;
    barSpec.style.width = `${spec}%`;

    pctCash.textContent = `${cash}%`;
    pctBonds.textContent = `${bonds}%`;
    pctEquity.textContent = `${equity}%`;
    pctSpec.textContent = `${spec}%`;

    let profile;
    if (h === 3 && r === 3 && l === 3) {
      profile =
        "Profil offensif long terme : forte poche actions, petite poche spéculative. Nécessite une vraie discipline mentale.";
    } else if (h === 1 && r === 1) {
      profile =
        "Profil prudent court terme : forte part de cash et obligations. Les actions restent marginales.";
    } else {
      profile =
        "Profil équilibré : base de cash et obligations, ETF monde au centre, spéculation limitée. Logique compatible avec un étudiant qui pense sur 5–10 ans.";
    }
    labText.textContent = profile;
  }

  [horizonInput, riskInput, liqInput].forEach((input) =>
    input.addEventListener("input", () => {
      refreshLabels();
    })
  );

  if (labRun) {
    labRun.addEventListener("click", () => {
      refreshLabels();
      runLab();
    });
  }

  refreshLabels();
  runLab();
});
