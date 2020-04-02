import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import { certToPEM } from "./../../auth/utils";

const logger = createLogger('auth');

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {

  const keys = await getSigningKeys();

  logger.info("Authorising a user with signing keys: ", { auth: event.authorizationToken, keys });

  try {
    const jwtToken = await verifyToken(event.authorizationToken, keys)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
};

// TODO: Implement token verification
// You should implement it similarly to how it was implemented for the exercise for the lesson 5
// You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
async function verifyToken(authHeader: string, keys): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  logger.info("JWT and Signing Keys: ", { jwt, keys });

  const cert = keys[0].publicKey || "";
  if (jwt.header.kid === keys[0].kid) {
    return verify(token, cert, { algorithms: ["RS256"] }) as JwtPayload;
  }

  return verify(token, cert) as JwtPayload; // failing verify
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

async function getSigningKeys() {
  const jwksUrl = "https://nicholaspre.eu.auth0.com/.well-known/jwks.json";

  const { data } = await Axios.get(jwksUrl);

  logger.info("JWKS: ", data);

  if (!data.keys || !data.keys.length) {
    throw new Error("The JWKS endpoint did not contain any keys.");
  }

  const signingKeys = data.keys
    .filter(key => key.use === "sig" && key.kty === "RSA" && key.kid && (key.x5c && key.x5c.length))
    .map(key => {
      return {
        kid: key.kid,
        nbf: key.nbf,
        publicKey: certToPEM(key.x5c[0])
      }
    });

  logger.info("CERT: ", { cert: signingKeys.publicKey });
  return signingKeys;
}
