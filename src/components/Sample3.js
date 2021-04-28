import {useXFormState} from "../xformstate-react";
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
            error: 'Email should have @'
        }
    ],
}

const code = `
const submitForm = (contextForm) => {
  contextForm.email += 'gmail.com'
  setSubmittedValue(contextForm)
};

`;

export const Sample3 = () => {
    const [submittedValue, setSubmittedValue] = useState(null);
    const submitForm = (contextForm) => {
        contextForm.email += 'gmail.com'
        setSubmittedValue(contextForm)
    };

    const [fields, formMeta] = useXFormState('auth-3', [emailField], {submitForm});
    const {email} = fields;
    const {onSubmit, loading} = formMeta;

    const onChangeEmail = (e) => {
        email.onChange(e.target.value);
    }

    const onFormSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    }

    return (
        <Form
            title={<>Модифицирование данных формы <br/> после прохождения валидации<br/> с помощью <b>submitForm</b></>}
            onSubmit={onFormSubmit}
            code={code}
        >
            <Input label="Email" id="email" value={email.value} onChange={onChangeEmail} placeholder="email"
                   error={email.error}/>

            <input type="submit" value="Submit" disabled={loading}/>

            {submittedValue && (
                <pre>
                    {JSON.stringify(submittedValue)}
                </pre>
            )}
        </Form>
    )
}