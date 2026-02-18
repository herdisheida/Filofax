import prepopulation from "./data/prepopulation.json";  // get data

/* 
  types and models
*/

enum ContactType {
  Individual = "individual",
  Company = "company"
}
type Contact = IndividualContact | CompanyContact;

interface BaseContact {
  name: string;
  thumbnail: string;
  type: ContactType;

  id: string;
  isExpanded?: boolean;  // card expansion state
}

interface IndividualInfo {
  phoneNumber: string;
  title: string;
  email: string;
  address: string;
  website: string;
}


interface KeyContact { name: string; email: string; }

interface CompanyInfo {
  phoneNumber: string;
  industry: string;
  email: string;
  address: string;
  website: string;
  keyContacts: KeyContact[];
}

interface IndividualContact extends BaseContact {
  type: ContactType.Individual;
  info: IndividualInfo;
}

interface CompanyContact extends BaseContact {
  type: ContactType.Company;
  info: CompanyInfo;
}


/* 
  prepopulation types (matches JSON file)
*/
type PrepopIndividual = {
  type: "individual";
  name: string;
  phoneNumber: string;
  title: string;
  email: string;
  address: string;
  website: string;
};

type PrepopCompany = {
  type: "company";
  name: string;
  phoneNumber: string;
  industry: string;
  email: string;
  address: string;
  website: string;
  keyContacts: { name: string; email: string }[];
};

type PrepopData = {
  contacts: Array<PrepopIndividual | PrepopCompany>;
};


/* 
  normalise json data to Contact interface format
*/
function createInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  return parts.map(p => p[0]).join("").toUpperCase();
}

function normalizePrepopulation(data: PrepopData): Contact[] {
  return data.contacts.map((c, i) => {
    const base: BaseContact = {
      name: c.name,
      thumbnail: createInitials(c.name),
      type: c.type === "company" ? ContactType.Company : ContactType.Individual,

      id: `contact-${i}`,
      isExpanded: false,
    };

    if (c.type === "individual") {
      const individual: IndividualContact = {
        ...base,
        type: ContactType.Individual,
        info: {
          phoneNumber: c.phoneNumber,
          title: c.title,
          email: c.email,
          address: c.address,
          website: c.website,
        },
      };
      return individual;
    }

    // company
    const company: CompanyContact = {
      ...base,
      type: ContactType.Company,
      info: {
        phoneNumber: c.phoneNumber,
        industry: c.industry,
        email: c.email,
        address: c.address,
        website: c.website,

        // TODO umm á þetta að vera individual info? (en það er ekkert name né email þar?)
        keyContacts: c.keyContacts.map((kc) => ({
          name: kc.name,
          email: kc.email,
        })),
      },
    };

    return company;
  });
}




/* 
  local stoage
*/
function saveContacts(contacts: Contact[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

const STORAGE_KEY = "filofax_contacts";

function loadContacts(): Contact[] {
  const stored = localStorage.getItem(STORAGE_KEY);

  // already have data in localStorage
  if (stored) { return JSON.parse(stored) as Contact[]; }

  // save prepopulation data to localStorage
  const data = prepopulation as unknown as PrepopData;
  if (!data || !Array.isArray(data.contacts)) {
    throw new Error("prepopulation.json must be { contacts: [...] }");
  }

  const initial = normalizePrepopulation(data);
  saveContacts(initial);
  return initial;
}





/* 
  Rendering functions
*/
function renderApp(root: HTMLElement, contacts: Contact[]) {
  root.innerHTML = `
    <header class="page-header">
      ${renderHeader()}
    </header>

    <main>
      <section class="card-container">
        ${contacts.map(renderContactCard).join("")}
      </section>
    </main>
  `;
}

function renderHeader(): string {
  return `
    <h1>ADDRESS BOOK</h1>
    <p>
      You can see all stored contacts in the list seen below. Each contact is either an individual or a company account.
    </p>
  `;
}

function renderContactCard(contact: Contact): string {
  const subtitle = contact.type === ContactType.Individual ? contact.info.title : contact.info.industry;

  // get thumbnail (abbreviation of name)
  const thumbnail = contact.name.split(" ").map(n => n[0]).join("").toUpperCase();

  return `
    <article class="card" id="${contact.id}">
      <div class="thumb">${thumbnail}</div>

      <h2 class="name">${contact.name}</h2>
      <div class="subtitle">${subtitle}</div>

      ${contact.isExpanded ? `<div class="details">${renderDetails(contact)}</div>` : ""}

      <div class="icon-container">
        <span uk-icon="receiver"></span> 
        <span uk-icon="mail"></span>
        <span uk-icon="commenting"></span>
        <span uk-icon="calendar"></span>
      </div>

      <div class="chevron" data-action="toggle">
        ${contact.isExpanded ? "<span uk-icon=\"chevron-up\"></span>" : "<span uk-icon=\"chevron-down\"></span>"}
      </div>

    </article>
  `;
}

function renderDetails(contact: Contact): string {
  if (contact.type === ContactType.Individual) {
    const i = contact.info;
    return `
      <div class="detail-line">${i.phoneNumber}</div>
      <div class="detail-line">${i.email}</div>
      <div class="detail-line">${i.address}</div>
      <div class="detail-line">${i.website}</div>
    `;
  }

  const c = contact.info;
  return `
    <div class="detail-line">${c.phoneNumber}</div>
    <div class="detail-line">${c.email}</div>
    <div class="detail-line">${c.address}</div>
    <div class="detail-line">${c.website}</div>

    <div class="key-contacts">
      <h3>Key contacts</h3>
      <ul>
        ${c.keyContacts
          .map(
            (kc) => `
              <li>
                <span class="kc-name">${kc.name}</span>
                <span class="kc-email">&lt;${kc.email}&gt;</span>
              </li>
            `
          )
          .join("")}
      </ul>
    </div>
  `;
}




/*
  boot up
*/
function setupEvents(root: HTMLElement) {
  root.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    // onlly detect chevron toggle click
    const actionElem = target.closest<HTMLElement>("[data-action]");
    if (!actionElem) return;
    if (actionElem.dataset.action !== "toggle") return;

    // find the card element (that has the chevron-icon that was clicked)
    const cardElem = target.closest<HTMLElement>(".card");
    if (!cardElem) return;

    // get contact id
    const id = cardElem.id;
    if (!id) return;

    state = state.map((c) => (c.id === id ? { ...c, isExpanded: !c.isExpanded } : c));
    saveContacts(state);
    renderApp(root, state);
  });
}



const root = document.querySelector<HTMLDivElement>("#app");
if (!root) throw new Error("Missing #app");

let state: Contact[] = loadContacts();
renderApp(root, state);
setupEvents(root);