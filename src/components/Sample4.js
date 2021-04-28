import {useXFormState} from "../xformstate-react";
import {Input} from "./Input";
import {Form} from "./Form";
import {useState} from "react";
import {sleep} from "../helpers";


const emailField = {
    name: 'email',
    initialValue: 'xFormState'
}


const code = `
const asyncFormValidator = async (contextForm) => {
  await sleep(() => {
    if (!contextForm.email.includes('@')) {
      throw Promise.reject('Email should have @');
    }
  });
};

`;

export const Sample4 = () => {
    const [submittedValue, setSubmittedValue] = useState(null);
    const submitForm = (contextForm) => {
        setSubmittedValue(contextForm)
    };

    const asyncFormValidator = async (contextForm) => {
        await sleep(() => {
            if (!contextForm.email.includes('@')) {
                throw Promise.reject('Email should have @');
            }
        });
    };
    const formOptions = { submitForm, asyncFormValidator }

    const [fields, formMeta] = useXFormState('auth-4', [emailField], formOptions);
    const { email } = fields;
    const { onSubmit, loading, error } = formMeta;

    const onChangeEmail = (e) => {
        email.onChange(e.target.value);
    }

    const onFormSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    }

    return (
        <Form
            title={<>Асинхронная валидация формы<br/> с помощью <b>asyncFormValidator</b></>}
            onSubmit={onFormSubmit}
            code={code}
        >
            <Input label="Email" id="email" value={email.value} onChange={onChangeEmail} placeholder="email" error={email.error}/>

            <input type="submit" value="Submit" disabled={loading}/>
            {error && (
                <p style={{color: 'red', margin: 0}}>{error}</p>
            )}

            {loading && (
                <p style={{ margin: 0, fontSize: 12 }}>Requesting...</p>
            )}
            {submittedValue && (
                <pre>
                    {JSON.stringify(submittedValue)}
                </pre>
            )}
        </Form>
    )
}