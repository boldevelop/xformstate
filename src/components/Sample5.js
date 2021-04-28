import {useXFormState} from "../xformstate-react";
import {Input} from "./Input";
import {Form} from "./Form";
import {useState} from "react";
import {sleep} from "../helpers";

const buttonStyle = {display: 'flex', justifyContent: 'space-between', width: 177};
const InputWrap = ({field, label, id}) => {
    const onChange = (e) => {
        field.onChange(e.target.value)
    }

    return (
        <Input label={label} id={id} value={field.value} onChange={onChange} placeholder={label}
               error={field.error}/>)
}
const ErrorMessage = ({error}) => <p style={{color: 'red', margin: 0}}>{error}</p>
const Loading = () => <p style={{margin: 0, fontSize: 12}}>Requesting...</p>;
const Buttons = ({loading, clearFields}) => (
    <div style={buttonStyle}>
        <input type="submit" value="Submit" disabled={loading}/>
        <button onClick={clearFields} disabled={loading}>Clear field</button>
    </div>
);
const FormValue = ({submittedValue}) => (
    <pre>
        {JSON.stringify(submittedValue)}
    </pre>
);

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

const code = `
// fields
{
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

{
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

{
  name: 'passwordRepeat',
  initialValue: '',
  rules: [
    {
      validator: (value, contextForm) => value === contextForm.password,
      error: 'Passwords do not match'
    }
  ],
}

// form
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

`;

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
    const {onSubmit, loading, error, clearFields} = formMeta;

    const onFormSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    }

    return (
        <Form title={<>Использование все вместе</>} onSubmit={onFormSubmit} code={code}>
            <InputWrap label="Email" id="email" field={email}/>

            <InputWrap label="Password" id="password" field={password}/>

            <InputWrap label="Password repeat" id="password-2" field={passwordRepeat}/>

            {loading && <Loading/>}
            <Buttons loading={loading} clearFields={clearFields}/>

            {error && <ErrorMessage error={error}/>}


            {submittedValue && <FormValue submittedValue={submittedValue} />}
        </Form>
    )
}