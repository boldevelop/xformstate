import {useXFormState} from "../xformstate-react";
import {sleep} from "../helpers";
import {Input} from "./input";


const emailField = {
    name: 'email',
    rules: [
        {
            validator: (value, contextForm) => {
                console.log('contextForm', contextForm)
                return value.includes('@')
            },
            asyncValidator: async (value, contextForm) => {
                await sleep(async () => {
                    if (value.length < 3) {
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
            validator: (value) => value.length > 3,
            error: 'Too short'
        }
    ],
}

const formOptions = {
    asyncFormValidator: async (contextForm) => {
        await sleep(() => {
            if (contextForm.password.length < 5) {
                throw Promise.reject('Too short password');
            } else {
                return ({
                    data: 'Welcome friend'
                });
            }
        });
    },
    submitForm: (contextForm) => {
        console.log('Submitted values: ', contextForm)
    }
}


export const Sample1 = ({ id }) => {
    const [fields, formMeta] = useXFormState('auth-1' + id, [emailField, passwordField], formOptions);
    const { email, password } = fields;
    const { onSubmit, error, loading } = formMeta;

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
        <div style={{ marginBottom: '1rem' }}>
            <form onSubmit={onFormSubmit}>
                <Input label="Email" id="email" value={email.value} onChange={onChangeEmail} placeholder="email" error={email.error}/>

                <Input label="Password" id="password" value={password.value} onChange={onChangePassword} placeholder="password" error={password.error}/>

                <input type="submit" value="Submit" disabled={loading}/>
                <p style={{color: 'red', margin: 0}}>{error}</p>
            </form>
        </div>
    )
}