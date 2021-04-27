import {useXFormState} from "../xformstate-react";
import {sleep} from "../helpers";


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
            if (contextForm.email.length < 3) {
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


export const Sample1 = () => {
    const [fields, formMeta] = useXFormState('auth-1', [emailField, passwordField], formOptions);
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
        <div>
            <form onSubmit={onFormSubmit}>
                <input type="text" value={email.value} onChange={onChangeEmail} placeholder="email"/>
                <p style={{color: 'red'}}>{email.error}</p>

                <input type="text" value={password.value} onChange={onChangePassword}
                       placeholder="password"/>
                <p style={{color: 'red'}}>{password.error}</p>

                <input type="submit" value="Submit" disabled={loading}/>
                <p style={{color: 'red'}}>{error}</p>
            </form>
        </div>
    )
}