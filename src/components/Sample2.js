import {useXFormState} from "../xformstate-react";
import {Input} from "./Input";
import {useState} from "react";
import {Form} from "./Form";

const emailField = {
    name: 'email',
    rules: [
        {
            validator: (value) => value.includes('@'),
            error: 'Email should have @'
        }
    ],
}

const passwordField = {
    name: 'password',
    initialValue: '',
    rules: [
        {
            validator: (value) => value.length > 3,
            error: 'Too short password'
        }
    ],
}

const passwordRepeatField = {
    name: 'passwordRepeat',
    initialValue: '',
    rules: [
        {
            validator: (value, contextForm) => value === contextForm.password,
            error: 'Passwords do not match'
        }
    ],
}

export const Sample2 = () => {
    const [submittedValue, setSubmittedValue] = useState(null);
    const submitForm = (contextForm) => setSubmittedValue(contextForm);

    const [fields, formMeta] = useXFormState('auth-2', [emailField, passwordField, passwordRepeatField], {submitForm});
    const {email, password, passwordRepeat} = fields;
    const {onSubmit, loading} = formMeta;

    const onChangeEmail = (e) => {
        email.onChange(e.target.value);
    }

    const onChangePassword = (e) => {
        password.onChange(e.target.value);
    }

    const onChangeRepeatPassword = (e) => {
        passwordRepeat.onChange(e.target.value);
    }

    const onFormSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    }

    return (
        <Form title={<>Связанные поля, с использованием 2 аргумента в <b>validator</b></>} onSubmit={onFormSubmit}>
            <Input label="Email" id="email" value={email.value} onChange={onChangeEmail} placeholder="email"
                   error={email.error}/>

            <Input label="Password" id="password" value={password.value} onChange={onChangePassword}
                   placeholder="password" error={password.error}/>

            <Input label="Password repeat" id="password-2" value={passwordRepeat.value}
                   onChange={onChangeRepeatPassword} placeholder="repeat password" error={passwordRepeat.error}/>

            <input type="submit" value="Submit" disabled={loading}/>

            {submittedValue && (
                <pre>
                    {JSON.stringify(submittedValue)}
                </pre>
            )}
        </Form>
    )
}