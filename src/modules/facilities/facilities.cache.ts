import { Wrapper } from "../config/wrapper";
import Axios from "axios";
import AxiosRetry from "axios-retry";
import { Facility } from "./facility.interface";
import { RegexMods } from "../../common/constants";
import { LOGGER } from "../logging/winston.logger";

type FacilitiesCache = {
  [k in keyof any]: Facility;
};

type MHFRFacilties = Array<Facility>;

const MAX_RETRIES = 3;
AxiosRetry(Axios, { retries: MAX_RETRIES });

export function getFacilityCode(facility: Facility, client: string): string|null {
  if (!facility.facility_code_mapping) return null;
  const regex = new RegExp(client, RegexMods.CASE_INSENSITIVE);
  const key = facility.facility_code_mapping.find(m => regex.test(m.system));
  return key ? key.code : facility.facility_code;
}

export async function createFacilitiesCache(client: string): Promise<FacilitiesCache> {
  const cache: FacilitiesCache = {};
  const path = `${Wrapper.get("AVW_MHFR_URL")}/Facilities`;
  LOGGER.info('Facilities Cache: Fetching facilities...');
  const data: MHFRFacilties = (await Axios.get(path)).data;
  LOGGER.info('Facilities Cache: Facilities fetched.');

  if (data.length) {
    LOGGER.info('Facilities Cache: Caching facilities...');
    data.forEach((facility): void => {
      const key = getFacilityCode(facility, client);
      if (key) cache[key] = facility;
    });
    LOGGER.info('Facilities Cache: Facilities cached.');
  }

  return cache;
}