import Axios, { AxiosError } from 'axios';
import { Wrapper } from "../config/wrapper";
import { StdLogger } from "../logging/std.logger";
import { Facility } from "./facility.interface";
import { MasterHealthFacilityClientGatewayException } from './master-health-facility-client.exception';

export class MasterHealthFacilityClient {
    private logger: StdLogger = new StdLogger('MHFR Client');

    async findFacilityByCode(code: string): Promise<Facility|null> {
        const host = Wrapper.get<string>('MHFR_HOST');
        const facilityPath = `${host}/Facilities/findByCode/${code}`;
        try {
            this.logger.debug(`Attempting to find facility ${facilityPath}.`)
            const facility = (await Axios.get(facilityPath)).data;
            this.logger.debug(`Found facility ${facilityPath}`);
            return facility;
        } catch(error) {
            const err = error as AxiosError;
            if (err && err.response && err.response.status === 404) {
                this.logger.error(`Failed to find facility ${facilityPath}. ${err.response.statusText}.`);
            } else {
                this.logger.error(`Failed to find facility ${facilityPath}. Gateway error.`);
            }
            return null;
            // throw new MasterHealthFacilityClientGatewayException(`There was a problem talking to MHFR when fetching ${code}.`);
        }
    }
}