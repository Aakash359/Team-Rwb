export function getElasticValues(elasticResult) {
  let cleanedValues = [];
  for (let i = 0; i < elasticResult.length; i++) {
    cleanedValues.push(elasticResult[i]['_source']);
  }
  return cleanedValues;
}
