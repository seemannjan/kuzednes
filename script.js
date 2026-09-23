const STORAGE_KEY = "eczemaEntries";

let selectedSeverity = null;
let selectedItch = null;
let editingEntryId = null;


// =========================
// SCALE
// =========================

function setupScale(scaleId, callback) {
  const scale = document.getElementById(scaleId);

  if (!scale) return;

  const buttons = scale.querySelectorAll("button");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      buttons.forEach(btn => btn.classList.remove("selected"));

      button.classList.add("selected");

      const value = Number(button.dataset.value);

      callback(value);
    });
  });
}


setupScale("severityScale", value => {
  selectedSeverity = value;

  document.getElementById("severityDescription").textContent =
    getScaleDescription(value, "severity");
});


setupScale("itchScale", value => {
  selectedItch = value;

  document.getElementById("itchDescription").textContent =
    getScaleDescription(value, "itch");
});


// =========================
// SCALE DESCRIPTIONS
// =========================

function getScaleDescription(value, type) {
  if (type === "severity") {
    if (value <= 2) return "Klidná kůže";
    if (value <= 4) return "Lehké potíže";
    if (value <= 6) return "Střední potíže";
    if (value <= 8) return "Silné potíže";
    return "Velmi silné potíže";
  }

  if (type === "itch") {
    if (value <= 2) return "Téměř nesvědí";
    if (value <= 4) return "Mírné svědění";
    if (value <= 6) return "Střední svědění";
    if (value <= 8) return "Silné svědění";
    return "Velmi silné svědění";
  }

  return "";
}


// =========================
// NAVIGATION
// =========================

const navButtons = document.querySelectorAll(
  ".nav-button, .bottom-nav-button"
);

const pages = document.querySelectorAll(".page");


navButtons.forEach(button => {

  button.addEventListener("click", () => {

    const pageId = button.dataset.page;


    // Odebrat active ze všech navigačních tlačítek
    navButtons.forEach(btn => {
      btn.classList.remove("active");
    });


    // Skrýt všechny stránky
    pages.forEach(page => {
      page.classList.remove("active");
    });


    // Aktivovat právě kliknuté tlačítko
    navButtons.forEach(btn => {

      if (btn.dataset.page === pageId) {
        btn.classList.add("active");
      }

    });


    // Zobrazit stránku
    const page =
      document.getElementById(pageId);

    if (page) {
      page.classList.add("active");
    }


    // Aktualizovat obsah podle stránky
    if (pageId === "history") {
      renderHistory();
    }


    if (pageId === "overview") {
      renderOverview();
    }


    if (pageId === "new-entry") {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }

  });

});

// =========================
// STORAGE
// =========================

function getEntries() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    return [];
  }

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Nepodařilo se načíst záznamy:", error);
    return [];
  }
}


function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}


// =========================
// SAVE / EDIT
// =========================

const saveButton = document.getElementById("saveButton");


saveButton.addEventListener("click", () => {
  if (!selectedSeverity || !selectedItch) {
    alert("Vyber prosím intenzitu ekzému i svědění.");
    return;
  }

  const entryDate = document.getElementById("entryDate").value;

  if (!entryDate) {
    alert("Vyber prosím datum záznamu.");
    return;
  }

  const locations = Array.from(
    document.querySelectorAll('input[name="location"]:checked')
  ).map(input => input.value);

  const triggers = Array.from(
    document.querySelectorAll('input[name="trigger"]:checked')
  ).map(input => input.value);

  const products = document.getElementById("products").value.trim();
  const note = document.getElementById("note").value.trim();

  const entries = getEntries();


  // =========================
  // EDIT EXISTING ENTRY
  // =========================

  if (editingEntryId !== null) {
    const entryIndex = entries.findIndex(
      entry => entry.id === editingEntryId
    );

    if (entryIndex !== -1) {
      entries[entryIndex] = {
        ...entries[entryIndex],
        recordDate: entryDate,
        severity: selectedSeverity,
        itch: selectedItch,
        locations,
        triggers,
        products,
        note,
        updatedAt: new Date().toISOString()
      };

      saveEntries(entries);

      renderHome();

      showSuccessMessage("Záznam byl upraven.");

      resetForm();

      document
        .querySelector('[data-page="history"]')
        .click();

      return;
    }
  }


  // =========================
  // CREATE NEW ENTRY
  // =========================

  const newEntry = {
    id: Date.now(),
    date: new Date().toISOString(),
    recordDate: entryDate,
    severity: selectedSeverity,
    itch: selectedItch,
    locations,
    triggers,
    products,
    note
  };

  entries.push(newEntry);

  saveEntries(entries);

  renderHome();

  showSuccessMessage("Záznam byl uložen.");

  resetForm();
});


