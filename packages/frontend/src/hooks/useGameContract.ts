import { useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import useNetworkConfig from './useNetworkConfig';
import { CONTRACT_PACKAGE_VARIABLE_NAME } from '../config/network';

export const useGameContract = () => {
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const networkConfig = useNetworkConfig();
  const packageId = networkConfig.useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME);

  const getContract = () => ({
    packageId,
    module: 'game',
  });

  return {
    getContract,
    client: suiClient,
    account: currentAccount,
  };
}; 