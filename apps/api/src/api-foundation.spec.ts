import { Body, Controller, INestApplication, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IsString } from 'class-validator';
import request from 'supertest';
import { configureApiApplication } from './bootstrap/configure-api-application';
import { AppConfigService } from './config/app-config.service';
import { HealthService } from './health/health.service';
import { setApiTestEnvironment } from './test-env';

class ValidationTestDto {
  @IsString()
  name!: string;
}

@Controller('validation-test')
class ValidationTestController {
  @Post()
  validate(@Body() body: ValidationTestDto): ValidationTestDto {
    return body;
  }
}

describe('API foundation', () => {
  let app: INestApplication;

  beforeAll(async () => {
    setApiTestEnvironment();
    const { AppModule } = await import('./app/app.module');
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [ValidationTestController],
    }).compile();

    app = moduleRef.createNestApplication();
    await configureApiApplication(app, app.get(AppConfigService).value);
    await app.init();
    app.get(HealthService).markInitialized();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('returns GET /api/health', async () => {
    const response = await request(app.getHttpServer()).get('/api/health').expect(200);

    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.headers['x-correlation-id']).toBeTruthy();
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'ok',
        service: 'tes-engine-api',
        version: '0.1.0',
        environment: 'test',
      }),
    );
  });

  it('returns GET /api/health/live', async () => {
    const response = await request(app.getHttpServer()).get('/api/health/live').expect(200);

    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'alive',
        service: 'tes-engine-api',
      }),
    );
  });

  it('returns GET /api/health/ready', async () => {
    const response = await request(app.getHttpServer()).get('/api/health/ready').expect(200);

    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'ready',
        configurationLoaded: true,
        applicationInitialized: true,
      }),
    );
  });

  it('returns GET /api/docs-json with expected OpenAPI paths and schemas', async () => {
    const response = await request(app.getHttpServer()).get('/api/docs-json').expect(200);

    expect(response.body.openapi).toMatch(/^3\./);
    expect(response.body.paths).toHaveProperty('/api/health');
    expect(response.body.paths).toHaveProperty('/api/health/live');
    expect(response.body.paths).toHaveProperty('/api/health/ready');
    expect(response.body.components.schemas).toHaveProperty('HealthResponseDto');
    expect(response.body.components.schemas).toHaveProperty('ApiErrorResponseDto');
  });

  it('returns the standardized error contract for unknown routes', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/rota-inexistente')
      .set('X-Correlation-ID', 'test-correlation-123')
      .expect(404);

    expect(response.headers['content-type']).toContain('application/json');
    expect(response.headers['x-correlation-id']).toBe('test-correlation-123');
    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 404,
        code: 'RESOURCE_NOT_FOUND',
        message: 'Resource not found.',
        path: '/api/rota-inexistente',
        method: 'GET',
        correlationId: 'test-correlation-123',
      }),
    );
    expect(JSON.stringify(response.body)).not.toContain('stack');
  });

  it('returns generated correlation IDs', async () => {
    const response = await request(app.getHttpServer()).get('/api/health').expect(200);

    expect(response.headers['x-correlation-id']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('returns validation errors with fieldErrors', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/validation-test')
      .send({ name: 123, extra: true })
      .expect(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed.',
        method: 'POST',
      }),
    );
    expect(response.body.fieldErrors).toEqual(
      expect.objectContaining({
        extra: ['property extra should not exist'],
        name: ['name must be a string'],
      }),
    );
  });
});
