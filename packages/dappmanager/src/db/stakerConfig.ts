import { StakerItemData } from "@dappnode/common";
import { dbCache, dbMain } from "./dbFactory.js";
import { interceptGlobalEnvOnSet } from "./interceptGlobalEnvOnSet.js";
import {
  ConsensusClientMainnet,
  ExecutionClientMainnet,
  ConsensusClientGnosis,
  ExecutionClientGnosis,
  ConsensusClientPrater,
  ExecutionClientPrater
} from "@dappnode/types";

// Cache

const STAKER_ITEM_METADATA = "staker-item-metadata";

export const stakerItemMetadata = dbCache.indexedByKey<StakerItemData, string>({
  rootKey: STAKER_ITEM_METADATA,
  getKey: target => target,
  validate: (id, metadata) =>
    typeof id === "string" && typeof metadata === "object"
});

// Mainnet

const CONSENSUS_CLIENT_MAINNET = "consensus-client-mainnet";
const EXECUTION_CLIENT_MAINNET = "execution-client-mainnet";
const MEVBOOST_MAINNET = "mevboost-mainnet";
const FEE_RECIPIENT_MAINNET = "fee-recipient-mainnet";

/**
 * Whenever a user switches the EC and/or CC from the stakers UI then
 * consensusClientMainnet, executionClientMainnet will change as well
 */

export const consensusClientMainnet = interceptGlobalEnvOnSet(
  dbMain.staticKey<ConsensusClientMainnet | null>(
    CONSENSUS_CLIENT_MAINNET,
    null
  ),
  Object.keys({ CONSENSUS_CLIENT_MAINNET })[0]
);

export const executionClientMainnet = interceptGlobalEnvOnSet(
  dbMain.staticKey<ExecutionClientMainnet | null>(
    EXECUTION_CLIENT_MAINNET,
    null
  ),
  Object.keys({ EXECUTION_CLIENT_MAINNET })[0]
);

export const mevBoostMainnet = interceptGlobalEnvOnSet(
  dbMain.staticKey<boolean>(MEVBOOST_MAINNET, false),
  Object.keys({ MEVBOOST_MAINNET })[0]
);

export const feeRecipientMainnet = interceptGlobalEnvOnSet(
  dbMain.staticKey<string | null>(FEE_RECIPIENT_MAINNET, null),
  Object.keys({ FEE_RECIPIENT_MAINNET })[0]
);

// Gnosis

const CONSENSUS_CLIENT_GNOSIS = "consensus-client-gnosis";
const EXECUTION_CLIENT_GNOSIS = "execution-client-gnosis";
const MEVBOOST_GNOSIS = "mevboost-gnosis";
const FEE_RECIPIENT_GNOSIS = "fee-recipient-gnosis";

export const consensusClientGnosis = interceptGlobalEnvOnSet(
  dbMain.staticKey<ConsensusClientGnosis | null>(CONSENSUS_CLIENT_GNOSIS, null),
  Object.keys({ CONSENSUS_CLIENT_GNOSIS })[0]
);

export const executionClientGnosis = interceptGlobalEnvOnSet(
  dbMain.staticKey<ExecutionClientGnosis | null>(EXECUTION_CLIENT_GNOSIS, null),
  Object.keys({ EXECUTION_CLIENT_GNOSIS })[0]
);

export const mevBoostGnosis = interceptGlobalEnvOnSet(
  dbMain.staticKey<boolean>(MEVBOOST_GNOSIS, false),
  Object.keys({ MEVBOOST_GNOSIS })[0]
);

export const feeRecipientGnosis = interceptGlobalEnvOnSet(
  dbMain.staticKey<string | null>(FEE_RECIPIENT_GNOSIS, null),
  Object.keys({ FEE_RECIPIENT_GNOSIS })[0]
);

// Prater

const CONSENSUS_CLIENT_PRATER = "consensus-client-prater";
const EXECUTION_CLIENT_PRATER = "execution-client-prater";
const MEVBOOST_PRATER = "mevboost-prater";
const FEE_RECIPIENT_PRATER = "fee-recipient-prater";

export const consensusClientPrater = interceptGlobalEnvOnSet(
  dbMain.staticKey<ConsensusClientPrater | null>(CONSENSUS_CLIENT_PRATER, null),
  Object.keys({ CONSENSUS_CLIENT_PRATER })[0]
);

export const executionClientPrater = interceptGlobalEnvOnSet(
  dbMain.staticKey<ExecutionClientPrater | null>(EXECUTION_CLIENT_PRATER, null),
  Object.keys({ EXECUTION_CLIENT_PRATER })[0]
);

export const mevBoostPrater = interceptGlobalEnvOnSet(
  dbMain.staticKey<boolean>(MEVBOOST_PRATER, false),
  Object.keys({ MEVBOOST_PRATER })[0]
);

export const feeRecipientPrater = interceptGlobalEnvOnSet(
  dbMain.staticKey<string | null>(FEE_RECIPIENT_PRATER, null),
  Object.keys({ FEE_RECIPIENT_PRATER })[0]
);
