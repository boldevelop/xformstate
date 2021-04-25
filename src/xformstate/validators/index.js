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
            if (!rule.validator) {
                throw Error('Missing validator in rule.');
            }
            if (!isFunction(rule.validator)) {
                throw TypeError(`Rules validator should be callable. Validator: ${typeof rule.validator}`);
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

export {
    validateFieldName,
    validateFieldRules,
    validateFieldsArrayName,
}