export default class HelperClass {
  static sleepNow = async (delay) =>
    new Promise((resolve) => setTimeout(resolve, delay));
}
