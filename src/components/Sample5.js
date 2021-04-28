import {useXFormState} from "../xformstate-react";
import {Input} from "./Input";
import {Form} from "./Form";
import {useState} from "react";
import {sleep} from "../helpers";

const InputWrap = ({field, label, id}) => {
    const onChange = (e) => {
        field.onChange(e.target.value)
    }

    return (
        <Input label={label} id={id} value={field.value} onChange={onChange} placeholder={label}
               error={field.error}/>)
}

const emailField = {
    name: 'email',
    rules: [
        {
            validator: (value) => Boolean(value),
            error: 'Required'
        },
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

const hasNumber = (value) => /\d/g.test(value);

const passwordField = {
    name: 'password',
    initialValue: '',
    rules: [
        {
            validator: (value) => Boolean(value),
            asyncValidator: async (value) => {
                await sleep(async () => {
                    if (!hasNumber(value)) {
                        await Promise.reject('Password should include number');
                    }
                })
            },
            error: 'Required'
        },
        {
            validator: (value) => value.length > 3,
            error: 'Too short'
        },
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


export const Sample5 = () => {
    const [submittedValue, setSubmittedValue] = useState(null);
    const submitForm = (contextForm) => {
        contextForm.id = Math.floor(Math.random() * 100);
        setSubmittedValue(contextForm)
    };

    const asyncFormValidator = async (contextForm) => {
        await sleep(() => {
            if (!contextForm.email.includes('@')) {
                throw Promise.reject('Email should have @');
            }
        });
    };
    const formOptions = {submitForm, asyncFormValidator}

    const [fields, formMeta] = useXFormState('auth-5', [emailField, passwordField, passwordRepeatField], formOptions);
    const {email, password, passwordRepeat} = fields;
    const {onSubmit, loading, error} = formMeta;

    const onFormSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    }

    return (
        <Form title={<>Использование все вместе</>} onSubmit={onFormSubmit}>
            <InputWrap label="Email" id="email" field={email}/>

            <InputWrap label="Password" id="password" field={password}/>

            <InputWrap label="Password repeat" id="password-2" field={passwordRepeat}/>

            <input type="submit" value="Submit" disabled={loading}/>

            {error && (
                <p style={{color: 'red', margin: 0}}>{error}</p>
            )}

            {loading && (
                <p style={{margin: 0, fontSize: 12}}>Requesting...</p>
            )}

            {submittedValue && (
                <pre>
                    {JSON.stringify(submittedValue)}
                </pre>
            )}
        </Form>
    )
}