// =========================
// CANCEL EDIT
// =========================

const cancelEditButton =
  document.getElementById("cancelEditButton");

if (cancelEditButton) {
  cancelEditButton.addEventListener("click", () => {
    resetForm();

    document
      .querySelector('[data-page="history"]')
      .click();
  });
}


// =========================
// EDIT ENTRY
// =========================

function editEntry(id) {
  const entries = getEntries();

  const entry = entries.find(item => item.id === id);

  if (!entry) {
    return;
  }

  editingEntryId = id;


  // Datum
  document.getElementById("entryDate").value =
    getRecordDate(entry);


  // Severity
  selectedSeverity = entry.severity;

  const severityButtons =
    document.querySelectorAll("#severityScale button");

  severityButtons.forEach(button => {
    button.classList.toggle(
      "selected",
      Number(button.dataset.value) === entry.severity
    );
  });

  document.getElementById("severityDescription").textContent =
    getScaleDescription(entry.severity, "severity");


  // Itch
  selectedItch = entry.itch;

  const itchButtons =
    document.querySelectorAll("#itchScale button");

  itchButtons.forEach(button => {
    button.classList.toggle(
      "selected",
      Number(button.dataset.value) === entry.itch
    );
  });

  document.getElementById("itchDescription").textContent =
    getScaleDescription(entry.itch, "itch");


  // Locations
  document
    .querySelectorAll('input[name="location"]')
    .forEach(input => {
      input.checked =
        entry.locations?.includes(input.value) || false;
    });


  // Triggers
  document
    .querySelectorAll('input[name="trigger"]')
    .forEach(input => {
      input.checked =
        entry.triggers?.includes(input.value) || false;
    });


  // Products + note
  document.getElementById("products").value =
    entry.products || "";

  document.getElementById("note").value =
    entry.note || "";


  // Změna tlačítka
  saveButton.textContent = "Uložit změny";


  // Zobrazení horní lišty
  const editModeBar =
    document.getElementById("editModeBar");

  if (editModeBar) {
    editModeBar.style.display = "block";
  }


  // Přepnutí na formulář
  document
    .querySelector('[data-page="new-entry"]')
    .click();


  // Scroll nahoru
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// =========================
// HISTORY
// =========================

function renderHistory() {
  const entries = getEntries();

  const historyList =
    document.getElementById("historyList");

  const entryCount =
    document.getElementById("entryCount");


  entryCount.textContent =
    formatEntryCount(entries.length);


  if (entries.length === 0) {
    historyList.innerHTML = `
      <div class="card">
        <p>Zatím nemáš žádné záznamy.</p>
      </div>
    `;

    return;
  }


  const sortedEntries = [...entries].sort((a, b) => {
    const dateA = getRecordDate(a);
    const dateB = getRecordDate(b);

    return dateB.localeCompare(dateA);
  });


  historyList.innerHTML = sortedEntries.map(entry => {
    const locations = entry.locations || [];
    const triggers = entry.triggers || [];

    return `
      <div class="card history-entry">

        <div class="history-entry-header">

          <div>
            <h3>${formatDate(getRecordDate(entry))}</h3>
          </div>

          <div class="history-actions">

            <button
              type="button"
              class="edit-button"
              onclick="editEntry(${entry.id})"
            >
              Upravit
            </button>

            <button
              type="button"
              class="delete-button"
              onclick="deleteEntry(${entry.id})"
            >
              Smazat
            </button>

          </div>

        </div>


        <div class="history-scores">

          <div>
            <strong>Ekzém:</strong>
            ${entry.severity}/10
          </div>

          <div>
            <strong>Svědění:</strong>
            ${entry.itch}/10
          </div>

        </div>


        ${
          locations.length > 0
            ? `
              <div class="history-section">
                <strong>Místa:</strong>

                <div class="tags">
                  ${locations.map(location =>
                    `<span class="tag">
                      ${escapeHtml(location)}
                    </span>`
                  ).join("")}
                </div>

              </div>
            `
            : ""
        }


        ${
          triggers.length > 0
            ? `
              <div class="history-section">
                <strong>Spouštěče:</strong>

                <div class="tags">
                  ${triggers.map(trigger =>
                    `<span class="tag">
                      ${escapeHtml(trigger)}
                    </span>`
                  ).join("")}
                </div>

              </div>
            `
            : ""
        }


        ${
          entry.products
            ? `
              <div class="history-section">
                <strong>Produkty:</strong>
                <p>${escapeHtml(entry.products)}</p>
              </div>
            `
            : ""
        }


        ${
          entry.note
            ? `
              <div class="history-section">
                <strong>Poznámka:</strong>
                <p>${escapeHtml(entry.note)}</p>
              </div>
            `
            : ""
        }

      </div>
    `;
  }).join("");
}


// =========================
// DELETE ENTRY
// =========================

function deleteEntry(id) {
  const confirmed = confirm(
    "Opravdu chceš tento záznam smazat?"
  );

  if (!confirmed) {
    return;
  }

  const entries = getEntries();

  const filteredEntries = entries.filter(
    entry => entry.id !== id
  );

  saveEntries(filteredEntries);

  renderHistory();
  renderHome();
}


// =========================
// RESET FORM
// =========================

function resetForm() {
  selectedSeverity = null;
  selectedItch = null;
  editingEntryId = null;


  // Scales
  document
    .querySelectorAll(".scale button")
    .forEach(button => {
      button.classList.remove("selected");
    });


  // Descriptions
  document.getElementById("severityDescription").textContent = "";
  document.getElementById("itchDescription").textContent = "";


  // Checkboxes
  document
    .querySelectorAll('input[type="checkbox"]')
    .forEach(input => {
      input.checked = false;
    });


  // Text
  document.getElementById("products").value = "";
  document.getElementById("note").value = "";


  // Datum
  setTodayDate();


  // Save button
  saveButton.textContent = "Uložit dnešní záznam";


  // Edit mode bar
  const editModeBar =
    document.getElementById("editModeBar");

  if (editModeBar) {
    editModeBar.style.display = "none";
  }
}


// =========================
// SUCCESS MESSAGE
// =========================

function showSuccessMessage(message) {
  const successMessage =
    document.getElementById("successMessage");

  successMessage.textContent = message;
  successMessage.style.display = "block";

  setTimeout(() => {
    successMessage.style.display = "none";
  }, 3000);
}


// =========================
// DATE
// =========================

function setTodayDate() {
  const dateInput =
    document.getElementById("entryDate");

  if (!dateInput) return;

  const today = new Date();

  const year =
    today.getFullYear();

  const month =
    String(today.getMonth() + 1).padStart(2, "0");

  const day =
    String(today.getDate()).padStart(2, "0");

  dateInput.value =
    `${year}-${month}-${day}`;
}


function getRecordDate(entry) {

  // Novější záznamy
  if (entry.recordDate) {
    return entry.recordDate;
  }

  // Starší záznamy z V4.1
  if (entry.date) {
    const date =
      new Date(entry.date);

    const year =
      date.getFullYear();

    const month =
      String(date.getMonth() + 1).padStart(2, "0");

    const day =
      String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  return "";
}


function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  const parts =
    dateString.split("-");

  if (parts.length !== 3) {
    return dateString;
  }

  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}


// =========================
// ENTRY COUNT
// =========================

function formatEntryCount(count) {
  if (count === 1) {
    return "1 záznam";
  }

  if (count >= 2 && count <= 4) {
    return `${count} záznamy`;
  }

  return `${count} záznamů`;
}


// =========================
// OVERVIEW
// =========================

let overviewPeriod = 7;

function getOverviewEntries() {
  const entries = getEntries();

  if (overviewPeriod === "all") {
    return entries;
  }

  const now = new Date();
  const limit = new Date();

  limit.setDate(now.getDate() - overviewPeriod);

  return entries.filter((entry) => {
    const entryDate = new Date(entry.recordDate || entry.date);

    return entryDate >= limit;
  });
}

function renderOverview() {
  const entries = getOverviewEntries();

  const averageSeverity =
    document.getElementById("averageSeverity");

  const averageItch =
    document.getElementById("averageItch");

  const totalEntries =
    document.getElementById("totalEntries");


  totalEntries.textContent =
    entries.length;


  if (entries.length === 0) {

    averageSeverity.textContent = "–";
    averageItch.textContent = "–";

    averageSeverity.style.color = "";
    averageItch.style.color = "";

  document.getElementById("averageSeverityDescription").textContent = "—";

  document.getElementById("averageItchDescription").textContent = "—";

  document.getElementById("severityProgress").style.width = "0%";

  document.getElementById("itchProgress").style.width = "0%";

    renderChart([]);

    document.getElementById("locationsOverview").innerHTML =
      "<p>Zatím nejsou žádná data.</p>";

    document.getElementById("triggersOverview").innerHTML =
      "<p>Zatím nejsou žádná data.</p>";
      
    document.getElementById("triggerInsights").innerHTML =
     "<p>Zatím nejsou žádná data.</p>";
    return;
  }


  const severityAverage =
    entries.reduce(
      (sum, entry) =>
        sum + Number(entry.severity || 0),
      0
    ) / entries.length;


  const itchAverage =
    entries.reduce(
      (sum, entry) =>
        sum + Number(entry.itch || 0),
      0
    ) / entries.length;


  averageSeverity.textContent =
  severityAverage.toFixed(1);

averageItch.textContent =
  itchAverage.toFixed(1);


const averageSeverityDescription =
  document.getElementById(
    "averageSeverityDescription"
  );

const averageItchDescription =
  document.getElementById(
    "averageItchDescription"
  );

const severityProgress =
  document.getElementById(
    "severityProgress"
  );

const itchProgress =
  document.getElementById(
    "itchProgress"
  );


if (averageSeverityDescription) {
  averageSeverityDescription.textContent =
    getSeverityDescription(severityAverage);
}

if (averageItchDescription) {
  averageItchDescription.textContent =
    getItchDescription(itchAverage);
}

averageSeverity.style.color =
  getOverviewLevelColor(severityAverage);

averageItch.style.color =
  getOverviewLevelColor(itchAverage);

if (severityProgress) {

  severityProgress.style.width =
    `${severityAverage * 10}%`;

  severityProgress.style.backgroundColor =
    getOverviewLevelColor(severityAverage);
}

if (itchProgress) {

  itchProgress.style.width =
    `${itchAverage * 10}%`;

  itchProgress.style.backgroundColor =
    getOverviewLevelColor(itchAverage);
}


  // =========================
  // LOCATIONS
  // =========================

  const locationCounts =
    countValues(
      entries.flatMap(
        entry => entry.locations || []
      )
    );


  renderOverviewList(
    "locationsOverview",
    locationCounts
  );


  // =========================
  // TRIGGERS
  // =========================

  const triggerCounts =
    countValues(
      entries.flatMap(
        entry => entry.triggers || []
      )
    );


  renderOverviewList(
    "triggersOverview",
    triggerCounts
  );

  // =========================
  // CHART
  // =========================

  const sortedEntries =
    [...entries].sort((a, b) => {
      return getRecordDate(a).localeCompare(
        getRecordDate(b)
      );
    });


  const lastEntries =
    sortedEntries.slice(-7);


  renderChart(sortedEntries);
  renderTriggerInsights(entries);
}

const overviewFilterButtons = document.querySelectorAll(
  ".overview-filter-button"
);

overviewFilterButtons.forEach((button) => {

  button.addEventListener("click", () => {

    overviewFilterButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    const period = button.dataset.period;

    overviewPeriod =
      period === "all"
        ? "all"
        : Number(period);

    renderOverview();
  });

});

// =========================
// OVERVIEW DESCRIPTIONS
// =========================

function getSeverityDescription(value) {

  if (value <= 2) {
    return "Klidná kůže";
  }

  if (value <= 4) {
    return "Lehké potíže";
  }

  if (value <= 6) {
    return "Střední potíže";
  }

  if (value <= 8) {
    return "Silné potíže";
  }

  return "Velmi silné potíže";
}


function getItchDescription(value) {

  if (value <= 2) {
    return "Téměř nesvědí";
  }

  if (value <= 4) {
    return "Mírné svědění";
  }

  if (value <= 6) {
    return "Střední svědění";
  }

  if (value <= 8) {
    return "Silné svědění";
  }

  return "Velmi silné svědění";
}

function getOverviewLevelColor(value) {

  if (value <= 4) {
    return "#2f7d5b";
  }

  if (value <= 6) {
    return "#d6a13a";
  }

  return "#c95a5a";
}

// =========================
// COUNT VALUES
// =========================

function countValues(values) {
  const counts = {};

  values.forEach(value => {

    if (!counts[value]) {
      counts[value] = 0;
    }

    counts[value]++;
  });


  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1]);
}


