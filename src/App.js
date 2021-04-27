import './App.css';
import {xFormMachine} from './xformstate';
import {useMachine} from "@xstate/react";
import {useXFormState} from "./xformstate-react";

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sleep(fn, s = 1, ...args) {
    await timeout(s * 1000);
    return fn(...args);
}

const formMachine = xFormMachine('auth', [{
    name: 'email',
    rules: [
        {
            validator: (value, contextForm) => {
                console.log('contextForm', contextForm)
                return value.includes('@')
            },
            asyncValidator: async (value, contextForm) => {
                await sleep(() => {
                    if (value.length < 3) {
                        throw 'Email is exist';
                    }
                })
            },
            error: 'Email should have @'
        }
    ],
}, {
    name: 'password',
    initialValue: '',
    rules: [
        {
            validator: (value) => value.length > 6,
            error: 'Too short'
        }
    ],
}], {
    asyncFormValidator: async (contextForm) => {
        await sleep(() => {
            if (contextForm.email.length === 5) {
                throw 'Not recommended password';
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
});

const emailField = {
    name: 'email',
    rules: [
        {
            validator: (value, contextForm) => {
                console.log('contextForm', value)
                console.log('contextForm', contextForm)
                return value.includes('@')
            },
            asyncValidator: async (value, contextForm) => {
                await sleep(() => {
                    if (value.length < 3) {
                        throw 'Email is exist';
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
            validator: (value) => value.length > 6,
            error: 'Too short'
        }
    ],
}

const formOptions = {
    asyncFormValidator: async (contextForm) => {
        await sleep(() => {
            if (contextForm.email.length === 5) {
                throw 'Not recommended password';
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

function App() {
    // const [state, send] = useMachine(formMachine);
    const [fields, formMeta] = useXFormState('auth', [emailField, passwordField], formOptions);
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
    );
}

export default App;
