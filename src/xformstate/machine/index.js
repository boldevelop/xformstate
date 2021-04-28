import {assign, Machine} from "xstate";
import {
    validateAsyncFormValidator,
    validateFieldName,
    validateFieldRules,
    validateFieldsArrayName
} from "../validators";
import {
    formContextFormForValidate,
    formErrorObjectByValidate,
    formErrorObjectByValidateAsync,
    formErrorObjectFromResponse
} from "../helpers";
import {getTargets} from "./targetMachine";

/**
 * The second argument of callback, contain form state with value
 * @typedef {Record<string, string>} ContextForm
 *
 */

/**
 * Callback which will be fired when your field will start validate.
 * If the field is correct, return true otherwise false
 * @callback validatorCallback
 * @param {string} value
 * @param {ContextForm} contextForm
 * @return {bool}
 */

/**
 * Callback which will be fired
 * after synchronous validation of all fields.
 * If field has error throw error, string or reject Promise.
 * In case of a failed validation, next asyncValidator will not be called
 * @callback asyncValidatorCallback
 * @param {string} value
 * @param {ContextForm} contextForm
 * @return {Promise<void>}
 */

/**
 * Callback which will be fired
 * after synchronous validation and async validation field, if all passes.
 * If field has error throw error, string or reject Promise.
 * @callback asyncFormValidatorCallback
 * @param {ContextForm} contextForm
 * @return {Promise<void>}
 */

/**
 * Callback which will be fired
 * after synchronous validation, async validation field, and async Form Validation.
 * @callback submitFormCallback
 * @param {ContextForm} contextForm
 * @return {void}
 */

/**
 * Rule of validation field
 * @typedef {Object} ValidateRule
 * @property {string} error - The failed field validation text by validator
 * @property {validatorCallback} [validator] - callback which will be fired when your field will start validate.
 * If the field is correct, return true otherwise false
 * @property {asyncValidatorCallback} [asyncValidator] - callback which will be fired
 * after synchronous validation of all fields.
 * If field has error throw error, string or reject Promise.
 * In case of a failed validation, next asyncValidator will not be called
 *
 */

/**
 * The field option
 * @typedef {Object} FieldOption
 * @property {string} name - The name of the field
 * @property {string} [initialValue] - Initial value of the field
 * @property {ValidateRule[]} [rules] {@link ValidateRule}
 */

/**
 * The form option
 * @typedef {Object} FormOptions
 * @property {asyncFormValidatorCallback} [asyncFormValidator]
 * @property {submitFormCallback} [submitForm]
 * */

