function parseUptimeAlert(content) {
  const parsedAlert = {};

  parsedAlert.status = /Monitor is (.*?):/.exec(content)[1];

  if (parsedAlert.status === "DOWN") {
    parsedAlert.reason = /Reason: (.*)/.exec(content)[1];
  } else if (parsedAlert.status === "UP") {
    parsedAlert.duration = /It was down for (.*)\./.exec(content)[1];
  }

  return parsedAlert;
}

function getStatusColor(status) {
  switch (status) {
    case "UP":
      // Lime Green
      return "#32CD32";

    case "DOWN":
      // Crimson
      return "#DC143C";
  }
}

export { parseUptimeAlert, getStatusColor };
