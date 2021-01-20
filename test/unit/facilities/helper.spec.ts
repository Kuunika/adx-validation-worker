import { expect } from "chai";
import { getFacilityCode } from "../../../src/modules/facilities/facilities.cache";
import { getDHIS2OUCode } from "../../../src/modules/facilities/helpers";
import { Facility } from "../../../src/modules/facilities/facility.interface";

const fake: Facility = {
  facility_code: "LL040007",
  facility_code_dhis2: null,
  facility_code_openlmis: null,
  facility_code_mapping: [
    {
      url: "https://dhis2.health.gov.mw/api/organisationUnits/zYfP0gkHRJH.json",
      code: "zYfP0gkHRJH",
      system: "DHIS2",
    },
    {
      url: "https://lmis.health.gov.mw",
      code: "LL4040",
      system: "OpenLMIS",
    },
    {
      url: "https://lmis.health.gov.mw",
      code: "LL4040",
      system: "OpenLMIS",
    },
    {
      url: "https://www.hiv.health.gov.mw/",
      code: "702",
      system: "DHAMIS",
    },
  ],
  registration_number: "MCM/C/94",
  facility_name: "ABC Comm. Hospital",
  common_name: "ABC Clinic",
  facility_date_opened: "1975-01-01T00:00:00.000Z",
  facility_type_id: 7,
  facility_owner_id: 1,
  facility_operational_status_id: 1,
  facility_regulatory_status_id: 1,
  district_id: 4,
  client_id: 1,
  archived_date: null,
  published_date: "2019-06-25T14:40:41.000Z",
  created_at: "2020-03-26T07:52:28.000Z",
  updated_at: "2020-03-26T07:47:05.000Z",
  id: 7,
};

const fakeWithoutOUCode: Facility = {
  facility_code: "LL040007",
  facility_code_dhis2: null,
  facility_code_openlmis: null,
  facility_code_mapping: [
    {
      url: "https://lmis.health.gov.mw",
      code: "LL4040",
      system: "OpenLMIS",
    },
    {
      url: "https://lmis.health.gov.mw",
      code: "LL4040",
      system: "OpenLMIS",
    },
    {
      url: "https://www.hiv.health.gov.mw/",
      code: "702",
      system: "DHAMIS",
    },
  ],
  registration_number: "MCM/C/94",
  facility_name: "ABC Comm. Hospital",
  common_name: "ABC Clinic",
  facility_date_opened: "1975-01-01T00:00:00.000Z",
  facility_type_id: 7,
  facility_owner_id: 1,
  facility_operational_status_id: 1,
  facility_regulatory_status_id: 1,
  district_id: 4,
  client_id: 1,
  archived_date: null,
  published_date: "2019-06-25T14:40:41.000Z",
  created_at: "2020-03-26T07:52:28.000Z",
  updated_at: "2020-03-26T07:47:05.000Z",
  id: 7,
};

const fakeWithoutMappings: Facility = {
  facility_code: "LL040007",
  facility_code_dhis2: null,
  facility_code_openlmis: null,
  facility_code_mapping: null,
  registration_number: "MCM/C/94",
  facility_name: "ABC Comm. Hospital",
  common_name: "ABC Clinic",
  facility_date_opened: "1975-01-01T00:00:00.000Z",
  facility_type_id: 7,
  facility_owner_id: 1,
  facility_operational_status_id: 1,
  facility_regulatory_status_id: 1,
  district_id: 4,
  client_id: 1,
  archived_date: null,
  published_date: "2019-06-25T14:40:41.000Z",
  created_at: "2020-03-26T07:52:28.000Z",
  updated_at: "2020-03-26T07:47:05.000Z",
  id: 7,
};

describe("#Facility code fetch", () => {
  it('should get the facility code when the client is not a special case', () => {
    const code = getFacilityCode(fake, 'Daniel');
    expect(code).to.equal(fake.facility_code);
  });

  it('should return the client\'s code if the client is a special case', () => {
    const code = getFacilityCode(fake, 'openlmis');
    expect(code).to.equal('LL4040');
  })

  it('should return null if the facility does not have code mappings', () => {
    const code = getFacilityCode(fakeWithoutMappings, 'Daniel');
    expect(code).to.equal(null);
  });
});

describe("#Facility organisation unit code fetch", () => {
  it('should return an empty string if the facility does not have a DHIS2 code', () => {
    const code = getDHIS2OUCode(fakeWithoutOUCode);
    expect(code.length).to.equal(0);
  });

  it('should return an empty string if the facility does not have code mappings', () => {
    const code = getDHIS2OUCode(fakeWithoutMappings);
    expect(code.length).to.equal(0);
  });

  it('should fetch the DHIS2 code when it is available', () => {
    const code = getDHIS2OUCode(fake);
    expect(code).to.equal('zYfP0gkHRJH');
  })
});
