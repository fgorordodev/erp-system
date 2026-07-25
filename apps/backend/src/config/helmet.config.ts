import { ConfigService } from '@nestjs/config';
import type { HelmetOptions } from 'helmet';

const HSTS_MAX_AGE_SECONDS = 31_536_000;

export function createHelmetOptions(
  configService: ConfigService,
): HelmetOptions {
  const nodeEnvironment = configService.getOrThrow<string>('NODE_ENV');
  const isProduction = nodeEnvironment === 'production';

  return {
    /*
     * Swagger UI utiliza scripts y estilos propios.
     * La CSP se configurará específicamente cuando se defina
     * una política compatible con Swagger o se separe la documentación.
     */
    contentSecurityPolicy: false,

    /*
     * Evita incompatibilidades con recursos cargados por Swagger UI.
     */
    crossOriginEmbedderPolicy: false,

    referrerPolicy: {
      policy: 'no-referrer',
    },

    /*
     * HSTS solo debe enviarse cuando la aplicación se publica
     * exclusivamente mediante HTTPS.
     */
    hsts: isProduction
      ? {
          maxAge: HSTS_MAX_AGE_SECONDS,
          includeSubDomains: true,
          preload: true,
        }
      : false,
  };
}
