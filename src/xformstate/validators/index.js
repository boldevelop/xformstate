import {isArray, isFunction, isString} from "xstate/es/utils";

const validateFieldName = (name) => {
    if (!isString(name)) {
        throw TypeError(`Name should be a string. Name: ${name}`);
    }
    if (!name) {
        throw Error('Name shouldn\'t be empty.');
    }
}

const validateFieldRules = (rules) => {
    if (!rules) {
        return;
    }
    if (!isArray(rules)) {
        throw TypeError(`Rules should be an array. Rules type: ${typeof rules}`);
    }
    if (rules.length) {
        for (const rule of rules) {
            if (!rule.validator && !rule.asyncValidator) {
                throw Error('Missing validator/asyncValidator in rule.');
            }

            if (rule.validator && !isFunction(rule.validator)) {
                throw TypeError(`Validator should be callable. Validator: ${typeof rule.validator}`);
            }

            if (rule.asyncValidator && !isFunction(rule.asyncValidator)) {
                throw TypeError(`AsyncValidator should be callable. Validator: ${typeof rule.asyncValidator}`);
            }
        }
    }
}

const validateFieldsArrayName = (fieldsArrayName) => {
    const fieldsArrayNameValidated = [...new Set(fieldsArrayName)];

    if (fieldsArrayNameValidated.length !== fieldsArrayName.length) {
        throw Error('Fields should have uniq name.');
    }
}

const validateAsyncFormValidator = (asyncFormValidator) => {
    if (asyncFormValidator && !isFunction(asyncFormValidator)) {
        throw TypeError(`AsyncFormValidator should be callable. AsyncFormValidator: ${typeof asyncFormValidator}`);
    }
}

export {
    validateFieldName,
    validateFieldRules,
    validateFieldsArrayName,
    validateAsyncFormValidator,
}