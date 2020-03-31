import { decode } from 'jsonwebtoken'

import { JwtPayload } from './JwtPayload'

import { createLogger } from "./../utils/logger";

const logger = createLogger("parseUserId");

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {

  const decodedJwt = decode(jwtToken) as JwtPayload

  logger.info("Decoded JWT: ", {
    decoded: decodedJwt
  });

  return decodedJwt.sub
}

// https://github.com/sgmeyer/auth0-node-jwks-rs256/blob/master/src/lib/utils.js
export function certToPEM(cert: string) {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}
