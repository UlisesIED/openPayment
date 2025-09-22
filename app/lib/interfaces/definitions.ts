import {
    AllowedActions
} from '@/app/lib/types/types'


export interface AccessDetail {
  actions: AllowedActions[]; 
  type: string;
}

export interface AccessToken {
  access: AccessDetail[]; // Usa la interfaz que definimos arriba
  value: string;
  manage: string;
  expires_in: number;
}

export interface ContinueDetails {
  access_token: {
    value: string;
  };
  uri: string;
}

export interface IncomingPaymentGrant {
  access_token: AccessToken;
  continue: ContinueDetails;
}

export interface IClientConfig {
    privateKey: string;
    walletAddress: string;
    keyId: string;
}