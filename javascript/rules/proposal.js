const { stringToNumber, ACTIONS_RULES } = require('./helper');

const EVENT_SCHEMA_NAMES = [
  'event_id',
  'event_schema',
  'event_action',
  'event_timestamp',
  'proposal_id',
  'proposal_loan_value',
  'proposal_number_of_monthly_installments',
];

const VALIDATE_VARIABLES = {
  // R$ 30.000,00
  MIN_LOAN_VALUE: 30000,
  // R$ 3.000.000,00
  MAX_LOAN_VALUE: 3000000,
  // 2 anos
  MIN_ACCEPTED_NUMBER_OF_MONTHLY_INSTALLMENTS: 24,
  // 15 anos
  MAX_ACCEPTED_NUMBER_OF_MONTHLY_INSTALLMENTS: 180,
};

// O valor do empréstimo deve estar entre R$ 30.000,00 e R$ 3.000.000,00
const loanValueValidation = (loanValue) => (
  loanValue < VALIDATE_VARIABLES.MIN_LOAN_VALUE
  || loanValue > VALIDATE_VARIABLES.MAX_LOAN_VALUE
);

// O empréstimo deve ser pago em no mínimo 2 anos e no máximo 15 anos
const loanPeriodValidation = (numberMonthlyValue) => (
  numberMonthlyValue < VALIDATE_VARIABLES.MIN_ACCEPTED_NUMBER_OF_MONTHLY_INSTALLMENTS
  || numberMonthlyValue > VALIDATE_VARIABLES.MAX_ACCEPTED_NUMBER_OF_MONTHLY_INSTALLMENTS
);

const validate = (loan) => {
  // O valor do empréstimo deve estar entre R$ 30.000,00 e R$ 3.000.000,00
  if (loanValueValidation(stringToNumber(loan.proposal.result.proposal_loan_value))) {
    return false;
  }

  // O empréstimo deve ser pago em no mínimo 2 anos e no máximo 15 anos
  const numberMonthlyStr = loan.proposal.result.proposal_number_of_monthly_installments;
  const numberMonthlyValue = stringToNumber(numberMonthlyStr);
  if (loanPeriodValidation(numberMonthlyValue)) {
    return false;
  }
  return true;
};

const executeCreated = (previousEvent, event) => event;

const executeUpdated = (previousEvent, event) => {
  if (ACTIONS_RULES.BEFORE_UPDATED_CHECK(previousEvent.event_timestamp, event.event_timestamp)) {
    return event;
  }
  return previousEvent;
};

const executeDeleted = () => ({});

const executeActions = {
  created: executeCreated,
  updated: executeUpdated,
  deleted: executeDeleted,
};

const execute = (events) => {
  events.reduce(
    (proposalExecutedObj, event) => executeActions[event.event_action](proposalExecutedObj),
    {},
  );
};

module.exports = {
  EVENT_SCHEMA_NAMES, execute, executeActions, validate,
};
