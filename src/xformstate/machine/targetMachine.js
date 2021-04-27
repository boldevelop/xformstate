import {assign, interpret, Machine} from "xstate";

const getTargets = (withAsyncValidator, withAsyncFormValidator) => {
    const targetMachine = Machine({
        id: '_target-machine',
        initial: 'noValidators',
        context: {
            validate: 'submit',
            validateAsync: 'submit',
        },
        states: {
            noValidators: {
                on: {
                    ASYNC_VALIDATOR: 'onlyAsyncValidator',
                    ASYNC_FORM_VALIDATOR: 'onlyAsyncFormValidator',
                }
            },
            onlyAsyncValidator: {
                entry: assign(() => ({
                    validate: 'validateAsync',
                    validateAsync: 'submit',
                })),
                on: {
                    ASYNC_FORM_VALIDATOR: 'allValidators'
                }
            },
            onlyAsyncFormValidator: {
                entry: assign(() => ({
                    validate: 'asyncFormValidator',
                    validateAsync: 'submit',
                })),
                on: {
                    ASYNC_VALIDATOR: 'allValidators'
                }
            },
            allValidators: {
                entry: assign(() => ({
                    validate: 'validateAsync',
                    validateAsync: 'asyncFormValidator',
                })),
            }
        }
    });

    const service = interpret(targetMachine);
    service.start();

    if (withAsyncValidator) {
        service.send('ASYNC_VALIDATOR');
    }

    if (withAsyncFormValidator) {
        service.send('ASYNC_FORM_VALIDATOR');
    }

    return service.state.context;
}

export { getTargets };