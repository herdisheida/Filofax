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
  id: string;
  name: string;
  thumbnail: string;
  type: ContactType;
  isExpanded?: boolean;  // card expansion state
}

interface IndividualInfo {
  phone_number: string;
  title: string;
  email_address: string;
  address: string;
  website: string;
}

interface CompanyKeyContact {
  name: string;
  email_address: string;
}

interface CompanyInfo {
  phone_number: string;
  industry: string;
  email_address: string;
  address: string;
  website: string;
  key_contacts: CompanyKeyContact[];
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

  return `
    <article class="card" data-id="${contact.id}">
      <div class="thumb">${(contact.thumbnail)}</div>

      <h2 class="name">${(contact.name)}</h2>
      <div class="subtitle">${(subtitle)}</div>

      <div class="icon-container">
        <span uk-icon="receiver"></span> 
        <span uk-icon="mail"></span>
        <span uk-icon="commenting"></span>
        <span uk-icon="calendar"></span>
      </div>

      <button class="chevron" data-action="toggle" type="button" aria-label="Toggle details">
        ${contact.isExpanded ? "<span uk-icon=\"chevron-up\"></span>" : "<span uk-icon=\"chevron-down\"></span>"}
      </button>

      ${contact.isExpanded ? `<div class="details">${renderDetails(contact)}</div>` : ""}
    </article>
  `;
}

function renderDetails(contact: Contact): string {
  if (contact.type === ContactType.Individual) {
    const i = contact.info;
    return `
      <div class="detail-line">${(i.phone_number)}</div>
      <div class="detail-line">${(i.email_address)}</div>
      <div class="detail-line">${(i.address)}</div>
      <div class="detail-line">${(i.website)}</div>
    `;
  }

  const c = contact.info;
  return `
    <div class="detail-line">${(c.phone_number)}</div>
    <div class="detail-line">${(c.email_address)}</div>
    <div class="detail-line">${(c.address)}</div>
    <div class="detail-line">${(c.website)}</div>

    <div class="key-contacts">
      <h3>Key contacts</h3>
      <ul>
        ${c.key_contacts
          .map(
            (kc) => `
              <li>
                <span class="kc-name">${(kc.name)}</span>
                <span class="kc-email">&lt;${(kc.email_address)}&gt;</span>
              </li>
            `
          )
          .join("")}
      </ul>
    </div>
  `;
}




