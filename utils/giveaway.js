function generateDescription(endEpoch, hostID, entries, winners) {
  return (
    `Ends: <t:${endEpoch}:R> (<t:${endEpoch}>)` +
    `\nHosted by: <@${hostID}>` +
    `\nEntries: **${entries}**` +
    `\nWinners: **${winners}**`
  );
}

export { generateDescription };
