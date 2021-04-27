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


const formContextFormForValidate = (context, fieldsArrayName) => {
    const contextForm = {};

    fieldsArrayName.forEach(name => {
        contextForm[name] = context[name].value;
    });

    return contextForm;
}

const formErrorObjectByValidate = (contextForm, fieldsArrayName, validatorObject) => {
    const errorObject = [];

    fieldsArrayName.forEach(fieldName => {
        const fieldValue = contextForm[fieldName];
        const rules = validatorObject[fieldName];

        for (const rule of rules) {
            if (!rule.validator(fieldValue ? fieldValue : '', contextForm)) {
                errorObject.push({
                    name: fieldName,
                    error: rule.error,
                });
                break;
            }
        }
    })

    return errorObject;
}

const formErrorObjectByValidateAsync = async (contextForm, fieldsArrayName, validatorAsyncObject) => {
    for (const fieldName of fieldsArrayName) {
        const fieldValue = contextForm[fieldName];
        const rules = validatorAsyncObject[fieldName];

        for (const rule of rules) {
            try {
                await rule.validator(fieldValue ? fieldValue : '', contextForm)
            } catch (errorObject) {
                await Promise.reject(formErrorObjectFromResponse(errorObject, rule.error, fieldName));
            }
        }
    }

    return [];
}

export {
    formErrorObjectFromResponse,
    formContextFormForValidate,
    formErrorObjectByValidate,
    formErrorObjectByValidateAsync,
};