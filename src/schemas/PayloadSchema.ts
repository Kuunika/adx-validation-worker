import { ObjectSchema } from 'joi';
import * as Joi from 'joi';

export const PayloadSchema: ObjectSchema = Joi.object().keys({
  "description": Joi.string().required(),
  "reporting-period": Joi.string().required(),
  "facilities": Joi.array().items(
    Joi.object().keys({
      "facility-code": Joi.string().required(),
      "values": Joi.array().items(
        Joi.object().keys({
          "product-code": Joi.string().required(),
          "value": Joi.number().required()
        })
      )
    })
  )
});
