import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
});

afterAll(async () => {
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
});

afterEach(async () => {
});