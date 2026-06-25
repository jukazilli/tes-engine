import { IsString, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';
import { createGlobalValidationPipe, flattenValidationErrors } from './global-validation.pipe';

class TestDto {
  @IsString()
  name!: string;
}

describe('global validation pipe', () => {
  it('flattens validation errors for the API error contract', () => {
    const dto = plainToInstance(TestDto, { name: 123 });
    const errors = validateSync(dto);

    expect(flattenValidationErrors(errors)).toEqual(['name must be a string']);
  });

  it('creates BadRequestException for invalid DTOs', () => {
    const pipe = createGlobalValidationPipe();
    const exception = pipe.createExceptionFactory()([
      {
        property: 'name',
        constraints: {
          isString: 'name must be a string',
        },
      },
    ]);

    expect(exception).toBeInstanceOf(BadRequestException);
    expect((exception as BadRequestException).getResponse()).toEqual(
      expect.objectContaining({
        statusCode: 400,
        error: 'Bad Request',
        message: ['name must be a string'],
      }),
    );
  });
});
