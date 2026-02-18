interface Contact<contactType> {
  name: string;
  thumbnail: string;
  type: contactType;
  info: IndividualInfo | CompanyInfo;
}

interface IndividualInfo {
  phone_number: string;
  title: string;
  email_address: string;
  address: string;
  website: string;
}

interface CompanyInfo {
  phone_number: string;
  industry: string;
  email_address: string;
  address: string;
  website: string;
  key_contacts: IndividualInfo[];
}

enum ContactType {
  Individual, // 0
  Company, // 1
}
