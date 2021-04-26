const formErrorObjectFromResponse = (errorObject, ruleError, fieldName) => {
    let error = ruleError;
    if (typeof errorObject === 'string') {
        error = errorObject;
    }
    if (typeof errorObject.error === 'object') {
        error = errorObject.error.message;
    }

    return [{
        name: fieldName,
        error,
    }]
}

export {formErrorObjectFromResponse};