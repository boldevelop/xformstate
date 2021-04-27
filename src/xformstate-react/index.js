import {useState} from "react";
import {xFormMachine} from "../xformstate";
import {useMachine} from "@xstate/react";

/**
 * @typedef {{ value: string, error: string, onChange: function(string): void }} Field
 * */

/**
 * The field option
 * @typedef {Record<string, Field>} Fields
 */

/**
 * The field option
 * @typedef {{ error: string, loading: boolean, onSubmit: function(): void }} FormMeta
 */

/**
 * Hook for creat form with xstate
 * @param {string} id - create xstate id: `formMachine-${id}`
 * @param {FieldOption[]} fieldsOptions - {@link FieldOption}
 * @param {FormOptions} [formOptions] -{@link FormOptions}
 * @return {[Fields, FormMeta]}
 * */
const useXFormState = (id, fieldsOptions, formOptions) => {
    const [machine] = useState(() => xFormMachine(id, fieldsOptions, formOptions));
    const [state, send] = useMachine(machine);

    const fields = {};
    const formMeta = {};

    fieldsOptions.forEach((field) => {

        const {name} = field;
        const {value, error} = state.context[name];
        fields[name] = {
            onChange: (newValue) => {
                send('TYPE', {name, value: newValue})
            },
            value,
            error,
        }
    });

    formMeta.onSubmit = () => send('VALIDATE');
    formMeta.error = state.context.__formError;
    formMeta.loading = state.context.__loading;

    return [fields, formMeta];
}

export {useXFormState};