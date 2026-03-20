const { AppnestFunctions, ResultData } = require('@aravinthan_p/appnest-sdk-utils');

const function1 = async () => {
  console.log("function1 is invoked");
  await AppnestFunctions.sampleFunction();
  return {
    "key1": "value1",
    "key2": "value2"
  }
};

const function2 = async () => {
  console.log("function2 is invoked");
  return new ResultData({
    body: { message: 'Function 2 executed successfully..!!@@@@!!.' },
    statusCode: 200,
  });
};

module.exports = { function1, function2 };