import {useState, useEffect} from "react";
import {xFormMachine} from "../xformstate";
import {useMachine} from "@xstate/react";

const fields = {};
let formMeta = {};

const useXFormState = (id, fieldsOptions, formOptions) => {
    const [machine] = useState(() => xFormMachine(id, fieldsOptions, formOptions));
    const [state, send] = useMachine(machine);

    useEffect(() => {
        fieldsOptions.forEach((field) => {

            const {name} = field;
            fields[name] = {
                ...fields[name],
                onChange: (newValue) => {
                    send('TYPE', {name, value: newValue})
                },
            }
        });

        formMeta = {
            ...formMeta,
            onSubmit: () => send('VALIDATE'),
        }
    })

    fieldsOptions.forEach(field => {
        const {name} = field;
        const {value, error} = state.context[name];

        if (fields[name]) {
            fields[name].value = value;
            fields[name].error = error;
        } else {
            fields[name] = {
                ...fields[name],
                value,
                error,
            }
        }
    });

    formMeta.error = state.context.__formError;
    formMeta.loading = state.context.__loading;

    return [fields, formMeta];
}

export {useXFormState};