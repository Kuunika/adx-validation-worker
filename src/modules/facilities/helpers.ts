import { SystemNames } from "../../common/constants";
import { Facility } from "./facility.interface";

export function getDHIS2OUCode(facility: Facility): string {
    const code = facility.facility_code_mapping.find(val => val.system === SystemNames.DHIS2);
    if (code) return code.code;
    return '';
}