const {
  SCHEMAS, INITIAL_STACK_EVENTS, VALIDATE_EVENTS, EXECUTE_EVENTS, ACTIONS_RULES,
} = require('./rules/index');

const formatEventsBasedOnNames = (attrsList, attrsNameList) => attrsList.reduce(
  (eventObj, value, i) => {
    eventObj[attrsNameList[i]] = value;
    return eventObj;
  }, {},
);

const processEvent = (prevList, eventStr) => {
  const attrsList = eventStr.split(',');
  const eventSchemaName = attrsList[1];
  const eventFormated = formatEventsBasedOnNames(attrsList, SCHEMAS[eventSchemaName]);
  if (ACTIONS_RULES.EVENTS_DUPLICATION_PREVENTION(prevList, eventFormated.event_id)) {
    prevList.push(formatEventsBasedOnNames(attrsList, SCHEMAS[eventSchemaName]));
  }
  return prevList;
};

const executeEvents = (events) => events.reduce(
  (loan, event) => {
    if (!loan[event.proposal_id]) {
      // clone object fix
      loan[event.proposal_id] = JSON.parse(JSON.stringify(INITIAL_STACK_EVENTS));
    }
    const executeEvent = EXECUTE_EVENTS[event.event_schema][event.event_action];
    loan[event.proposal_id][event.event_schema].result = executeEvent(
      loan[event.proposal_id][event.event_schema].result,
      event,
    );
    loan[event.proposal_id][event.event_schema].events.push(event);
    return loan;
  }, {},
);

const applyRulesOnProcessedLoans = (processedLoans) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  Object.keys(processedLoans).reduce((response, key) => {
    const { proponent, proposal, warranty } = VALIDATE_EVENTS;
    if (proposal(processedLoans[key])
        && proponent(processedLoans[key])
        && warranty(processedLoans[key])) {
      response.push(key);
    }

    return response;
  }, []).toString();

const processMessages = (message) => {
  const messageLines = message.split('\n');

  const events = messageLines.reduce(processEvent, []);
  const processedLoans = executeEvents(events);
  const result = applyRulesOnProcessedLoans(processedLoans);
  return result;
};
module.exports = { processMessages };
