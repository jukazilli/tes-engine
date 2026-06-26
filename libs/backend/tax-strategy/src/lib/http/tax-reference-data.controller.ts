import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TaxDomainsService } from '../application/tax-domains.service';

@ApiTags('Reference data')
@Controller('reference-data')
export class TaxReferenceDataController {
  constructor(private readonly service: TaxDomainsService) {}

  @Get('tax-strategy-modes')
  @ApiOkResponse({ isArray: true })
  modes() {
    return this.service.modes();
  }

  @Get('tax-owners')
  @ApiOkResponse({ isArray: true })
  owners() {
    return this.service.owners();
  }

  @Get('tax-domains')
  @ApiOkResponse({ isArray: true })
  async domains() {
    return await this.service.domains();
  }

  @Get('tax-strategy-source-types')
  @ApiOkResponse({ isArray: true })
  sourceTypes() {
    return this.service.sourceTypes();
  }
}
