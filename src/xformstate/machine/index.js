import {validateFieldName, validateFieldRules, validateFieldsArrayName} from "../validators";
import {assign, Machine} from "xstate";

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
                let error = rule.error;
                if (typeof errorObject === 'string') {
                    error = errorObject;
                }
                if (typeof errorObject.error === 'object') {
                    error = errorObject.error.message;
                }

                await Promise.reject([{
                    name: fieldName,
                    error,
                }]);
            }
        }
    }

    return [];
}

const xFormMachine = (id, fields) => {
    const contextMachine = {};
    const validatorObject = {};
    const validatorAsyncObject = {};
    const fieldsArrayName = [];
    let withAsyncValidator = false;

    fields.forEach(field => {
        const {name, initialValue, rules} = field;
        validateFieldName(name);
        validateFieldRules(rules);

        fieldsArrayName.push(name);

        contextMachine[name] = {
            value: initialValue ? initialValue : '',
            error: ''
        }

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

    const validateAsync = {
        validateAsync: {
            invoke: {
                id: 'validateAsyncFields',
                src: validateAsyncFields,
                onDone: {
                    target: "submit"
                },
                onError: {
                    target: "edit",
                    actions: ['onErrorValidate'],
                }
            }
        }
    }

    const validateTarget = withAsyncValidator ? 'validateAsync' : "submit";

    return Machine(
        {
            id: `formMachine-${id}`,
            initial: 'edit',
            context: contextMachine,
            states: {
                edit: {
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
                            target: validateTarget,
                        },
                        onError: {
                            target: "edit",
                            actions: ['onErrorValidate'],
                        }
                    }
                },
                ...(withAsyncValidator ? validateAsync : []),
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
            }
        },
        {
            actions: {
                // action implementations
                edit: assign((context, event) => {
                    return ({
                        [event.name]: {
                            value: event.value,
                            error: '',
                        }
                    })
                }),
                submit: assign((context, event) => {
                    console.log('submit', context);
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
                        contextWithErrorMessage[errorData.name] = { error: errorData.error };
                    })

                    return contextWithErrorMessage
                }),
            }
        }
    )
}

export {xFormMachine}

/** sample
 {
        id: 'formMachine',
        initial: 'edit',
        context: {
            email: {
                value: '',
                error: '',
            },
            password: {
                value: '',
                error: '',
            }
        },
        states: {
            edit: {
                on: {
                    VALIDATE: {
                        target: 'validate'
                    }
                }
            },
            validate: {
                invoke: {
                    id: 'validateFields',
                    src: (context, event) =>
                        new Promise((resolve, reject) => {
                            console.log('validateFields');
                            if (context.email.value.includes('@')) {
                                resolve(true);
                            } else {
                                reject(`Error for number ${context.value} `)
                            }
                        }),
                    onDone: {
                        target: "submit"
                    },
                    onError: {
                        target: "edit",
                        actions: assign((context, event) => {
                            console.log('onError action', event);
                            return {
                                email: {
                                    error: 'not valid email',
                                }
                            }
                        }),
                    }
                }
            },
            submit: {
                on: {
                    '': {
                        actions: ['submit'],
                        target: 'edit'
                    },
                }
            }
        },
        on: {
            TYPE: {
                actions: ['edit']
            },
        }
    },
 {
        actions: {
            // action implementations
            edit: assign((context, event) => {
                console.log(event);
                return ({
                    [event.name]: {
                        value: event.value,
                        error: '',
                    }
                })
            }),
            submit: assign((context, event) => {
                console.log('submit', context);
            }),
        },
        guards: {
            validateEmail: (context, event) => {
                return context.email.value.includes('@');
            },
        }
 * */