import Axios, { AxiosError } from 'axios';
import { Wrapper } from "../config/wrapper";
import { LOGGER } from '../logging/winston.logger';
import { Facility } from "./facility.interface";
import { MasterHealthFacilityClientGatewayException } from './master-health-facility-client.exception';

export class MasterHealthFacilityClient {
    async findFacilityByCode(code: string): Promise<Facility|null> {
        const host = Wrapper.get<string>('AVW_MHFR_URL');
        const facilityPath = `${host}/Facilities/${code}`;
        try {
            LOGGER.info(`Attempting to find facility ${facilityPath}.`);
            const facility = (await Axios.get(facilityPath)).data;
            LOGGER.info(`Found facility ${facilityPath}`);
            return facility;
        } catch(error) {
            const err = error as AxiosError;
            if (err && err.response && err.response.status === 404) {
                LOGGER.error(`Failed to find facility ${facilityPath}. ${err.response.statusText}.`);
            } else {
                LOGGER.error(`Failed to find facility ${facilityPath}. Gateway error.`);
            }
            return null;
            // throw new MasterHealthFacilityClientGatewayException(`There was a problem talking to MHFR when fetching ${code}.`);
        }
    }
}