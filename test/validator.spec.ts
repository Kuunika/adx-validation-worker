import { connectToDatabase } from './database-connection';
import { expect } from 'chai';
import * as testData from './fake-payload.json';
import { writeFileSync } from 'fs';
import { QueueMessage } from '../src/interfaces';
import 'mocha';
import { config } from 'dotenv'; config();
import { createMigration } from './database-api';
import { Logger } from '../src/utils';
import queueConsumer from '../src/consumer';
import { Sequelize } from 'sequelize';
import {
  createClient,
  createFacility,
  createProduct,
  clearElements,
  getMigrations
} from './database-api';

describe('Payload validation', async function () {
  let sequelize: Sequelize;
  const channelId = 'test-channel';
  const clientId = 'test';
  const file = `${process.env.AVW_PAYLOADS_ROOT_DIR}/${channelId}.adx`.replace(' ', '');
  let message: QueueMessage;
  const logger = new Logger(channelId);

  before(async function () {
    //connect to test db
    sequelize = await connectToDatabase(
      process.env.AVW_TEST_DATABASE_HOST || '127.0.0.1',
      process.env.AVW_TEST_DATABASE || 'db',
      process.env.AVW_TEST_DATABASE_USERNAME || 'root',
      process.env.AVW_TEST_DATABASE_PASSWORD || 'password'
    );

    //fake migration file
    await writeFileSync(file, JSON.stringify(testData));

    //create the message
    message = {
      channelId,
      clientId,
      migrationId: await createMigration(await sequelize)
    }

    //make sure the database is cleared
    await clearElements(sequelize);
    //populate the database with fake data
    await createClient(sequelize);
    await createFacility(sequelize);
    await createProduct(sequelize);
  })

  after(async function () {
    await clearElements(sequelize);
    setTimeout(function () {
      process.exit(0);
    }, 2000)
  })
  it("performs all the necessary validations a given payload file", async function () {
    await queueConsumer(sequelize, logger, message);
    const migration = await getMigrations(sequelize);
    expect(Boolean(migration.dataValues.id)).to.equal(true);
    expect(migration.dataValues.clientId).to.equal(1);
  });
})