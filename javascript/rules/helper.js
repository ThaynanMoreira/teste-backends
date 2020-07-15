const ACTIONS_RULES = {
  // Em caso de eventos repetidos, considere o primeiro evento
  BEFORE_UPDATED_CHECK: (previousEventTimestamp, EventTimestamp) => {
    const prevDate = new Date(previousEventTimestamp).getTime();
    const date = new Date(EventTimestamp).getTime();
    return (prevDate <= date);
  },
  // Em caso de eventos atrasados, considere sempre o evento mais novo
  EVENTS_DUPLICATION_PREVENTION: (prevList, eventId) => {
    const uniqueEvents = prevList.map((val) => val.event_id);
    return !uniqueEvents.includes(eventId);
  },
};

// eslint-disable-next-line no-restricted-globals
const stringToNumber = (valueStr) => (!isNaN(valueStr) ? Number(valueStr) : 0);

module.exports = { ACTIONS_RULES, stringToNumber };
