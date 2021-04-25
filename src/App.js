import './App.css';
import {xFormMachine} from './xformstate';
import {useMachine} from "@xstate/react";

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function sleep(fn, ...args) {
    await timeout(3000);
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
                    console.log('ok im done with it')
                })
            },
            error: 'Incorrect email'
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
}], 'asyncFormValidator');

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

                <input type="text" value={state.context.password.value} onChange={onChangePassword} placeholder="password"/>
                <p style={{color: 'red'}}>{state.context.password.error}</p>

                <input type="submit" value="Submit"/>
            </form>
        </div>
    );
}

export default App;
