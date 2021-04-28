import {useXFormState} from "../xformstate-react";
import {sleep} from "../helpers";
import {Input} from "./Input";
import {Form} from "./Form";
import {useState} from "react";

const emailField = {
    name: 'email',
    rules: [
        {
            validator: (value) => {
                return value.includes('@')
            },
            asyncValidator: async (value) => {
                await sleep(async () => {
                    if (value.length < 5) {
                        await Promise.reject('Email is exist');
                    }
                })
            },
            error: 'Email should have @'
        }
    ],
}

const passwordField = {
    name: 'password',
    initialValue: '',
    rules: [
        {
            validator: (value) => Boolean(value),
            error: 'Required'
        },
        {
            validator: (value) => value.length > 3,
            error: 'Too short'
        }
    ],
}

export const Sample1 = () => {
    const [submittedValue, setSubmittedValue] = useState(null);
    const submitForm = (contextForm) => setSubmittedValue(contextForm);

    const [fields, formMeta] = useXFormState('auth-1', [emailField, passwordField], { submitForm });
    const { email, password } = fields;
    const { onSubmit, loading } = formMeta;

    const onChangeEmail = (e) => {
        email.onChange(e.target.value);
    }

    const onChangePassword = (e) => {
        password.onChange(e.target.value);
    }

    const onFormSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    }

    return (
        <Form title={<>Асинхронная проверка поля email, с помощью <b>asyncValidator</b></>} onSubmit={onFormSubmit}>
            <Input label="Email" id="email" value={email.value} onChange={onChangeEmail} placeholder="email" error={email.error}/>
            {loading && (
                <p style={{ margin: 0, fontSize: 12 }}>Requesting...</p>
            )}
            <Input label="Password" id="password" value={password.value} onChange={onChangePassword} placeholder="password" error={password.error}/>

            <input type="submit" value="Submit" disabled={loading}/>

            {submittedValue && (
                <pre>
                    {JSON.stringify(submittedValue)}
                </pre>
            )}
        </Form>
    )
}