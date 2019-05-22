/** Enum for the function type. */
const TYPE = {
  DIRECT: 'direct',
  PROMISE: 'promise',
  CALLBACK: 'callback',
};

/**
 * This object can mock any object with functions. The mock supports direct
 * function calls, promise/async/await calls, callback calls, and throwing
 * errors for all three of those scenarios.
 */
class GenericMock {
  /** Constructor. */
  constructor() {
    this.__responses = {};
    this.__calls = [];
  }

  /**
   * Worker method for adding mocked function calls.
   * @param {String} methodPath The property path to the mocked function.
   * @param {*} response The return object for the test function.
   * @param {String} type Direct, promise, or callback function type.
   * @param {Boolean} throwError If the mocked function should throw an error.
   */
  addTestResponse(methodPath, response, type, throwError) {
    let methodPtr = this;
    let responsePtr = this.__responses;
    methodPath.split('.').forEach((path, i, arr) => {
      if (i == arr.length - 1) {
        methodPtr[path] =
          this.__responseFactory(methodPath, type);
        if (!responsePtr[path]) {
          responsePtr[path] = [];
        }
        responsePtr[path].push({response: response, throwError: throwError});
      } else {
        methodPtr[path] = methodPtr[path] || {};
        responsePtr[path] = responsePtr[path] || {};

        methodPtr = methodPtr[path];
        responsePtr = responsePtr[path];
      }
    });
  }

  /**
   * Wrapper for direct responses.
   * @param {String} methodPath The property path to the mocked function.
   * @param {*} response The return object for the test function.
   * @return {void}
   */
  addDirectResponse(methodPath, response) {
    return this.addTestResponse(methodPath, response, TYPE.DIRECT, false);
  }

  /**
   * Wrapper for direct responses.
   * @param {String} methodPath The property path to the mocked function.
   * @param {*} errorMsg The Error thrown by the test function.
   * @return {void}
   */
  addDirectThrow(methodPath, errorMsg) {
    return this.addTestResponse(methodPath, errorMsg, TYPE.DIRECT, true);
  }

  /**
   * Wrapper for promise responses.
   * @param {String} methodPath The property path to the mocked function.
   * @param {*} response The return object for the test function.
   * @return {void}
   */
  addPromiseResponse(methodPath, response) {
    return this.addTestResponse(methodPath, response, TYPE.PROMISE, false);
  }

  /**
   * Wrapper for promise rejections.
   * @param {String} methodPath The property path to the mocked function.
   * @param {*} errorMsg The Error rejected by the test function.
   * @return {void}
   */
  addPromiseThrow(methodPath, errorMsg) {
    return this.addTestResponse(methodPath, errorMsg, TYPE.PROMISE, true);
  }

  /**
   * Wrapper for callback responses.
   * @param {String} methodPath The property path to the mocked function.
   * @param {*} response The return object for the test function.
   * @return {void}
   */
  addCallbackResponse(methodPath, response) {
    return this.addTestResponse(methodPath, response, TYPE.CALLBACK, false);
  }

  /**
   * Wrapper for callback error calls.
   * @param {String} methodPath The property path to the mocked function.
   * @param {*} errorMsg The Error passed as the callback error argument.
   * @return {void}
   */
  addCallbackThrow(methodPath, errorMsg) {
    return this.addTestResponse(methodPath, errorMsg, TYPE.CALLBACK, true);
  }

  /**
   * Returns an array of calls and arguments made to the mock object.
   * @return {Array} Each call to the mock object, along with arguments.
   */
  getMockCalls() {
    return this.__calls;
  }

  /**
   * Returns the value at the end of a property path.
   * @param {Object} obj The object to traverse.
   * @param {String} path The dot-separated path to the desired value.s
   * @return {*} The value at the property path.
   */
  __reach(obj, path) {
    if (typeof path == 'string') {
      path = path.split('.');
    }

    return path[1] ?
        this.__reach(obj[path[0]], path.slice(1, path.length)) :
        obj[path[0]];
  }

  /**
   * Worker method for generating responses or throwing errors.
   * @param {String} methodPath The property path to the mocked function.
   * @param {String} type Direct, promise, or callback function type.
   * @return {void}
   */
  __responseFactory(methodPath, type) {
    return function(...args) {
      this.__calls.push({
        method: methodPath,
        arguments: args.slice(),
      });

      let cbArr;
      const responses = this.__reach(this.__responses, methodPath);
      if (responses.length) {
        const {response: response, throwError: throwError} = responses.shift();
        if (throwError) {
          switch (type) {
            case TYPE.DIRECT:
              throw new Error(response);
            case TYPE.PROMISE:
              return Promise.reject(response);
            case TYPE.CALLBACK:
              // Assumes the callback is the final argument.
              cbArr = Array.from(...args)
                  .filter((a) => typeof a == 'function');
              cbArr[cbArr.length - 1].call(null, response);
              return;
          }
        } else {
          switch (type) {
            case TYPE.DIRECT:
              return response;
            case TYPE.PROMISE:
              return Promise.resolve(response);
            case TYPE.CALLBACK:
              // Assumes the callback is the final argument.
              cbArr = Array.from(...args)
                  .filter((a) => typeof a == 'function');
              cbArr[cbArr.length - 1].call(null, null, response);
              return;
          }
        }
      } else {
        throw new Error(`No test response found for: ${methodPath}`);
      }
    }.bind(this);
  }
}

exports.GenericMock = GenericMock;
