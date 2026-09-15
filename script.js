const STORAGE_KEY = "eczemaEntries";

let selectedSeverity = null;
let selectedItch = null;


/* =========================
   STUPNICE 1–10
========================= */

function setupScale(scaleId, callback) {
    const buttons = document.querySelectorAll(`#${scaleId} button`);

    buttons.forEach(button => {
        button.addEventListener("click", () => {

            buttons.forEach(btn => {
                btn.classList.remove("selected");
            });

            button.classList.add("selected");

            callback(Number(button.dataset.value));
        });
    });
}


setupScale("severityScale", value => {
    selectedSeverity = value;
});

setupScale("itchScale", value => {
    selectedItch = value;
});


/* =========================
   NAVIGACE
========================= */

const navButtons = document.querySelectorAll(".nav-button");
const pages = document.querySelectorAll(".page");

navButtons.forEach(button => {

    button.addEventListener("click", () => {

        const pageId = button.dataset.page;

        navButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        pages.forEach(page => {
            page.classList.remove("active");
        });

        button.classList.add("active");

        document.getElementById(pageId).classList.add("active");

        if (pageId === "history") {
            renderHistory();
        }
    });
});


/* =========================
   ULOŽENÍ ZÁZNAMU
========================= */

document.getElementById("saveButton").addEventListener("click", () => {

    if (!selectedSeverity || !selectedItch) {
        alert("Vyber prosím intenzitu ekzému a svědění.");
        return;
    }


    const locations = Array.from(
        document.querySelectorAll('input[name="location"]:checked')
    ).map(input => input.value);


    const triggers = Array.from(
        document.querySelectorAll('input[name="trigger"]:checked')
    ).map(input => input.value);


    const products = document
        .getElementById("products")
        .value
        .trim();


    const note = document
        .getElementById("note")
        .value
        .trim();


    const entry = {
        id: Date.now(),

        date: new Date().toISOString(),

        severity: selectedSeverity,

        itch: selectedItch,

        locations: locations,

        triggers: triggers,

        products: products,

        note: note
    };


    const entries = getEntries();

    entries.push(entry);

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(entries)
    );


    showSuccessMessage();

    resetForm();
});


/* =========================
   NAČTENÍ DAT
========================= */

function getEntries() {

    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
        return [];
    }

    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
}


/* =========================
   HISTORIE
========================= */

function renderHistory() {

    const historyList = document.getElementById("historyList");

    const entryCount = document.getElementById("entryCount");

    const entries = getEntries();


    entryCount.textContent = formatEntryCount(entries.length);


    if (entries.length === 0) {

        historyList.innerHTML = `
            <div class="empty-history">
                <h3>Zatím tu nic není</h3>
                <p>
                    Udělej svůj první dnešní záznam
                    a postupně tady začne vznikat tvoje historie.
                </p>
            </div>
        `;

        return;
    }


    entries.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });


    historyList.innerHTML = "";


    entries.forEach(entry => {

        const card = document.createElement("div");

        card.className = "history-card";


        const date = new Date(entry.date);


        const formattedDate = date.toLocaleDateString(
            "cs-CZ",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


        const formattedTime = date.toLocaleTimeString(
            "cs-CZ",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


        const locations = entry.locations || [];

        const triggers = entry.triggers || [];


        card.innerHTML = `

            <div class="history-top">

                <div>
                    <div class="history-date">
                        ${formattedDate}
                    </div>

                    <div class="history-time">
                        Uloženo v ${formattedTime}
                    </div>
                </div>

                <button
                    class="delete-button"
                    data-id="${entry.id}"
                >
                    Smazat
                </button>

            </div>


            <div class="stats">

                <div class="stat">

                    <div class="stat-label">
                        Intenzita kůže
                    </div>

                    <div class="stat-value">
                        ${entry.severity}/10
                    </div>

                </div>


                <div class="stat">

                    <div class="stat-label">
                        Svědění
                    </div>

                    <div class="stat-value">
                        ${entry.itch}/10
                    </div>

                </div>

            </div>


            ${
                locations.length > 0
                ? `
                    <div>
                        <strong>Místa</strong>

                        <div class="tags">
                            ${locations.map(location =>
                                `<span class="tag">${escapeHtml(location)}</span>`
                            ).join("")}
                        </div>
                    </div>
                `
                : ""
            }


            ${
                triggers.length > 0
                ? `
                    <div style="margin-top: 15px;">
                        <strong>Možné vlivy</strong>

                        <div class="tags">
                            ${triggers.map(trigger =>
                                `<span class="tag">${escapeHtml(trigger)}</span>`
                            ).join("")}
                        </div>
                    </div>
                `
                : ""
            }


            ${
                entry.products
                ? `
                    <div class="history-detail">

                        <strong>Produkty</strong>

                        <p>
                            ${escapeHtml(entry.products)}
                        </p>

                    </div>
                `
                : ""
            }


            ${
                entry.note
                ? `
                    <div class="history-detail">

                        <strong>Poznámka</strong>

                        <p>
                            ${escapeHtml(entry.note)}
                        </p>

                    </div>
                `
                : ""
            }

        `;


        const deleteButton = card.querySelector(".delete-button");


        deleteButton.addEventListener("click", () => {

            deleteEntry(entry.id);

        });


        historyList.appendChild(card);

    });
}


/* =========================
   SMAZÁNÍ
========================= */

function deleteEntry(id) {

    const confirmed = confirm(
        "Opravdu chceš tento záznam smazat?"
    );


    if (!confirmed) {
        return;
    }


    let entries = getEntries();


    entries = entries.filter(entry => {
        return entry.id !== id;
    });


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(entries)
    );


    renderHistory();
}


/* =========================
   RESET FORMULÁŘE
========================= */

function resetForm() {

    selectedSeverity = null;

    selectedItch = null;


    document.querySelectorAll(".scale button").forEach(button => {
        button.classList.remove("selected");
    });


    document.querySelectorAll(
        'input[type="checkbox"]'
    ).forEach(input => {
        input.checked = false;
    });


    document.getElementById("products").value = "";

    document.getElementById("note").value = "";
}


/* =========================
   HLÁŠKA PO ULOŽENÍ
========================= */

function showSuccessMessage() {

    const message = document.getElementById("successMessage");

    message.classList.add("show");


    setTimeout(() => {

        message.classList.remove("show");

    }, 3000);
}


/* =========================
   POČET ZÁZNAMŮ
========================= */

function formatEntryCount(count) {

    if (count === 0) {
        return "0 záznamů";
    }

    if (count === 1) {
        return "1 záznam";
    }

    if (count >= 2 && count <= 4) {
        return `${count} záznamy`;
    }

    return `${count} záznamů`;
}


/* =========================
   OCHRANA TEXTU
========================= */

function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}
