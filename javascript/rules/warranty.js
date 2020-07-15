const { stringToNumber, ACTIONS_RULES } = require('./helper');

const EVENT_SCHEMA_NAMES = [
  'event_id',
  'event_schema',
  'event_action',
  'event_timestamp',
  'proposal_id',
  'warranty_id',
  'warranty_value',
  'warranty_province',
];

const VALIDATE_VARIABLES = {
  // Mínimo de 1 garantia
  MIN_WARRANT_COUNT: 1,
  // Estados não aceitos
  STATES_REFUSED: ['PR', 'SC', 'RS'],
};

// Dever haver no mínimo 1 garantia de imóvel por proposta
const ThereMustBeAtLeastOnePropertyWarrantyPerProposal = (warrantyList) => (!warrantyList
  || Object.keys(warrantyList).length < VALIDATE_VARIABLES.MIN_WARRANT_COUNT
);

// A soma do valor das garantias deve ser maior ou igual ao dobro do valor do empréstimo
const validationOfTheSumOfTheValueOfTheWarranty = (warrantyList, proposalValue) => {
  const totalWarrantyValue = Object.values(warrantyList).reduce(
    (prev, val) => (prev + stringToNumber(val.warranty_value)), 0,
  );
  const proposalLoanValue = stringToNumber(proposalValue);
  return (!(totalWarrantyValue >= proposalLoanValue * 2));
};
const validate = (loan) => {
  // Dever haver no mínimo 1 garantia de imóvel por proposta
  if (ThereMustBeAtLeastOnePropertyWarrantyPerProposal(loan.warranty.result)) {
    return false;
  }

  // A soma do valor das garantias deve ser maior ou igual ao dobro do valor do empréstimo
  if (validationOfTheSumOfTheValueOfTheWarranty(
    loan.warranty.result, loan.proposal.result.proposal_loan_value,
  )) {
    return false;
  }

  return true;
};

// const RULES = {}

const executeAdded = (previousEvent, event) => {
  if (!previousEvent) {
    previousEvent = {};
  }

  // As garantias de imóvel dos estados PR, SC e RS não são aceitas
  if (!VALIDATE_VARIABLES.STATES_REFUSED.includes(event.warranty_province)
    || VALIDATE_VARIABLES.STATES_REFUSED.indexOf(event.warranty_province) < 0) {
    previousEvent[event.warranty_id] = event;
  }

  return previousEvent;
};

const executeUpdated = (previousEvent, event) => {
  if (!previousEvent) {
    previousEvent = {};
  }
  if (ACTIONS_RULES.BEFORE_UPDATED_CHECK(previousEvent.event_timestamp, event.event_timestamp)) {
    previousEvent[event.proponent_id] = event;
  }
  return previousEvent;
};

const executeRemoved = (previousEvent, event) => {
  if (!previousEvent) {
    previousEvent = {};
  }
  delete previousEvent[event.warranty_id];
  return previousEvent;
};

const executeActions = {
  added: executeAdded,
  updated: executeUpdated,
  removed: executeRemoved,
};

const execute = (events) => {
  events.reduce(
    (warrantyExecutedObj, event) => executeActions[event.event_action](warrantyExecutedObj),
  );
};

module.exports = {
  EVENT_SCHEMA_NAMES, execute, executeActions, validate,
};
