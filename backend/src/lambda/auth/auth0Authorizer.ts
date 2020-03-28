import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth');

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = "https://nicholaspre.eu.auth0.com/.well-known/jwks.json";

const jwks = Axios.get(jwksUrl);

logger.info("JWKS: ", jwks);

const cert = `-----BEGIN CERTIFICATE-----
MIIDCzCCAfOgAwIBAgIJP0F8Ci+RBGmAMA0GCSqGSIb3DQEBCwUAMCMxITAfBgNV
BAMTGG5pY2hvbGFzcHJlLmV1LmF1dGgwLmNvbTAeFw0xODA4MDUxMjU5MjdaFw0z
MjA0MTMxMjU5MjdaMCMxITAfBgNVBAMTGG5pY2hvbGFzcHJlLmV1LmF1dGgwLmNv
bTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAK32cbLuAUvT+iFAkjnp
4GvVdOV4OcIvyLJgAPLgz20BItYkvxq0hxQdJ8oCEm4xu1IVabvPLVCNtcWP2opE
F1kyVXt2MUGmnBj9RTBtgQTS4Xvk5/yntYR/R5lrIo717t9Or6CQL61ZsB8K5e0E
VKQ7MID6UU5N8NVs5AeNG/xKFjNC3aBVEo6s3IVKPCd45fO8e9YSa19U65szfv8r
lnl/5EYq9WBMd/bNq1tUlIkjnMqerU9SePpyG3ivKFgvvesV4zP3geE941feC8W0
n7nr/InZ7d0MGpK8Rp9/fFQXP5jsfbOh37cHbi/u+m3qhU/FS/MtdzWdHP8ipAGi
T2ECAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQU/MrB6lWYdiLc
iBmgfaU2x4HsSbEwDgYDVR0PAQH/BAQDAgKEMA0GCSqGSIb3DQEBCwUAA4IBAQA6
aUgIV0lmNZOnaB9nmIVsFHWFlLZNEBCuCM+XmJ7iunef9gTt2QJDshBK6y1/YKVN
UfJVxEq1J0GV+hamcc8xXMrwwvwsSX6a4IOIttduTAy3cSXKOs9pCcvKNDLsCfnY
3CGDtzQ/78MsueYNpD5uvH9/8oA6BAbFvDWA3nQ3Y359AVHkfP2iUMlG9rtPeRxd
5xSyvDQikTptymJNsC7Ui6jwQXyZfuCTpgfIvS7tT6ibdbVEFiZf23ZCDSk01xAJ
0A2SMaxCXp1Nhe+41vOYM7fO3O9HzkURTJr6Dn5srebZtDV2exHVjvir/Rwe7AtQ
27n9YHpE8Bt8e1pqfT0Q
-----END CERTIFICATE-----
`;

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {

  logger.info('Authorizing a user', event.authorizationToken);

  try {
    const jwtToken = await verifyToken(event.authorizationToken)
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

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  logger.info("JWT: ", jwt);
  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, cert, { algorithms: ["RS256"] }) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
