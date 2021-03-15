import React, { useState } from "react";
import { ReqStatus } from "types";
import { api } from "api";
import { confirm } from "components/ConfirmDialog";
import Button from "components/Button";
import Ok from "components/Ok";
import { DockerEngineUpdateRequirement } from "common";
import { List } from "components/List";
import { MdRadioButtonChecked, MdRadioButtonUnchecked } from "react-icons/md";

function UpdateDockerEngine({
  updateEngineRequirements
}: {
  updateEngineRequirements: DockerEngineUpdateRequirement[];
}) {
  const [reqUpdateEngineStatus, setReqUpdateEngineStatus] = useState<
    ReqStatus<string>
  >({});

  async function installDockerEngine() {
    try {
      await new Promise<void>(resolve => {
        confirm({
          title: `Docker engine update`,
          text: `Warming, you are about to update Docker engine. It is possible that the system will need to reboot. Make sure you can sustain some minutes of downtime and backup your most important packages.`,
          label: "Update",
          onClick: resolve
        });
      });

      setReqUpdateEngineStatus({ loading: true });
      const output = await api.dockerEngineUpdate();
      setReqUpdateEngineStatus({ result: output });
    } catch (e) {
      setReqUpdateEngineStatus({ error: e });
      console.error(`Error on docker_engine_update.sh script: --install`, e);
    }
  }

  return (
    <>
      <List
        items={updateEngineRequirements}
        IconLeft={MdRadioButtonChecked}
        IconLeftFalse={MdRadioButtonUnchecked}
      />
      {updateEngineRequirements.every(
        requirement => requirement.isFulFilled === true
      ) ? (
        <Button
          disabled={
            reqUpdateEngineStatus.loading ||
            reqUpdateEngineStatus.result !== undefined
          }
          onClick={() => installDockerEngine()}
        >
          Update docker engine
        </Button>
      ) : null}
      {reqUpdateEngineStatus.result ? (
        <Ok ok={true} msg={"Successfully updated docker engine"} />
      ) : reqUpdateEngineStatus.loading ? (
        <Ok loading={true} msg={"Updating docker engine"} />
      ) : reqUpdateEngineStatus.error ? (
        <Ok
          ok={false}
          msg={
            reqUpdateEngineStatus.error instanceof Error
              ? reqUpdateEngineStatus.error.message
              : reqUpdateEngineStatus.error
          }
        />
      ) : null}
    </>
  );
}

export function DockerEngineManager() {
  const [
    reqGetEngineUpdateRequirements,
    setReqGetEngineUpdateRequirements
  ] = useState<ReqStatus<DockerEngineUpdateRequirement[]>>({});

  async function fetchEngineUpdateRequirements() {
    try {
      setReqGetEngineUpdateRequirements({ loading: true });
      const requirements = await api.dockerEngineUpdateRequirements();
      setReqGetEngineUpdateRequirements({ result: requirements });
    } catch (e) {
      setReqGetEngineUpdateRequirements({ error: e });
      console.error(`Error on docker_engine_update.sh script: --system`, e);
    }
  }

  return (
    <>
      <div className="subtle-header">UPDATE DOCKER ENGINE</div>
      <p>
        Update docker engine to a stable version with DAppNode. You must fulfill
        a list of requirements
      </p>
      <Button
        disabled={
          reqGetEngineUpdateRequirements.loading ||
          reqGetEngineUpdateRequirements.result !== undefined
        }
        onClick={() => fetchEngineUpdateRequirements()}
      >
        Check requirements
      </Button>
      {reqGetEngineUpdateRequirements.result ? (
        <UpdateDockerEngine
          updateEngineRequirements={reqGetEngineUpdateRequirements.result}
        />
      ) : reqGetEngineUpdateRequirements.error ? (
        <Ok
          msg={
            reqGetEngineUpdateRequirements.error instanceof Error
              ? reqGetEngineUpdateRequirements.error.message
              : reqGetEngineUpdateRequirements.error
          }
          ok={false}
        />
      ) : reqGetEngineUpdateRequirements.loading ? (
        <Ok msg={"Checking host requirements..."} loading={true} />
      ) : null}
    </>
  );
}
