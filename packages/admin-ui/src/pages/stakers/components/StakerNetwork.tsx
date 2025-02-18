import React, { useState, useEffect } from "react";
import SubTitle from "components/SubTitle";
import { withToast } from "components/toast/Toast";
import Card from "components/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import {
  StakerConfigGet,
  StakerConfigGetOk,
  StakerConfigSet,
  StakerItemOk
} from "@dappnode/common";
import { api, useApi } from "api";
import ErrorView from "components/ErrorView";
import { confirm } from "components/ConfirmDialog";
import MevBoost from "./columns/MevBoost";
import RemoteSigner from "./columns/RemoteSigner";
import ConsensusClient from "./columns/ConsensusClient";
import ExecutionClient from "./columns/ExecutionClient";
import Button from "components/Button";
import { disclaimer } from "../data";
import Loading from "components/Loading";
import {
  getChanges,
  isOkSelectedInstalledAndRunning,
  validateEthereumAddress
} from "./utils";
import { responseInterface } from "swr";
import { Alert, Form } from "react-bootstrap";
import { ReqStatus } from "types";
import "./columns.scss";
import { ThemeContext } from "App";
import LaunchpadValidators from "./launchpad/LaunchpadValidators";
import { FaEthereum } from "react-icons/fa";
import Input from "components/Input";
import { Network } from "@dappnode/types";

