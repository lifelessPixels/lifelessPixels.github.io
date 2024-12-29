
let add_white = document.getElementById("add-white");
let add_black = document.getElementById("add-black");
let add_pasted_white = document.getElementById("add-pasted-white");
let add_pasted_black = document.getElementById("add-pasted-black");
let sample_white = document.getElementById("sample-white");
let sample_black = document.getElementById("sample-black");
let white_container = document.getElementById("cards-white");
let black_container = document.getElementById("cards-black");
let pasted_textarea = document.getElementById("pasted");
let focus_new = document.getElementById("focus-new");
let remove_all = document.getElementById("remove-all");

const cards_storage_key = "saved_cards";
let load_cards = () => JSON.parse(window.localStorage.getItem(cards_storage_key) ?? "{ \"white\": [], \"black\": [] }");
let save_cards = () => window.localStorage.setItem(cards_storage_key, JSON.stringify(cards));
let cards = load_cards();

let add_new_card = (type, text = null) => {
    let card_uuid = crypto.randomUUID();
    let card_object = {
        type: type,
        uuid: card_uuid,
        text: text ?? "Kliknij tu!"
    };

    cards[type].push(card_object);
    save_cards();
    return card_object;
};

let generate_card_node = (card_object) => {
    // create a clone of card
    let cloned_node = ((card_object.type == "white") ? sample_white : sample_black).cloneNode(true);

    // hook rigth click event
    cloned_node.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        if (confirm("Czy na pewno chcesz usunąć tę kartę?")) {
            cards[card_object.type].splice(cards[card_object.type].indexOf(card_object), 1);
            cloned_node.remove();
            save_cards();
        }
    });

    // set ID and text
    cloned_node.id = card_object.uuid;
    let text_node = cloned_node.querySelector(".card-text");
    text_node.innerText = card_object.text;

    // setup text changed handler
    text_node.addEventListener("input", () => {
        card_object.text = text_node.innerText;
        save_cards();
    });

    // append and return
    ((card_object.type == "white") ? white_container : black_container).appendChild(cloned_node);
    return cloned_node;
}

let add_card_button = (type) => {
    // check type
    if (type != "white" && type != "black")
        throw "invalid card type!";

    // generate a new card 
    let new_card = add_new_card(type);

    // generate node and append it to a container
    let added_node = generate_card_node(new_card);

    // focus new element
    if (focus_new.checked) {
        console.log("xddd");
        added_node.scrollIntoView({ block: "center" });

        let saved_outline = added_node.style.outline;
        added_node.style.outline = "2px solid red";
        setTimeout(() => {
            added_node.style.outline = saved_outline;
        }, 2500)
    }
}

let add_pasted_button = (type) => {
    // get text
    let text = pasted_textarea.value;
    let lines = text.split("\n").map(element => element.trim()).filter(element => element.length != 0)

    if (confirm("Czy na pewno chcesz dodać " + lines.length.toString() + (type == "white" ? "białych" : "czarnych") + " kart?")) {
        for (let entry of lines) {
            let card_object = add_new_card(type, entry);
            generate_card_node(card_object);
        }
    }
}


document.addEventListener("DOMContentLoaded", () => {
    // populate cards from save
    for (let white_card of cards.white)
        generate_card_node(white_card);

    for (let black_card of cards.black)
        generate_card_node(black_card);

    // add button event listeners
    add_white.addEventListener("click", () => add_card_button("white"));
    add_black.addEventListener("click", () => add_card_button("black"));
    add_pasted_white.addEventListener("click", () => add_pasted_button("white"));
    add_pasted_black.addEventListener("click", () => add_pasted_button("black"));
    remove_all.addEventListener("click", () => {
        if (confirm("Czy na pewno chcesz usunąć wszystkie karty? To działanie jest nieodwracalne!")) {
            cards = { white: [], black: [] };
            white_container.innerHTML = "";
            black_container.innerHTML = "";
            save_cards();
        }
    });
});

document.addEventListener("paste", function (e) {
    // cancel paste
    e.preventDefault();

    // get text representation of clipboard
    var text = (e.originalEvent || e).clipboardData.getData('text/plain');

    // insert text manually
    document.execCommand("insertHTML", false, text);
});
