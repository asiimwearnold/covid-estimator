const covid19ImpactEstimator = (data) => {
  const impact = { currentlyInfected: data.reportedCases * 10 };
  const severeImpact = { currentlyInfected: data.reportedCases * 50 };

  let nOfDays;

  if (data.periodType === 'days') {
    nOfDays = data.timeToElapse;
  } else if (data.periodType === 'weeks') {
    nOfDays = data.timeToElapse * 7;
  } else {
    nOfDays = data.timeToElapse * 30;
  }

  const xPower = Math.trunc(nOfDays / 3);

  const infectionsByRequestedTime = [
    impact.currentlyInfected * 2 ** xPower,
    severeImpact.currentlyInfected * 2 ** xPower
  ];

  const severeCasesByRequestedTime = [
    0.15 * infectionsByRequestedTime[0],
    0.15 * infectionsByRequestedTime[1]
  ];

  const hospitalBedsByRequestedTime = {};
  hospitalBedsByRequestedTime.va1 = Math.trunc(
    0.35 * data.totalHospitalBeds - severeCasesByRequestedTime[0]
  );

  hospitalBedsByRequestedTime.va2 = Math.trunc(
    0.35 * data.totalHospitalBeds - severeCasesByRequestedTime[1]
  );

  // challenge three
  const casesForICUByRequestedTime = {};
  const casesForVentilatorsByRequestedTime = {};
  const dollarsInFlight = {};

  const totalAmtMoneyForMajority = data.region.avgDailyIncomePopulation
    * data.region.avgDailyIncomeInUSD;

  casesForICUByRequestedTime.val1 = Math.trunc(
    infectionsByRequestedTime[0] * 0.05
  );
  casesForICUByRequestedTime.val2 = Math.trunc(
    infectionsByRequestedTime[1] * 0.05
  );

  casesForVentilatorsByRequestedTime.val1 = Math.trunc(
    infectionsByRequestedTime[0] * 0.02
  );
  casesForVentilatorsByRequestedTime.val2 = Math.trunc(
    infectionsByRequestedTime[1] * 0.02
  );

  // (infectionsByRequestedTime x 0.65 x 1.5) / 30;

  dollarsInFlight.val1 = Math.trunc(
    (infectionsByRequestedTime[0] * totalAmtMoneyForMajority) / nOfDays
  );
  dollarsInFlight.val2 = Math.trunc(
    (infectionsByRequestedTime[1] * totalAmtMoneyForMajority) / nOfDays
  );

  return {
    data,
    impact: {
      currentlyInfected: impact,
      infectionsByRequestedTime: infectionsByRequestedTime[0],
      severeCasesByRequestedTime: severeCasesByRequestedTime[0],
      hospitalBedsByRequestedTime: hospitalBedsByRequestedTime.va1,
      casesForICUByRequestedTime: casesForICUByRequestedTime.val1,
      casesForVentilatorsByRequestedTime:
        casesForVentilatorsByRequestedTime.val1,
      dollarsInFlight: dollarsInFlight.val1
    },
    severeImpact: {
      currentlyInfected: severeImpact,
      infectionsByRequestedTime: infectionsByRequestedTime[1],
      severeCasesByRequestedTime: severeCasesByRequestedTime[1],
      hospitalBedsByRequestedTime: hospitalBedsByRequestedTime.va2,
      casesForICUByRequestedTime: casesForICUByRequestedTime.val2,
      casesForVentilatorsByRequestedTime:
        casesForVentilatorsByRequestedTime.val2,
      dollarsInFlight: dollarsInFlight.val2
    }
  };
};

export default covid19ImpactEstimator;