const xFormMachine = (id, fields, {asyncFormValidator, submitForm}) => {
    /** initial setup */
    validateAsyncFormValidator(asyncFormValidator);

    const contextMachine = {
        __loading: false,
        __formError: '',
    };
    const validatorObject = {};
    const validatorAsyncObject = {};
    const fieldsArrayName = [];
    let withAsyncValidator = false;
    let withAsyncFormValidator = Boolean(asyncFormValidator);

    fields.forEach(field => {
        const {name, initialValue, rules} = field;
        validateFieldName(name);
        validateFieldRules(rules);

        fieldsArrayName.push(name);

        /** form context for each field name
         *  fieldName: {
         *      value: inputValue,
         *      error: current field error text
         *  }
         *
         * */
        contextMachine[name] = {
            value: initialValue ? initialValue : '',
            error: ''
        }

        /** form validator and async validator Objects from rules for each field name
         * fieldName: [{
         *     validator: function,
         *     error: errorText, when error occurred
         * }]
         * */
        validatorObject[name] = [];
        validatorAsyncObject[name] = [];

        if (!rules) {
            return;
        }
        for (const rule of rules) {
            if (rule.asyncValidator) {
                validatorAsyncObject[name].push({
                    validator: rule.asyncValidator,
                });
                withAsyncValidator = true;
            }
            if (!rule.error) {
                rule.error = 'Incorrect value';
                console.warn('Missing error in rule of field. It will set: \'Incorrect value\'');
            }
            validatorObject[name].push({
                validator: rule.validator,
                error: rule.error,
            });
        }
    });

    validateFieldsArrayName(fieldsArrayName);

    /** setup validators and state */
    const targets = getTargets(withAsyncValidator, withAsyncFormValidator);

    const validateFields = async (context) => {
        const contextForm = formContextFormForValidate(context, fieldsArrayName);
        const errorObject = formErrorObjectByValidate(contextForm, fieldsArrayName, validatorObject);

        if (errorObject.length) {
            await Promise.reject(errorObject);
        }
    }

    const validateAsyncFields = async (context) => {
        const contextForm = formContextFormForValidate(context, fieldsArrayName);

        try {
            await formErrorObjectByValidateAsync(contextForm, fieldsArrayName, validatorAsyncObject);
        } catch (e) {
            await Promise.reject(e);
        }
    }

    const validateAsyncForm = async (context) => {
        const contextForm = formContextFormForValidate(context, fieldsArrayName);
        try {
            await asyncFormValidator(contextForm);
        } catch (e) {
            await Promise.reject(formErrorObjectFromResponse(await e, '', '')[0].error);
        }
    }

    const validateAsyncState = {
        validateAsync: {
            invoke: {
                id: 'validateAsyncFields',
                src: validateAsyncFields,
                onDone: {
                    target: targets.validateAsync
                },
                onError: {
                    target: "edit",
                    actions: ['onErrorValidate'],
                }
            }
        }
    }

    const asyncFormValidatorState = {
        asyncFormValidator: {
            invoke: {
                id: 'asyncFormValidator',
                src: validateAsyncForm,
                onDone: {
                    target: "submit",
                },
                onError: {
                    target: "edit",
                    actions: ['onFormErrorValidate'],
                }
            }
        }
    }

    return Machine(
        {
            id: `formMachine-${id}`,
            initial: 'edit',
            context: contextMachine,
            states: {
                edit: {
                    entry: ['removeLoading'],
                    exit: ['setLoading'],
                    on: {
                        VALIDATE: {
                            target: 'validate'
                        }
                    }
                },
                validate: {
                    invoke: {
                        id: 'validateFields',
                        src: validateFields,
                        onDone: {
                            target: targets.validate,
                        },
                        onError: {
                            target: "edit",
                            actions: ['onErrorValidate'],
                        }
                    }
                },
                ...(withAsyncValidator ? validateAsyncState : []),
                ...(withAsyncFormValidator ? asyncFormValidatorState : []),
                submit: {
                    always: {
                        actions: ['submit'],
                        target: 'edit'
                    }
                }
            },
            on: {
                TYPE: {
                    actions: ['edit']
                },
                CLEAR: {
                    actions: ['clearValues'],
                }
            }
        },
        {
            actions: {
                clearValues: assign((context, event) => {
                    const newContext = {};
                    if (context.__loading) {
                        return;
                    }

                    fieldsArrayName.forEach(fieldName => {
                        newContext[fieldName] = {
                            value: '',
                            error: '',
                        }
                    });
                    return newContext;
                }),
                edit: assign((context, event) => {
                    if (context.__loading) {
                        return;
                    }
                    return ({
                        [event.name]: {
                            value: event.value,
                            error: '',
                        }
                    })
                }),
                submit: assign((context) => {
                    if (submitForm) {
                        submitForm(formContextFormForValidate(context, fieldsArrayName))
                    }
                }),
                onErrorValidate: assign((context, event) => {
                    const contextWithErrorMessage = {};
                    /**
                     * eventData {
                     *     name: fieldName
                     *     error: errorText
                     * }
                     * */
                    event.data.forEach(errorData => {
                        contextWithErrorMessage[errorData.name] = {
                            error: errorData.error,
                            value: context[errorData.name].value
                        };
                    })

                    return contextWithErrorMessage
                }),
                onFormErrorValidate: assign((context, event) => ({
                    __formError: event.data,
                })),
                removeLoading: (assign(() => ({__loading: false}))),
                setLoading: (assign(() => ({__loading: true, __formError: ''}))),
            }
        }
    )
}

export {xFormMachine}
