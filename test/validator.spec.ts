import { connectToDatabase } from './setup/database/connection';
import { expect } from 'chai';
import * as validPayload from './fixtures/valid-payload.json';
import * as invalidFacilityCodePayload from './fixtures/invalid-facility-code-payload.json';
import * as invalidProductCodePayload from './fixtures/invalid-product-code-payload.json';
import * as invalidStructurePayload from './fixtures/invalid-structure-payload.json';
import { writeFileSync } from 'fs';
import { QueueMessage } from '../src/interfaces';
import 'mocha';
import { config } from 'dotenv'; config();
import { createMigration } from './setup/database/populate';
import { Logger } from '../src/utils';
import queueConsumer from '../src/consumer';
import { Sequelize } from 'sequelize';
import {
  createClient,
  createFacility,
  createProduct,
  clearElements,
  getMigration
} from './setup/database/populate';

describe('Payload validation', async function () {
  let sequelize: Sequelize;
  const channelId = 'test-channel';
  const clientId = 'test';
  const file = `${process.env.AVW_PAYLOADS_ROOT_DIR}/${channelId}.adx`.replace(' ', '');
  let message: QueueMessage;
  const logger = new Logger(channelId);

  const triggerMigration = async (payload: any) => {
    await writeFileSync(file, JSON.stringify(payload));
    await queueConsumer(sequelize, logger, message);
    return getMigration(sequelize);
  }

  before(async function () {
    //connect to test db
    sequelize = await connectToDatabase(
      process.env.AVW_TEST_DATABASE_HOST || '127.0.0.1',
      process.env.AVW_TEST_DATABASE || 'db',
      process.env.AVW_TEST_DATABASE_USERNAME || 'root',
      process.env.AVW_TEST_DATABASE_PASSWORD || 'password'
    );

    //create the message
    message = {
      channelId,
      clientId,
      migrationId: await createMigration(await sequelize)
    }
    await clearElements(sequelize);
  })

  beforeEach(async function () {
    await clearElements(sequelize);
    //populate the database with fake data
    await createClient(sequelize);
    await createFacility(sequelize);
    await createProduct(sequelize);
  });

  afterEach(async function () {
    await clearElements(sequelize);
  })

  after(async function () {
    setTimeout(function () {
      process.exit(0);
    }, 2000)
  });
  it("Fails on structure validation", async function () {
    const migration = await triggerMigration(invalidStructurePayload)
    expect(migration.dataValues.structureValidatedAt).to.equal(null);
  });

  it("Fails on invalid facility code", async function () {
    const migration = await triggerMigration(invalidFacilityCodePayload)
    expect(migration.dataValues.valuesValidatedAt).to.equal(null);
  });

  it("Fails on invalid product code", async function () {
    const migration = await triggerMigration(invalidProductCodePayload)
    expect(migration.dataValues.valuesValidatedAt).to.equal(null);
  });

  it("Validates only when all conditions have been met", async function () {
    const migration = await triggerMigration(validPayload)
    expect(migration.dataValues.valuesFailedValidationAt).to.equal(null);
    expect(migration.dataValues.structureFailedValidationAt).to.equal(null);
  });
})