// =========================
// OVERVIEW LIST
// =========================

function renderOverviewList(elementId, values) {
  const element =
    document.getElementById(elementId);


  if (!values.length) {
    element.innerHTML =
      "<p>Zatím nejsou žádná data.</p>";

    return;
  }


  element.innerHTML =
    values
      .slice(0, 5)
      .map(([name, count]) => `
        <div class="overview-list-item">
          <span>${escapeHtml(name)}</span>
          <strong>${count}×</strong>
        </div>
      `)
      .join("");
}


// =========================
// CHART (Chart.js)
// =========================

let skinChart = null;

function renderChart(entries) {

  const canvas = document.getElementById("skinChart");

  if (!canvas) {
    return;
  }

  const labels = entries.map(
    entry => formatDate(getRecordDate(entry))
  );

  const severityData = entries.map(
    entry => Number(entry.severity)
  );

  const itchData = entries.map(
    entry => Number(entry.itch)
  );


  // Málo bodů = ukázat je zřetelně, hodně bodů = spíš plynulá čára
  const pointRadius = entries.length > 20 ? 0 : 3;


  if (skinChart) {
    skinChart.data.labels = labels;
    skinChart.data.datasets[0].data = severityData;
    skinChart.data.datasets[1].data = itchData;
    skinChart.data.datasets[0].pointRadius = pointRadius;
    skinChart.data.datasets[1].pointRadius = pointRadius;
    skinChart.update();
    return;
  }

  if (typeof Chart === "undefined") {
    return;
  }

  skinChart = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Intenzita",
          data: severityData,
          borderColor: "#2f7d5b",
          backgroundColor: "rgba(47, 125, 91, 0.10)",
          borderWidth: 2,
          tension: 0.3,
          fill: true,
          pointRadius,
          pointHoverRadius: 5,
          pointBackgroundColor: "#2f7d5b"
        },
        {
          label: "Svědění",
          data: itchData,
          borderColor: "#b34b4b",
          backgroundColor: "rgba(179, 75, 75, 0.08)",
          borderWidth: 2,
          tension: 0.3,
          fill: true,
          pointRadius,
          pointHoverRadius: 5,
          pointBackgroundColor: "#b34b4b"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false
      },
      scales: {
        y: {
          min: 0,
          max: 10,
          ticks: {
            stepSize: 2,
            color: "#929c96",
            font: { size: 10 }
          },
          grid: { color: "#e7ebe8" }
        },
        x: {
          ticks: {
            color: "#929c96",
            font: { size: 10 },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 8
          },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#2c332e",
          padding: 10,
          titleFont: { size: 11 },
          bodyFont: { size: 11 },
          callbacks: {
            label: context =>
              `${context.dataset.label}: ${context.formattedValue}/10`
          }
        }
      }
    }
  });
}


