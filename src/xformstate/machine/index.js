import {validateFieldName, validateFieldRules, validateFieldsArrayName} from "../validators";
import {assign, Machine} from "xstate";
import {getValueByName} from "../helpers";

const xFormMachine = (id, fields) => {
    const context = {};
    const validatorObject = {};
    const fieldsArrayName = [];

    fields.forEach(field => {
        const {name, initialValue, rules} = field;
        validateFieldName(name);
        validateFieldRules(rules);

        fieldsArrayName.push(name);

        context[name] = {
            value: initialValue ? initialValue : '',
            error: ''
        }

        validatorObject[name] = [];

        if (!rules) {
            return;
        }
        for (const rule of rules) {
            if (!rule.error) {
                rule.error = 'Incorrect value';
                console.warn('Missing error in rule of field. It will set \'Incorrect value\'');
            }
            validatorObject[name].push(rule)
        }
    });

    validateFieldsArrayName(fieldsArrayName);

    return Machine(
        {
            id: `formMachine-${id}`,
            initial: 'edit',
            context,
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
                                const errorObject = [];
                                const contextForm = {};

                                fieldsArrayName.forEach(name => {
                                    contextForm[name] = context[name].value;
                                });
                                fieldsArrayName.forEach(fieldName => {
                                    const fieldValue = getValueByName(context, fieldName);
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

                                if (errorObject.length) {
                                    reject(errorObject)
                                } else {
                                    resolve(true);
                                }
                            }),
                        onDone: {
                            target: "submit"
                        },
                        onError: {
                            target: "edit",
                            actions: assign((context, event) => {
                                const errorObject = {};

                                /**
                                 * eventData {
                                 *     name: fieldName
                                 *     error: errorText
                                 * }
                                 * */
                                event.data.forEach(errorData => {
                                    errorObject[errorData.name] = {
                                        error: errorData.error
                                    };
                                })

                                return errorObject
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
            }
        }
    )
}

export { xFormMachine }

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