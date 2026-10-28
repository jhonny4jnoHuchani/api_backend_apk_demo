import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { TokensService } from './tokens.service.js';
import { GenerateTokenDto } from './dto/generate-token.dto.js';
import { ValidateTokenDto } from './dto/validate-token.dto.js';

@Controller('api/tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  /**
   * Endpoint 3: Generar Token OTP para la App Móvil
   * POST /api/tokens/generate
   */
  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generate(@Body() generateTokenDto: GenerateTokenDto) {
    return await this.tokensService.generate(generateTokenDto);
  }

  /**
   * Endpoint 4: Validar Token OTP (consumido por Laravel)
   * POST /api/tokens/validate
   */
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validate(@Body() validateTokenDto: ValidateTokenDto) {
    return await this.tokensService.validate(validateTokenDto);
  }
}
