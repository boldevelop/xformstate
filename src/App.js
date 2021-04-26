import './App.css';
import {xFormMachine} from './xformstate';
import {useMachine} from "@xstate/react";

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
    asyncRules: [],
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

function App() {
    const [state, send] = useMachine(formMachine);

    const onChange = (name, value) => {
        send('TYPE', {name, value});
    }

    const onChangeEmail = (e) => {
        onChange('email', e.target.value);
    }

    const onChangePassword = (e) => {
        onChange('password', e.target.value);
    }

    const onSubmit = (e) => {
        e.preventDefault();
        send('VALIDATE');
    }

    return (
        <div className="App">
            <form onSubmit={onSubmit}>
                <input type="text" value={state.context.email.value} onChange={onChangeEmail} placeholder="email"/>
                <p style={{color: 'red'}}>{state.context.email.error}</p>

                <input type="text" value={state.context.password.value} onChange={onChangePassword}
                       placeholder="password"/>
                <p style={{color: 'red'}}>{state.context.password.error}</p>

                <input type="submit" value="Submit" disabled={state.context.__loading}/>
                <p style={{color: 'red'}}>{state.context.__formError}</p>
            </form>
        </div>
    );
}

export default App;
