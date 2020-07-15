const proposal = require('./proposal');
const proponent = require('./proponent');
const warranty = require('./warranty');
const { ACTIONS_RULES } = require('./helper');

const SCHEMAS = {
  proposal: proposal.EVENT_SCHEMA_NAMES,
  proponent: proponent.EVENT_SCHEMA_NAMES,
  warranty: warranty.EVENT_SCHEMA_NAMES,
};

const INITIAL_STACK_EVENTS = {
  proposal: {
    result: null,
    events: [],
  },
  warranty: {
    result: null,
    events: [],
  },
  proponent: {
    result: null,
    events: [],
  },
};

const EXECUTE_STACK_EVENTS = {
  proposal: proposal.execute,
  proponent: proponent.execute,
  warranty: warranty.execute,
};

const EXECUTE_EVENTS = {
  proposal: proposal.executeActions,
  proponent: proponent.executeActions,
  warranty: warranty.executeActions,
};

const VALIDATE_EVENTS = {
  proposal: proposal.validate,
  proponent: proponent.validate,
  warranty: warranty.validate,
};

module.exports = {
  SCHEMAS,
  INITIAL_STACK_EVENTS,
  EXECUTE_STACK_EVENTS,
  VALIDATE_EVENTS,
  EXECUTE_EVENTS,
  ACTIONS_RULES,
};
