const upnpcCommand = require("./upnpcCommand");
const validateKwargs = require("./validateKwargs");
const parseOpenOutput = require("./parseOpenOutput");

/**
 * Opens port = adds port mapping
 * Actual command example:
 * docker run --rm --net=host ${IMAGE} upnpc -e DAppNode -a 192.168.178.31 9735 9735 TCP 7200
 *
 * @param {object} kwargs: {
 *   portNumber: '3000',
 *   protocol: 'TCP',
 * }
 * @returns {*}
 */

// Timeout in seconds. Should be greater than the natRenewalInterval
const natRenewalTimeout = 7200;

async function open({ portNumber, protocol }, localIp) {
  validateKwargs({ portNumber, protocol });
  try {
    const res = await upnpcCommand(
      `-e DAppNode -a ${localIp} ${portNumber} ${portNumber} ${protocol} ${natRenewalTimeout}`
    );
    return parseOpenOutput(res);
  } catch (e) {
    parseOpenOutput(e.message);
    throw e;
  }
}

module.exports = open;
