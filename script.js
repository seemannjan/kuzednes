// -------------------------------------
// VÝBĚR ČÍSELNÉ ŠKÁLY
// -------------------------------------

function setupScale(scaleId, inputId) {

    const scale = document.getElementById(scaleId);
    const hiddenInput = document.getElementById(inputId);

    const buttons = scale.querySelectorAll("button");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            // odstraníme označení ze všech tlačítek
            buttons.forEach(btn => {
                btn.classList.remove("selected");
            });

            // označíme vybrané tlačítko
            button.classList.add("selected");

            // uložíme hodnotu
            hiddenInput.value = button.dataset.value;
        });

    });
}


setupScale("eczemaScale", "eczemaIntensity");
setupScale("itchScale", "itchIntensity");


// -------------------------------------
// ODESLÁNÍ FORMULÁŘE
// -------------------------------------

const form = document.getElementById("eczemaForm");
const successMessage = document.getElementById("successMessage");

form.addEventListener("submit", function(event) {

    event.preventDefault();


    // získání hodnot
    const eczemaIntensity =
        document.getElementById("eczemaIntensity").value;

    const itchIntensity =
        document.getElementById("itchIntensity").value;


    // kontrola základních údajů
    if (!eczemaIntensity || !itchIntensity) {

        alert("Vyber prosím intenzitu ekzému i svědění.");

        return;
    }


    // místa
    const locations = Array.from(
        document.querySelectorAll('input[name="locations"]:checked')
    ).map(input => input.value);


    // spouštěče
    const triggers = Array.from(
        document.querySelectorAll('input[name="triggers"]:checked')
    ).map(input => input.value);


    // ostatní údaje
    const products =
        document.getElementById("products").value;

    const note =
        document.getElementById("note").value;


    // vytvoření záznamu
    const entry = {

        date: new Date().toISOString(),

        eczemaIntensity: Number(eczemaIntensity),

        itchIntensity: Number(itchIntensity),

        locations: locations,

        triggers: triggers,

        products: products,

        note: note
    };


    // načtení předchozích záznamů
    const existingEntries =
        JSON.parse(localStorage.getItem("eczemaEntries")) || [];


    // přidání nového záznamu
    existingEntries.push(entry);


    // uložení zpět
    localStorage.setItem(
        "eczemaEntries",
        JSON.stringify(existingEntries)
    );


    // potvrzení
    successMessage.classList.add("show");


    // reset formuláře
    form.reset();


    // reset číselných škál
    document.querySelectorAll(".scale button").forEach(button => {
        button.classList.remove("selected");
    });

    document.getElementById("eczemaIntensity").value = "";
    document.getElementById("itchIntensity").value = "";


    // schovat hlášku po chvíli
    setTimeout(() => {
        successMessage.classList.remove("show");
    }, 3000);


    console.log("Uložený záznam:", entry);

});