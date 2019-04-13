import { PostPayload, FacilityData, FacilityDataValue } from '../interfaces';
const _ = require('lodash');

export const flattenPayload = (payload: PostPayload) => {
  const data = payload.facilities.map((facilityData: FacilityData) => {
    const _data = facilityData.values.map((facilityDataValue: FacilityDataValue) => ({
      organisationUnitCode: facilityData["facility-code"],
      dataElementId: facilityDataValue["product-code"],
      value: facilityDataValue["value"]
    }))
    return _data;
  })
  return _.flatten(data);
}