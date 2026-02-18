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
