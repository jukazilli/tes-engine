import { Controller, Get, Header } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ReferenceOption } from '../domain/contracts';
import {
  COUNTRY_OPTIONS,
  ENVIRONMENT_TYPE_OPTIONS,
  ESTABLISHMENT_TYPE_OPTIONS,
  ICMS_TAXPAYER_OPTIONS,
  NFE_CRT_OPTIONS,
  STATE_OPTIONS,
  TAX_REGIME_OPTIONS,
} from '../domain/reference-data';

@ApiTags('Reference data')
@Controller('reference-data')
export class ReferenceDataController {
  @Get('tax-regimes')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOkResponse({ description: 'Controlled tax regime options.' })
  taxRegimes(): ReferenceOption[] {
    return TAX_REGIME_OPTIONS;
  }

  @Get('nfe-crt')
  @Header('Cache-Control', 'public, max-age=3600')
  nfeCrt(): ReferenceOption[] {
    return NFE_CRT_OPTIONS;
  }

  @Get('icms-taxpayer-indicators')
  @Header('Cache-Control', 'public, max-age=3600')
  icmsTaxpayerIndicators(): ReferenceOption[] {
    return ICMS_TAXPAYER_OPTIONS;
  }

  @Get('establishment-types')
  @Header('Cache-Control', 'public, max-age=3600')
  establishmentTypes(): ReferenceOption[] {
    return ESTABLISHMENT_TYPE_OPTIONS;
  }

  @Get('environment-types')
  @Header('Cache-Control', 'public, max-age=3600')
  environmentTypes(): ReferenceOption[] {
    return ENVIRONMENT_TYPE_OPTIONS;
  }

  @Get('states')
  @Header('Cache-Control', 'public, max-age=3600')
  states(): ReferenceOption[] {
    return STATE_OPTIONS;
  }

  @Get('countries')
  @Header('Cache-Control', 'public, max-age=3600')
  countries(): ReferenceOption[] {
    return COUNTRY_OPTIONS;
  }
}
