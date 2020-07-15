const { stringToNumber, ACTIONS_RULES } = require('./helper');

const EVENT_SCHEMA_NAMES = [
  'event_id',
  'event_schema',
  'event_action',
  'event_timestamp',
  'proposal_id',
  'proponent_id',
  'proponent_name',
  'proponent_age',
  'proponent_monthly_income',
  'proponent_is_main',
];

const VALIDATE_VARIABLES = {
  // Mínimo de 2 proponentes
  MIN_PROPONENT_COUNT: 2,
  // Numero exato de proponentes principais: 1
  MAIN_PROPONENT_COUNT: 1,
  // Idade Mínima de 18 anos dos proponentes
  MIN_AGE_PROPONENT: 18,

  YOUNG_MIN_AGE: 18,
  YOUNG_MAX_AGE: 24,
  YOUNG_MULTIPLIER: 4,
  ADULT_MIN_AGE: 24,
  ADULT_MAX_AGE: 50,
  ADULT_MULTIPLIER: 3,
  SENIOR_MIN_AGE: 50,
  SENIOR_MULTIPLIER: 2,
};

const isOnAgeRangeAndCanPay = (
  proponentAge, incomeValue, valueMonthly, minAge, maxAge, incomeMultiplier,
) => (proponentAge >= minAge && proponentAge < maxAge
      && (incomeValue / incomeMultiplier) >= valueMonthly
);

const isSeniorAndCanPay = (
  proponentAge, incomeValue, valueMonthly, minAge, incomeMultiplier,
) => (proponentAge >= minAge && (incomeValue / incomeMultiplier) >= valueMonthly
);

//   Deve haver no mínimo 2 proponentes por proposta
const thereMustBeAtLeastTwoProponentPerProposal = (proponentList) => (!proponentList
  || Object.keys(proponentList).length < VALIDATE_VARIABLES.MIN_PROPONENT_COUNT);

const thereMustBeExactlyOneMainProponent = (proponentList) => {
  // Deve haver exatamente 1 proponente principal por proposta
  const mainProponentList = Object.values(proponentList).filter((prop) => prop.proponent_is_main === 'true');
  return (mainProponentList.length !== VALIDATE_VARIABLES.MAIN_PROPONENT_COUNT);
};

// Todos os Proponent devem ser maiores de 18 anos
const allProponentsMustBeOverEighteen = (proponentList) => Object.values(proponentList).some(
  (prop) => stringToNumber(prop.proponent_age) < VALIDATE_VARIABLES.MIN_AGE_PROPONENT,
);

/*
  A renda do proponente principal deve ser pelo menos:
  - 4 vezes o valor da parcela do empréstimo, se a idade dele for entre 18 e 24 anos
  - 3 vezes o valor da parcela do empréstimo, se a idade dele for entre 24 e 50 anos
  - 2 vezes o valor da parcela do empréstimo, se a idade dele for acima de 50 anos
*/
const mainProponentsIncomeValidation = (
  proponentAge, proponentMonthlyIncome, valueMonthlyInstallments,
) => {
  const youngConditional = isOnAgeRangeAndCanPay(
    stringToNumber(proponentAge),
    stringToNumber(proponentMonthlyIncome),
    valueMonthlyInstallments,
    VALIDATE_VARIABLES.YOUNG_MIN_AGE,
    VALIDATE_VARIABLES.YOUNG_MAX_AGE,
    VALIDATE_VARIABLES.YOUNG_MULTIPLIER,
  );
  const adultConditional = isOnAgeRangeAndCanPay(
    stringToNumber(proponentAge),
    stringToNumber(proponentMonthlyIncome),
    valueMonthlyInstallments,
    VALIDATE_VARIABLES.ADULT_MIN_AGE,
    VALIDATE_VARIABLES.ADULT_MAX_AGE,
    VALIDATE_VARIABLES.ADULT_MULTIPLIER,
  );
  const seniorConditional = isSeniorAndCanPay(
    stringToNumber(proponentAge),
    stringToNumber(proponentMonthlyIncome),
    valueMonthlyInstallments,
    VALIDATE_VARIABLES.SENIOR_MIN_AGE,
    VALIDATE_VARIABLES.SENIOR_MULTIPLIER,
  );
  return (!(youngConditional || adultConditional || seniorConditional));
};

const validate = (loan) => {
  //   Deve haver no mínimo 2 proponentes por proposta
  if (thereMustBeAtLeastTwoProponentPerProposal(loan.proponent.result)) {
    return false;
  }

  // Deve haver exatamente 1 proponente principal por proposta
  const mainProponentList = Object.values(loan.proponent.result).filter((prop) => prop.proponent_is_main === 'true');
  if (thereMustBeExactlyOneMainProponent(loan.proponent.result)) {
    return false;
  }
  // Todos os Proponent devem ser maiores de 18 anos
  if (allProponentsMustBeOverEighteen(loan.proponent.result)) {
    return false;
  }
  /*
    A renda do proponente principal deve ser pelo menos:
    - 4 vezes o valor da parcela do empréstimo, se a idade dele for entre 18 e 24 anos
    - 3 vezes o valor da parcela do empréstimo, se a idade dele for entre 24 e 50 anos
    - 2 vezes o valor da parcela do empréstimo, se a idade dele for acima de 50 anos
  */
  const numberMonthlyInstallments = stringToNumber(
    loan.proposal.result.proposal_number_of_monthly_installments,
  );
  const loanValue = stringToNumber(loan.proposal.result.proposal_loan_value);
  const valueMonthlyInstallments = loanValue / numberMonthlyInstallments;

  const mainProponentsConditional = mainProponentsIncomeValidation(
    mainProponentList[0].proponent_age,
    mainProponentList[0].proponent_monthly_income,
    valueMonthlyInstallments,
  );

  if (mainProponentsConditional) {
    return false;
  }

  return true;
};

// const RULES = {}

const executeAdded = (previousEvent, event) => {
  if (!previousEvent) {
    previousEvent = {};
  }
  previousEvent[event.proponent_id] = event;
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
  delete previousEvent[event.proponent_id];
  return previousEvent;
};

const executeActions = {
  added: executeAdded,
  updated: executeUpdated,
  removed: executeRemoved,
};
const execute = (events) => {
  events.reduce(
    (proponentExecutedObj, event) => executeActions[event.event_action](proponentExecutedObj),
  );
};

module.exports = {
  EVENT_SCHEMA_NAMES, execute, executeActions, validate,
};
