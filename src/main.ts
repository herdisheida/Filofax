import prepopulation from "./data/prepopulation.json"; // get data

/* 
  types and models
*/

enum ContactType {
  Individual = "individual",
  Company = "company",
}
type Contact = IndividualContact | CompanyContact;

interface BaseContact {
  name: string;
  thumbnail: string;
  type: ContactType;

  id: string;
  isExpanded?: boolean; // card expansion state
}

interface IndividualInfo {
  phoneNumber: string;
  title: string;
  email: string;
  address: string;
  website: string;
}

interface KeyContact {
  name: string;
  email: string;
}

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
  return parts
    .map((p) => p[0])
    .join("")
    .toUpperCase();
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
  if (stored) {
    return JSON.parse(stored) as Contact[];
  }

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
      <section class="card-container uk-text-center">
        ${contacts.map(renderContactCard).join("")}
      </section>
    </main>
  `;
}

function renderHeader(): string {
  return `
    <h1 class="uk-text-bold spartan-font">ADDRESS BOOK</h1>
    <p class="baskerville-font">
      You can see all stored contacts in the list seen below. Each contact is either an individual or a company account.
    </p>
  `;
}

function renderContactCard(contact: Contact): string {
  const subtitle =
    contact.type === ContactType.Individual
      ? contact.info.title
      : contact.info.industry;

  return `
    <div class="card uk-card uk-card-default uk-card-body" id="${contact.id}">
      
      <div class="thumbnail-container uk-border-circle">
        <div class="thumb uk-text-bold spartan-font">${contact.thumbnail}</div>
      </div>

      <h4 class="name uk-text-bold">${contact.name}</h4>
      <div class="subtitle baskerville-font">${subtitle}</div>

      ${contact.isExpanded ? `<div class="details uk-text-light">${renderDetails(contact)}</div>` : ""}

      <div class="icon-container">
        <div class="uk-label uk-border-rounded"><span uk-icon="receiver"></span></div>
        <div class="uk-label uk-border-rounded"><span uk-icon="mail"></span></div>
        <div class="uk-label uk-border-rounded"><span uk-icon="commenting"></span></div>
        <div class="uk-label uk-border-rounded"><span uk-icon="calendar"></span></div>
      </div>

      <div class="chevron" data-action="toggle">
        ${contact.isExpanded ? '<span uk-icon="chevron-up"></span>' : '<span uk-icon="chevron-down"></span>'}
      </div>

    </div>
  `;
}

function renderDetails(contact: Contact): string {
  if (contact.type === ContactType.Individual) {
    const i = contact.info;
    return `
      <div class="detail-line baskerville-font">${i.phoneNumber}</div>
      <div class="detail-line baskerville-font" style="text-decoration: underline;">${i.email}</div>
      <div class="detail-line baskerville-font">${i.address}</div>
      <div class="detail-line baskerville-font" style="text-decoration: underline;">${i.website}</div>
    `;
  }

  const c = contact.info;
  return `
    <div class="detail-line baskerville-font">${c.phoneNumber}</div>
    <div class="detail-line baskerville-font" style="text-decoration: underline;">${c.email}</div>
    <div class="detail-line baskerville-font">${c.address}</div>
    <div class="detail-line baskerville-font" style="text-decoration: underline;">${c.website}</div>

    <div class="key-contacts">
      <div class="key-contacts-title uk-text-bold uk-text-secondary spartan-font">Key contacts</div><br>
        ${c.keyContacts
          .map(
            (kc) => `
                <span class="kc-name detail-line baskerville-font">${kc.name}</span><br>
                <span class="kc-email detail-line baskerville-font">&lt;${kc.email}&gt;</span><br><br>
            `,
          )
          .join("")}
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

    state = state.map((c) =>
      c.id === id ? { ...c, isExpanded: !c.isExpanded } : c,
    );
    saveContacts(state);
    renderApp(root, state);
  });
}

let state: Contact[] = [];
document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector<HTMLDivElement>("#app");
  if (!root) throw new Error("Missing #app");

  state = loadContacts();
  renderApp(root, state);
  setupEvents(root);
});