export default function StakerNetwork<T extends Network>({
  network,
  description
}: {
  network: T;
  description: string;
}) {
  // Context
  const { theme } = React.useContext(ThemeContext);
  // Launchpad
  const [showLaunchpadValidators, setShowLaunchpadValidators] = useState(false);
  const [allStakerItemsOk, setAllStakerItemsOk] = useState<boolean>(false);
  // Error
  const [feeRecipientError, setFeeRecipientError] = useState<string | null>(
    null
  );
  // Req
  const [reqStatus, setReqStatus] = useState<ReqStatus>({});
  // New config
  const [newFeeRecipient, setNewFeeRecipient] = useState<string>("");
  const [newExecClient, setNewExecClient] = useState<
    StakerItemOk<T, "execution">
  >();
  const [newConsClient, setNewConsClient] = useState<
    StakerItemOk<T, "consensus">
  >();
  const [newMevBoost, setNewMevBoost] = useState<
    StakerItemOk<T, "mev-boost">
  >();
  const [newEnableWeb3signer, setNewEnableWeb3signer] = useState<boolean>(
    false
  );

  // Apply button state
  const [changes, setChanges] = useState<{
    isAllowed: boolean;
    reason?: string;
    severity?: "warning" | "secondary" | "danger";
  }>({ isAllowed: false });
  const [currentStakerConfig, setCurrentStakerConfig] = useState<
    StakerConfigSet<T>
  >();

  const currentStakerConfigReq = useApi.stakerConfigGet(
    network
  ) as responseInterface<StakerConfigGet<T>, Error>;

  useEffect(() => {
    if (currentStakerConfigReq.data) {
      const {
        executionClients,
        consensusClients,
        mevBoost,
        web3Signer,
        feeRecipient
      } = currentStakerConfigReq.data;

      const executionClient = executionClients.find(ec =>
        isOkSelectedInstalledAndRunning(ec)
      );
      const consensusClient = consensusClients.find(cc =>
        isOkSelectedInstalledAndRunning(cc)
      );
      const enableWeb3signer = isOkSelectedInstalledAndRunning(web3Signer);

      if (executionClient && executionClient.status === "ok")
        setNewExecClient(executionClient);
      if (consensusClient && consensusClient.status === "ok")
        setNewConsClient(consensusClient);

      if (isOkSelectedInstalledAndRunning(mevBoost) && mevBoost.status === "ok")
        setNewMevBoost(mevBoost);
      setNewEnableWeb3signer(enableWeb3signer);
      if (feeRecipient) setNewFeeRecipient(feeRecipient);

      // Set the current config to be displayed in advance view
      setCurrentStakerConfig({
        network,
        executionClient:
          executionClient?.status === "ok" ? executionClient : undefined,
        consensusClient:
          consensusClient?.status === "ok" ? consensusClient : undefined,
        mevBoost:
          mevBoost?.status === "ok" && isOkSelectedInstalledAndRunning(mevBoost)
            ? mevBoost
            : undefined,
        enableWeb3signer,
        feeRecipient
      });

      // set allStakerItemsOk
      setAllStakerItemsOk(
        executionClients.every(ec => ec.status === "ok") &&
          consensusClients.every(cc => cc.status === "ok") &&
          mevBoost.status === "ok" &&
          web3Signer.status === "ok"
      );
    }
  }, [currentStakerConfigReq.data, network]);

  useEffect(() => {
    if (newFeeRecipient)
      setFeeRecipientError(validateEthereumAddress(newFeeRecipient));
  }, [newFeeRecipient]);

  useEffect(() => {
    if (currentStakerConfig)
      setChanges(
        getChanges({
          currentStakerConfig,
          feeRecipientError,
          newConsClient,
          newMevBoost,
          newEnableWeb3signer,
          newExecClient,
          newFeeRecipient
        })
      );
  }, [
    currentStakerConfig,
    feeRecipientError,
    newConsClient,
    newMevBoost,
    newEnableWeb3signer,
    newExecClient,
    newFeeRecipient
  ]);

  /**
   * Set new staker config
   */
  async function setNewConfig(isLaunchpad: boolean) {
    try {
      // Make sure there are changes
      if (changes) {
        // TODO: Ask for removing the previous Execution Client and/or Consensus Client if its different
        if (!isLaunchpad) {
          await new Promise(
            (resolve: (confirmOnSetConfig: boolean) => void) => {
              confirm({
                title: `Staker configuration`,
                text:
                  "Are you sure you want to implement this staker configuration?",
                buttons: [
                  {
                    label: "Continue",
                    onClick: () => resolve(true)
                  }
                ]
              });
            }
          );
          await new Promise(
            (resolve: (confirmOnSetConfig: boolean) => void) => {
              confirm({
                title: `Disclaimer`,
                text: disclaimer,
                buttons: [
                  {
                    label: "Continue",
                    onClick: () => resolve(true)
                  }
                ]
              });
            }
          );
        }

        setReqStatus({ loading: true });
        await withToast(
          () =>
            // Omit metadata to be sent back to the backend
            api.stakerConfigSet({
              stakerConfig: {
                network,
                feeRecipient: newFeeRecipient,
                executionClient:
                  newExecClient?.status === "ok"
                    ? { ...newExecClient, data: undefined }
                    : newExecClient,
                consensusClient:
                  newConsClient?.status === "ok"
                    ? { ...newConsClient, data: undefined }
                    : newConsClient,
                mevBoost:
                  newMevBoost?.status === "ok"
                    ? { ...newMevBoost, data: undefined }
                    : newMevBoost,
                enableWeb3signer: isLaunchpad ? true : newEnableWeb3signer
              }
            }),
          {
            message: `Setting new staker configuration...`,
            onSuccess: `Successfully set new staker configuration`,
            onError: `Error setting new staker configuration`
          }
        );
        setReqStatus({ result: true });
      }
    } catch (e) {
      setReqStatus({ error: e });
    } finally {
      setReqStatus({ loading: true });
      await withToast(() => currentStakerConfigReq.revalidate(), {
        message: `Getting new ${network} staker configuration`,
        onSuccess: `Successfully loaded ${network} staker configuration`,
        onError: `Error new loading ${network} staker configuration`
      });
      setReqStatus({ loading: false });
    }
  }

  return (
    <div className={theme === "light" ? "stakers-light" : "stakers-dark"}>
      {currentStakerConfigReq.data ? (
        <Card>
          <p>
            Set up your Proof-of-Stake validator configuration for Ethereum and
            Ethereum-based chains. You will need to: <br />
            (1) Choose an Execution Layer client <br />
            (2) Choose a Consensus Layer client (+ validator) <br />
            (3) Install the web3signer, which will hold the validator keys and
            sign <br />
            {network !== "gnosis" && (
              <>
                (4) Optional; delegate block-building capacities through the MEV
                Boost network and potentially profit from MEV
              </>
            )}
          </p>
          <br />

          <p>{description}</p>

          <>
            <Input
              value={newFeeRecipient || ""}
              onValueChange={setNewFeeRecipient}
              isInvalid={Boolean(feeRecipientError)}
              prepend="Default Fee Recipient"
              placeholder="Default fee recipient to be used as a fallback in case you have not set a fee recipient for a validator"
            />
            {newFeeRecipient && feeRecipientError && (
              <Form.Text className="text-danger" as="span">
                {feeRecipientError}
              </Form.Text>
            )}
          </>

          <Row className="staker-network">
            <Col>
              <SubTitle>Execution Clients</SubTitle>
              {currentStakerConfigReq.data.executionClients.map(
                (executionClient, i) => (
                  <ExecutionClient<T>
                    key={i}
                    executionClient={executionClient}
                    setNewExecClient={setNewExecClient}
                    isSelected={
                      executionClient.dnpName === newExecClient?.dnpName
                    }
                  />
                )
              )}
            </Col>

            <Col>
              <SubTitle>Consensus Clients</SubTitle>
              {currentStakerConfigReq.data.consensusClients.map(
                (consensusClient, i) => (
                  <ConsensusClient<T>
                    key={i}
                    consensusClient={consensusClient}
                    setNewConsClient={setNewConsClient}
                    isSelected={
                      consensusClient.dnpName === newConsClient?.dnpName
                    }
                  />
                )
              )}
            </Col>

            <Col>
              <SubTitle>Remote signer</SubTitle>
              <RemoteSigner
                signer={currentStakerConfigReq.data.web3Signer}
                setEnableWeb3signer={setNewEnableWeb3signer}
                isSelected={newEnableWeb3signer}
              />
            </Col>
            {(network === "prater" || network === "mainnet") && (
              <Col>
                <SubTitle>Mev Boost</SubTitle>
                <MevBoost
                  network={network}
                  mevBoost={currentStakerConfigReq.data.mevBoost}
                  newMevBoost={newMevBoost}
                  setNewMevBoost={setNewMevBoost}
                  isSelected={
                    currentStakerConfigReq.data.mevBoost.dnpName ===
                    newMevBoost?.dnpName
                      ? true
                      : false
                  }
                />
              </Col>
            )}
          </Row>

          <hr />

          <div>
            <div className="staker-buttons">
              <Button
                variant="dappnode"
                disabled={!changes.isAllowed || reqStatus.loading}
                onClick={() => setNewConfig(false)}
              >
                Apply changes
              </Button>
              {network === "prater" && (
                <Button
                  disabled={!allStakerItemsOk}
                  onClick={() => setShowLaunchpadValidators(true)}
                  variant="dappnode"
                >
                  <FaEthereum /> Step by step setup
                </Button>
              )}
            </div>

            {!changes.isAllowed && changes.reason && (
              <>
                <br />
                <br />
                <Alert variant={changes.severity}>
                  Cannot apply changes: <b>{changes.reason}</b>
                </Alert>
              </>
            )}

            {reqStatus.error && (
              <ErrorView error={reqStatus.error} hideIcon red />
            )}
          </div>

          {showLaunchpadValidators && allStakerItemsOk && (
            <LaunchpadValidators
              network={network}
              stakerConfig={
                (currentStakerConfigReq.data as unknown) as StakerConfigGetOk<T>
              }
              setNewConfig={setNewConfig}
              setShowLaunchpadValidators={setShowLaunchpadValidators}
              setNewFeeRecipient={setNewFeeRecipient}
              newFeeRecipient={newFeeRecipient}
              setNewExecClient={setNewExecClient}
              setNewConsClient={setNewConsClient}
              setNewMevBoost={setNewMevBoost}
              newExecClient={newExecClient}
              newConsClient={newConsClient}
              newMevBoost={newMevBoost}
              feeRecipientError={feeRecipientError}
            />
          )}
        </Card>
      ) : currentStakerConfigReq.error ? (
        <ErrorView error={currentStakerConfigReq.error} hideIcon red />
      ) : currentStakerConfigReq.isValidating ? (
        <Loading steps={[`Loading ${network} staker configuration`]} />
      ) : (
        <ErrorView error={"No data"} hideIcon red />
      )}
    </div>
  );
}