// =========================
// TRIGGER INSIGHTS
// =========================

function renderTriggerInsights(entries) {

  const container =
    document.getElementById("triggerInsights");

  if (!container) {
    return;
  }

  const triggerData = {};

  entries.forEach(entry => {

    const triggers = entry.triggers || [];

    triggers.forEach(trigger => {

      if (!triggerData[trigger]) {
        triggerData[trigger] = {
          count: 0,
          severityTotal: 0,
          itchTotal: 0
        };
      }

      triggerData[trigger].count += 1;

      triggerData[trigger].severityTotal +=
        Number(entry.severity) || 0;

      triggerData[trigger].itchTotal +=
        Number(entry.itch) || 0;
    });

  });

  const insights =
    Object.entries(triggerData)
      .map(([trigger, data]) => {

        return {
          trigger,
          count: data.count,
          averageSeverity:
            data.severityTotal / data.count,
          averageItch:
            data.itchTotal / data.count
        };

      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);


  if (insights.length === 0) {

    container.innerHTML = `
      <div class="trigger-insights-empty">
        Zatím nemáš dost údajů o spouštěčích.
      </div>
    `;

    return;
  }


  container.innerHTML =
    insights.map(insight => {

      return `
        <div class="trigger-insight">

          <div class="trigger-insight-header">

            <span class="trigger-insight-name">
              ${escapeHtml(insight.trigger)}
            </span>

            <span class="trigger-insight-count">
              ${insight.count}×
            </span>

          </div>


          <div class="trigger-insight-stats">

            <div class="trigger-metric">

              <span class="trigger-metric-label">
                Intenzita
              </span>

              <strong class="trigger-metric-value">
                ${insight.averageSeverity.toFixed(1)}
                <span>/ 10</span>
              </strong>

            </div>


            <div class="trigger-metric">

              <span class="trigger-metric-label">
                Svědění
              </span>

              <strong class="trigger-metric-value">
                ${insight.averageItch.toFixed(1)}
                <span>/ 10</span>
              </strong>

            </div>

          </div>

        </div>
      `;

    }).join("");
}


// =========================
// ESCAPE HTML
// =========================

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// =========================
// START
// =========================

setTodayDate();

const editModeBar = document.getElementById("editModeBar");

if (editModeBar) {
  editModeBar.style.display = "none";
}

// =========================
// HOME
// =========================

function renderHome() {

  const recentEntries =
    document.getElementById("homeRecentEntries");

  const mainMessage =
    document.getElementById("homeMainMessage");

  const subMessage =
    document.getElementById("homeSubMessage");

  if (!recentEntries) {
    return;
  }


  const entries = getEntries();


  // =========================
  // HLAVNÍ ZPRÁVA
  // =========================

  if (entries.length === 0) {

    if (mainMessage) {
      mainMessage.textContent =
        "Jak se dnes má tvoje kůže?";
    }

    if (subMessage) {
      subMessage.textContent =
        "Udělej si první krátký záznam a postupně poznáš, co na tvoji kůži působí.";
    }

  } else {

    const sortedEntries =
      [...entries].sort((a, b) => {
        return getRecordDate(b).localeCompare(
          getRecordDate(a)
        );
      });


    const latestEntry =
      sortedEntries[0];


    const severity =
      Number(latestEntry.severity || 0);


    if (severity <= 2) {

      if (mainMessage) {
        mainMessage.textContent =
          "Dnes to vypadá klidně.";
      }

      if (subMessage) {
        subMessage.textContent =
          "Poslední záznam ukazuje jen mírné potíže. Pokračuj ve sledování své kůže.";
      }

    } else if (severity <= 4) {

      if (mainMessage) {
        mainMessage.textContent =
          "Tvoje kůže je dnes celkem v klidu.";
      }

      if (subMessage) {
        subMessage.textContent =
          "Poslední záznam ukazuje lehké potíže. Uvidíme, jak se bude kůže vyvíjet dál.";
      }

    } else if (severity <= 6) {

      if (mainMessage) {
        mainMessage.textContent =
          "Tvoje kůže dnes potřebuje pozornost.";
      }

      if (subMessage) {
        subMessage.textContent =
          "Poslední záznam ukazuje střední potíže. Zkus sledovat, co se v posledních dnech změnilo.";
      }

    } else if (severity <= 8) {

      if (mainMessage) {
        mainMessage.textContent =
          "Dnes to nevypadá úplně klidně.";
      }

      if (subMessage) {
        subMessage.textContent =
          "Poslední záznam ukazuje výraznější potíže. Sleduj, jak se bude tvoje kůže vyvíjet.";
      }

    } else {

      if (mainMessage) {
        mainMessage.textContent =
          "Tvoje kůže dnes potřebuje větší pozornost.";
      }

      if (subMessage) {
        subMessage.textContent =
          "Poslední záznam ukazuje velmi silné potíže. Pokračuj ve sledování vývoje.";
      }
    }
  }


  // =========================
  // POSLEDNÍ ZÁZNAMY
  // =========================

  const sortedEntries =
    [...entries].sort((a, b) => {
      return getRecordDate(b).localeCompare(
        getRecordDate(a)
      );
    });


  const latestEntries =
    sortedEntries.slice(0, 3);


  // Žádné záznamy

  if (latestEntries.length === 0) {

    recentEntries.innerHTML = `
      <div class="home-empty">
        <p>
          Zatím nemáš žádné záznamy.
        </p>

        <p>
          Přidej svůj první dnešní záznam.
        </p>
      </div>
    `;

    return;
  }


  // Poslední záznamy

  recentEntries.innerHTML =
    latestEntries.map(entry => {

      return `
        <div class="home-entry-card">

          <div>

            <div class="home-entry-date">
              ${formatDate(getRecordDate(entry))}
            </div>

            <div class="home-entry-info">

              <span>
                Ekzém ${entry.severity}/10
              </span>

              <span>
                Svědění ${entry.itch}/10
              </span>

            </div>

          </div>

          <div class="home-entry-score">
            ${entry.severity}/10
          </div>

        </div>
      `;

    }).join("");

  renderReminder();
}


const homeHistoryButton =
  document.getElementById("homeHistoryButton");

if (homeHistoryButton) {

  homeHistoryButton.addEventListener("click", () => {

    document
      .querySelector('[data-page="history"]')
      .click();

  });

}


// =========================
// PŘIPOMÍNKA DNEŠNÍHO ZÁZNAMU
// =========================

function renderReminder() {
  const reminder =
    document.getElementById("homeReminder");

  if (!reminder) return;

  const entries = getEntries();

  const today = new Date();

  const todayString =
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const hasTodayEntry = entries.some(
    entry => getRecordDate(entry) === todayString
  );

  reminder.classList.toggle("visible", !hasTodayEntry);
}

const homeReminderEl = document.getElementById("homeReminder");

if (homeReminderEl) {
  homeReminderEl.addEventListener("click", () => {
    document.querySelector('[data-page="new-entry"]').click();
  });
}

// =========================
// PWA SERVICE WORKER
// =========================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('ServiceWorker běží (scope:', registration.scope, ')');
      })
      .catch(error => {
        console.log('ServiceWorker registrace selhala:', error);
      });
  });
}

// První vykreslení Home
renderHome();

