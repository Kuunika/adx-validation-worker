import { FacilityData } from ".";

export interface PostPayload {
  "description": string,
  "reporting-period": string,
  "facilities": Array<FacilityData>
}